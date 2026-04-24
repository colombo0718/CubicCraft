// physics.worker.js — hand-rolled physics in a dedicated thread
// No external dependencies. Same integration math as the original buildCraft.
//
// Messages in:  {type:'init', craftData}
//               {type:'setEngines', engines:{up,down,left,right}}
//               {type:'reset'}
// Messages out: {type:'state', x,y,vx,vy,rotation,fac,spd,vag,rotaVelo,time,gen}
//               {type:'resetAck', gen}

var FIXED_DT = 0.010

var body      = null   // {mass, inertia, px, py, vx, vy, rotation, angVel}
var engineDefs = []    // [{name, fx, fy, torque}] — body-frame, precomputed
var active    = { up:false, down:false, left:false, right:false }
var stepTime  = 0
var generation = 0

// Build physics body from craft model data (same formula as old buildCraft)
function initBody(craftData) {
  var n = craftData.unite.length
  var comX = 0, comY = 0
  for (var i = 0; i < n; i++) { comX += craftData.unite[i].x; comY += craftData.unite[i].y }
  comX /= n; comY /= n

  var inertia = 0
  for (var i = 0; i < n; i++) {
    var dx = craftData.unite[i].x - comX
    var dy = craftData.unite[i].y - comY
    inertia += dx * dx + dy * dy
  }

  body = { mass: n, inertia: inertia, px: 0, py: 0, vx: 0, vy: 0, rotation: 0, angVel: 0 }

  // Pre-compute body-frame forces and torques
  // Force formula: (-200*len, 0) rotated by (0.5*PI*dir) — same as old buildCraft
  // Torque:        p × F  (body frame cross product, same as old fire.torqu)
  engineDefs = craftData.engines.map(function(e) {
    var angle = 0.5 * Math.PI * e.dir
    var fx = -200 * e.len * Math.cos(angle)
    var fy = -200 * e.len * Math.sin(angle)
    var epx = e.x - comX
    var epy = e.y - comY
    return { name: e.name, fx: fx, fy: fy, torque: epx * fy - epy * fx }
  })

  stepTime = 0
  active   = { up:false, down:false, left:false, right:false }
}

function doStep() {
  if (!body) return

  // Sum active engine forces + torques (body frame)
  var fxSum = 0, fySum = 0, tqSum = 0
  for (var i = 0; i < engineDefs.length; i++) {
    var e = engineDefs[i]
    if (!active[e.name]) continue
    fxSum += e.fx; fySum += e.fy; tqSum += e.torque
  }

  // Rotate body-frame force to world frame (same as craft.accelera.rotateDeg)
  var rotRad = body.rotation * Math.PI / 180
  var cos = Math.cos(rotRad), sin = Math.sin(rotRad)
  var wfx = fxSum * cos - fySum * sin
  var wfy = fxSum * sin + fySum * cos

  // Integrate — exact same scheme as the original craft.run(dt)
  body.vx       += (wfx / body.mass)    * FIXED_DT
  body.vy       += (wfy / body.mass)    * FIXED_DT
  body.angVel   += (tqSum / body.inertia) * FIXED_DT
  body.px       += body.vx    * FIXED_DT
  body.py       += body.vy    * FIXED_DT
  body.rotation += body.angVel * FIXED_DT
  stepTime      += FIXED_DT

  var spd = Math.sqrt(body.vx * body.vx + body.vy * body.vy)

  postMessage({
    type:     'state',
    x:        body.px,
    y:        body.py,
    vx:       body.vx,
    vy:       body.vy,
    rotation: body.rotation,
    fac:      body.rotation + 90,
    spd:      spd,
    vag:      Math.atan2(body.vy, body.vx) * 180 / Math.PI,
    rotaVelo: body.angVel,
    time:     stepTime,
    gen:      generation
  })
}

setInterval(doStep, FIXED_DT * 1000)

self.onmessage = function(event) {
  var msg = event.data
  if (msg.type === 'init') {
    initBody(msg.craftData)
  } else if (msg.type === 'setEngines') {
    active = msg.engines
  } else if (msg.type === 'reset') {
    generation++
    if (body) {
      body.px = 0; body.py = 0
      body.vx = 0; body.vy = 0
      body.rotation = 0; body.angVel = 0
    }
    active   = { up:false, down:false, left:false, right:false }
    stepTime = 0
    postMessage({ type:'resetAck', gen:generation })
  }
}
