// physics.worker.js — Rapier.js physics in a dedicated thread
// Runs at 100 Hz (10 ms / step), posts state to main thread each step.
// Messages in:  {type:'init', craftData}  |  {type:'setEngines', engines:{up,down,left,right}}
//               {type:'reset'}
// Messages out: {type:'state', x,y,vx,vy,rotation,fac,spd,vag,rotaVelo,time,gen}
//               {type:'resetAck', gen}
//               {type:'error', msg}

importScripts('https://cdn.jsdelivr.net/npm/@dimforge/rapier2d-compat@0.12.0/rapier.min.js')

var FIXED_DT = 0.010

RAPIER.init().then(function() {

  var world       = null
  var craftBody   = null
  var engineDefs  = []    // [{name, fx, fy, px, py}] in body-local frame
  var active      = { up:false, down:false, left:false, right:false }
  var stepTime    = 0
  var generation  = 0     // bumped on reset; stale messages discarded by main thread

  // ── Build Rapier world from craft model data ───────────────────────────
  function buildWorld(craftData) {
    if (world) { world.free(); world = null }

    world = new RAPIER.World({ x:0, y:0 })
    world.timestep = FIXED_DT

    // Centre-of-mass (same formula as the old buildCraft)
    var n = craftData.unite.length
    var comX = 0, comY = 0
    for (var i = 0; i < n; i++) { comX += craftData.unite[i].x; comY += craftData.unite[i].y }
    comX /= n; comY /= n

    // Dynamic rigid body; Rapier's body.translation() == world-space COM
    craftBody = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 0)
    )

    // One 1×1 cuboid collider per block → sets mass distribution & inertia
    for (var i = 0; i < n; i++) {
      world.createCollider(
        RAPIER.ColliderDesc
          .cuboid(0.5, 0.5)
          .setTranslation(craftData.unite[i].x - comX, craftData.unite[i].y - comY)
          .setDensity(1.0)
          .setFriction(0)
          .setRestitution(0),
        craftBody
      )
    }

    // Pre-compute engine forces in body-local frame
    // Force formula: (-200*len, 0) rotated by (0.5*PI*dir) — same as old buildCraft
    engineDefs = craftData.engines.map(function(e) {
      var angle = 0.5 * Math.PI * e.dir
      return {
        name: e.name,
        fx:   -200 * e.len * Math.cos(angle),
        fy:   -200 * e.len * Math.sin(angle),
        px:   e.x - comX,   // engine attachment point relative to COM
        py:   e.y - comY
      }
    })

    stepTime = 0
    active   = { up:false, down:false, left:false, right:false }
  }

  // ── One physics step ──────────────────────────────────────────────────
  function doStep() {
    if (!craftBody) return

    var rot = craftBody.rotation()          // radians (CCW positive)
    var cos = Math.cos(rot)
    var sin = Math.sin(rot)
    var pos = craftBody.translation()

    // Apply active engine forces (body frame → world frame)
    for (var i = 0; i < engineDefs.length; i++) {
      var e = engineDefs[i]
      if (!active[e.name]) continue

      var wfx = e.fx * cos - e.fy * sin    // force in world frame
      var wfy = e.fx * sin + e.fy * cos

      var wpx = e.px * cos - e.py * sin + pos.x  // attachment point in world frame
      var wpy = e.px * sin + e.py * cos + pos.y

      craftBody.addForceAtPoint({ x:wfx, y:wfy }, { x:wpx, y:wpy }, true)
    }

    world.step()
    stepTime += FIXED_DT

    var p   = craftBody.translation()
    var v   = craftBody.linvel()
    var r   = craftBody.rotation()
    var w   = craftBody.angvel()
    var spd = Math.sqrt(v.x*v.x + v.y*v.y)
    var rotDeg = r * 180 / Math.PI

    postMessage({
      type:     'state',
      x:        p.x,
      y:        p.y,
      vx:       v.x,
      vy:       v.y,
      rotation: rotDeg,
      fac:      rotDeg + 90,
      spd:      spd,
      vag:      Math.atan2(v.y, v.x) * 180 / Math.PI,
      rotaVelo: w * 180 / Math.PI,
      time:     stepTime,
      gen:      generation
    })
  }

  setInterval(doStep, FIXED_DT * 1000)

  // ── Message handler ───────────────────────────────────────────────────
  self.onmessage = function(event) {
    var msg = event.data
    if (msg.type === 'init') {
      buildWorld(msg.craftData)
    } else if (msg.type === 'setEngines') {
      active = msg.engines
    } else if (msg.type === 'reset') {
      generation++
      if (craftBody) {
        craftBody.setTranslation({ x:0, y:0 }, true)
        craftBody.setLinvel(    { x:0, y:0 }, true)
        craftBody.setRotation(0,              true)
        craftBody.setAngvel(  0,              true)
      }
      active   = { up:false, down:false, left:false, right:false }
      stepTime = 0
      postMessage({ type:'resetAck', gen:generation })
    }
  }

}).catch(function(err) {
  postMessage({ type:'error', msg: String(err) })
})
