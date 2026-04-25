// physics.rapier.worker.js — Rapier2D via Skypack (module worker)
// If this fails to load, index.html falls back to physics.worker.js

import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier2d-compat';

self.addEventListener('unhandledrejection', function(e) {
  postMessage({ type:'error', msg: String(e.reason) });
});

try {
  await RAPIER.init();
} catch(e) {
  postMessage({ type:'error', msg: 'RAPIER.init failed: ' + e });
  throw e;
}

const FIXED_DT = 0.010;
let world = null, craftBody = null, engineDefs = [];
let active = { up:false, down:false, left:false, right:false };
let stepTime = 0, generation = 0;

function buildWorld(craftData) {
  if (world) { world.free(); world = null; }

  world = new RAPIER.World({ x:0, y:0 });
  world.timestep = FIXED_DT;

  const n = craftData.unite.length;
  let comX = 0, comY = 0;
  for (let i = 0; i < n; i++) { comX += craftData.unite[i].x; comY += craftData.unite[i].y; }
  comX /= n; comY /= n;

  craftBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 0)
  );
  for (let i = 0; i < n; i++) {
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(0.5, 0.5)
        .setTranslation(craftData.unite[i].x - comX, craftData.unite[i].y - comY)
        .setDensity(1.0).setFriction(0).setRestitution(0),
      craftBody
    );
  }

  engineDefs = craftData.engines.map(e => {
    const angle = 0.5 * Math.PI * e.dir;
    return {
      name: e.name,
      fx: -200 * e.len * Math.cos(angle),
      fy: -200 * e.len * Math.sin(angle),
      px: e.x - comX, py: e.y - comY
    };
  });

  stepTime = 0;
  active = { up:false, down:false, left:false, right:false };
  postMessage({ type:'ready', engine:'rapier' });
}

function doStep() {
  if (!craftBody) return;
  const rot = craftBody.rotation();
  const cos = Math.cos(rot), sin = Math.sin(rot);
  const pos = craftBody.translation();
  for (const e of engineDefs) {
    if (!active[e.name]) continue;
    craftBody.addForceAtPoint(
      { x: e.fx*cos - e.fy*sin, y: e.fx*sin + e.fy*cos },
      { x: e.px*cos - e.py*sin + pos.x, y: e.px*sin + e.py*cos + pos.y },
      true
    );
  }
  world.step();
  stepTime += FIXED_DT;
  const p = craftBody.translation(), v = craftBody.linvel();
  const r = craftBody.rotation(), w = craftBody.angvel();
  const rotDeg = r * 180 / Math.PI;
  postMessage({
    type:'state', x:p.x, y:p.y, vx:v.x, vy:v.y,
    rotation:rotDeg, fac:rotDeg+90,
    spd:Math.sqrt(v.x*v.x+v.y*v.y),
    vag:Math.atan2(v.y,v.x)*180/Math.PI,
    rotaVelo:w*180/Math.PI, time:stepTime, gen:generation
  });
}

setInterval(doStep, FIXED_DT * 1000);

self.onmessage = function(event) {
  const msg = event.data;
  if (msg.type==='init') { buildWorld(msg.craftData); }
  else if (msg.type==='setEngines') { active = msg.engines; }
  else if (msg.type==='reset') {
    generation++;
    if (craftBody) {
      craftBody.setTranslation({x:0,y:0},true); craftBody.setLinvel({x:0,y:0},true);
      craftBody.setRotation(0,true); craftBody.setAngvel(0,true);
    }
    active={up:false,down:false,left:false,right:false}; stepTime=0;
    postMessage({type:'resetAck', gen:generation});
  }
};
