// physics.worker.js — hand-rolled physics, no external deps
var FIXED_DT = 1/60;
var body = null, engineDefs = [], active = {up:false,down:false,left:false,right:false};
var stepTime = 0, generation = 0;

function initBody(craftData) {
  var n = craftData.unite.length, comX = 0, comY = 0;
  for (var i = 0; i < n; i++) { comX += craftData.unite[i].x; comY += craftData.unite[i].y; }
  comX /= n; comY /= n;
  var inertia = 0;
  for (var i = 0; i < n; i++) {
    var dx = craftData.unite[i].x - comX, dy = craftData.unite[i].y - comY;
    inertia += dx*dx + dy*dy;
  }
  body = { mass:n, inertia:inertia, px:0, py:0, vx:0, vy:0, rotation:0, angVel:0 };
  engineDefs = craftData.engines.map(function(e) {
    var angle = 0.5 * Math.PI * e.dir;
    var fx = -200*e.len*Math.cos(angle), fy = -200*e.len*Math.sin(angle);
    var epx = e.x-comX, epy = e.y-comY;
    return { name:e.name, fx:fx, fy:fy, torque:epx*fy - epy*fx };
  });
  stepTime = 0; active = {up:false,down:false,left:false,right:false};
}

function doStep() {
  if (!body) return;
  var fxSum=0, fySum=0, tqSum=0;
  for (var i=0; i<engineDefs.length; i++) {
    var e=engineDefs[i]; if (!active[e.name]) continue;
    fxSum+=e.fx; fySum+=e.fy; tqSum+=e.torque;
  }
  var rotRad = body.rotation * Math.PI/180;
  var cos=Math.cos(rotRad), sin=Math.sin(rotRad);
  body.vx       += (fxSum*cos - fySum*sin) / body.mass    * FIXED_DT;
  body.vy       += (fxSum*sin + fySum*cos) / body.mass    * FIXED_DT;
  body.angVel   += tqSum / body.inertia                   * FIXED_DT;
  body.px       += body.vx      * FIXED_DT;
  body.py       += body.vy      * FIXED_DT;
  body.rotation += body.angVel  * FIXED_DT;
  stepTime      += FIXED_DT;
  var spd = Math.sqrt(body.vx*body.vx + body.vy*body.vy);
  postMessage({ type:'state', x:body.px, y:body.py, vx:body.vx, vy:body.vy,
    rotation:body.rotation, fac:body.rotation+90, spd:spd,
    vag:Math.atan2(body.vy,body.vx)*180/Math.PI, rotaVelo:body.angVel,
    time:stepTime, gen:generation });
}

self.onmessage = function(event) {
  var msg = event.data;
  if (msg.type==='init') {
    initBody(msg.craftData);
  }
  else if (msg.type==='step') { doStep(); }
  else if (msg.type==='setEngines') { active = msg.engines; }
  else if (msg.type==='reset') {
    generation++;
    if (body) { body.px=body.py=body.vx=body.vy=body.rotation=body.angVel=0; }
    active={up:false,down:false,left:false,right:false}; stepTime=0;
    postMessage({type:'resetAck', gen:generation});
  }
};
