// physics.worker.js — Rapier2D in a module Web Worker
// Load via: new Worker('./physics.worker.js', {type:'module'})
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier2d-compat';

await RAPIER.init();

const FIXED_DT = 0.010;

let world      = null;
let craftBody  = null;
let engineDefs = [];
let active     = { up:false, down:false, left:false, right:false };
let stepTime   = 0;
let generation = 0;

function buildWorld(craftData) {
  if (world) { world.free(); world = null; }

  world = new RAPIER.World({ x:0, y:0 });
  world.timestep = FIXED_DT;

  const n = craftData.unite.length;
  let comX = 0, comY = 0;
  for (let i = 0; i < n; i++) { comX += craftData.unite[i].x; comY += craftData.unite[i].y; }
  comX /= n;  comY /= n;

  craftBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 0)
  );

  for (let i = 0; i < n; i++) {
    world.createCollider(
      RAPIER.ColliderDesc
        .cuboid(0.5, 0.5)
        .setTranslation(craftData.unite[i].x - comX, craftData.unite[i].y - comY)
        .setDensity(1.0)
        .setFriction(0)
        .setRestitution(0),
      craftBody
    );
  }

  engineDefs = craftData.engines.map(e => {
    const angle = 0.5 * Math.PI * e.dir;
    return {
      name: e.name,
      fx: -200 * e.len * Math.cos(angle),
      fy: -200 * e.len * Math.sin(angle),
      px: e.x - comX,
      py: e.y - comY
    };
  });

  stepTime = 0;
  active   = { up:false, down:false, left:false, right:false };
}

function doStep() {
  if (!craftBody) return;

  const rot = craftBody.rotation();
  const cos = Math.cos(rot), sin = Math.sin(rot);
  const pos = craftBody.translation();

  for (const e of engineDefs) {
    if (!active[e.name]) continue;
    const wfx = e.fx * cos - e.fy * sin;
    const wfy = e.fx * sin + e.fy * cos;
    const wpx = e.px * cos - e.py * sin + pos.x;
    const wpy = e.px * sin + e.py * cos + pos.y;
    craftBody.addForceAtPoint({ x:wfx, y:wfy }, { x:wpx, y:wpy }, true);
  }

  world.step();
  stepTime += FIXED_DT;

  const p = craftBody.translation();
  const v = craftBody.linvel();
  const r = craftBody.rotation();
  const w = craftBody.angvel();
  const rotDeg = r * 180 / Math.PI;

  postMessage({
    type:     'state',
    x:        p.x,  y:        p.y,
    vx:       v.x,  vy:       v.y,
    rotation: rotDeg,
    fac:      rotDeg + 90,
    spd:      Math.sqrt(v.x*v.x + v.y*v.y),
    vag:      Math.atan2(v.y, v.x) * 180 / Math.PI,
    rotaVelo: w * 180 / Math.PI,
    time:     stepTime,
    gen:      generation
  });
}

setInterval(doStep, FIXED_DT * 1000);

self.onmessage = function(event) {
  const msg = event.data;
  if (msg.type === 'init') {
    buildWorld(msg.craftData);
  } else if (msg.type === 'setEngines') {
    active = msg.engines;
  } else if (msg.type === 'reset') {
    generation++;
    if (craftBody) {
      craftBody.setTranslation({ x:0, y:0 }, true);
      craftBody.setLinvel(    { x:0, y:0 }, true);
      craftBody.setRotation(0, true);
      craftBody.setAngvel(  0, true);
    }
    active   = { up:false, down:false, left:false, right:false };
    stepTime = 0;
    postMessage({ type:'resetAck', gen:generation });
  }
};
