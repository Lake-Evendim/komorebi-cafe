import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createRenderer, addLight } from './renderer.js';
import { createWorld } from './world.js';
import { createInterface, viewCatalog } from './interface.js';
import './style.css';

const element = identifier => document.getElementById(identifier);
const shots = {
  corner: { position: [-7.8, 2.55, 11.8], target: [1.2, 2.55, .1] },
  detail: { position: [-4.1, 1.80, 7.8], target: [.55, 1.88, 2.52] },
  garden: { position: [-3.9, 3.0, 8.2], target: [.3, .55, 3.18] },
  water: { position: [-3.05, 1.28, 5.45], target: [-2.20, .48, 4.10] },
  inside: { position: [-.98, 1.64, 1.65], target: [2.75, 1.49, -.88] },
  roof: { position: [-5.8, 6.8, 8.8], target: [1.8, 4.5, -.2] },
  parking: { position: [-5.35,1.10,-.75],target: [-2.95,.53,.47] },
  booth: { position: [2.75,1.62,-.05],target: [4.85,1.24,1.34] },
  equipment: {position:[3.34,2.21,-3.22],target:[4.42,1.60,-1.88]},
  grinders: {position:[2.41,2.15,-2.89],target:[3.24,1.77,-2.02]},
  artwork: {position:[3.45,2.16,-.66],target:[5.79,2.13,-.66]},
  reading: {position:[.15,1.91,-1.22],target:[-1.70,1.75,-2.75]},
  cakes: {position:[-.90,1.79,.31],target:[.13,1.21,-1.79]},
  workflow: {position:[.13,2.10,-1.50],target:[3.1,1.30,-3.18]},
  coffee: {position:[2.81,2.38,-2.20],target:[2.81,2.38,-3.80]},
  umbrellas: {position:[-.39,1.31,.47],target:[-1.64,.83,1.75]},
  roadside: {position:[-16.8,2.75,8.7],target:[-8.8,1.70,.5]},
  rear: {position:[10.3,2.8,-5.6],target:[2.8,2.0,-1.8]},
};
const root = element('scene');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let pipeline;
let paused = preference.matches;
let dirty = true;
let time = 18;
let previous = null;
let frames = 0, windowStart = performance.now();
let currentShot = 'corner';
let resolution = [];
let quality = 'high';
let captureUrl = null;
let ui;
let cameraTransition = null;

function clean(enabled) {
  ui.closePanels();
  document.body.classList.toggle('clean', enabled); element('restore').hidden = !enabled;
  (enabled ? element('restore') : element('photo')).focus({preventScroll:true});
}

async function start() {
  const started = performance.now();
  pipeline = createRenderer(root);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 600);
  const lighting = addLight(scene);
  const controls = new OrbitControls(camera, pipeline.renderer.domElement);
  controls.enableDamping = !preference.matches; controls.dampingFactor = .10;
  controls.maxPolarAngle = Math.PI * .57; controls.minDistance = .18; controls.maxDistance = 80;
  const changeShot = (name, animate = true) => {
    if(!shots[name]) return;
    currentShot = name;
    if(animate && !preference.matches) {
      cameraTransition = { start: performance.now(), position: camera.position.clone(), target: controls.target.clone(), endPosition: new THREE.Vector3(...shots[name].position), endTarget: new THREE.Vector3(...shots[name].target) };
    }else{
      cameraTransition = null;
      camera.position.set(...shots[name].position); controls.target.set(...shots[name].target); controls.update();
    }
    ui.update(name);
    dirty = true;
  };
  ui = createInterface({
    onSelect: name => changeShot(name),
    onStep: direction => {
      const index = viewCatalog.findIndex(view => view.id === currentShot);
      changeShot(viewCatalog[(index + direction + viewCatalog.length) % viewCatalog.length].id);
    },
    onReset: () => changeShot(currentShot),
  });
  controls.addEventListener('start', () => { cameraTransition = null; });
  function resize() {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    resolution = pipeline.resize(innerWidth, innerHeight); dirty = true;
  }
  pipeline.setQuality(quality, lighting.sun); resize(); changeShot('corner', false);
  const world = await createWorld(scene, label => { element('loadLabel').textContent = label; });
  world.update(time);
  world.updateDetail(camera, resolution[1]);
  await pipeline.renderer.compileAsync(scene, camera);
  pipeline.render(scene, camera);
  element('loading').hidden = true;
  const buildMs = Math.round(performance.now() - started);
  controls.addEventListener('change', () => { dirty = true; });
  window.addEventListener('resize', resize);
  element('quality').addEventListener('change', event => {
    quality = event.target.value; pipeline.setQuality(quality, lighting.sun); resize();
  });
  const updatePause = () => {
    const label = paused ? '继续春风' : '暂停春风';
    element('pause').querySelector('.pause-label').textContent = label;
    element('pause').setAttribute('aria-label',label); element('pause').title = label;
    element('pause').setAttribute('aria-pressed', String(paused)); dirty = true;
  };
  updatePause();
  element('pause').addEventListener('click', () => { paused = !paused; updatePause(); });
  preference.addEventListener('change', event => { paused = event.matches; controls.enableDamping = !event.matches; updatePause(); });
  element('statsToggle').addEventListener('change', event => { element('metrics').hidden = !event.target.checked; });
  element('photo').addEventListener('click', () => clean(true)); element('restore').addEventListener('click', () => clean(false));
  window.addEventListener('keydown', event => { if (event.code === 'Escape' && document.body.classList.contains('clean')) clean(false); });
  element('save').addEventListener('click', () => {
    // Capture the intended view if a camera move is still in progress.
    if(cameraTransition) {
      camera.position.copy(cameraTransition.endPosition); controls.target.copy(cameraTransition.endTarget);
      cameraTransition = null; controls.update(); world.updateDetail(camera, resolution[1]); dirty = true;
    }
    pipeline.render(scene, camera);
    pipeline.renderer.domElement.toBlob(blob => {
      if (!blob) return;
      if (captureUrl) URL.revokeObjectURL(captureUrl);
      captureUrl = URL.createObjectURL(blob);
      element('preview').src = captureUrl;
      element('download').href = captureUrl;
      element('capture').showModal();
    }, 'image/png');
  });
  element('closeCapture').addEventListener('click', () => element('capture').close());
  document.addEventListener('visibilitychange', () => { previous = null; frames = 0; windowStart = performance.now(); if (!document.hidden) dirty = true; });
  let contextLost = false;
  pipeline.renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault(); contextLost = true; element('loading').hidden = false; element('loadLabel').textContent = '显卡连接中断，等待恢复或刷新页面';
  });
  pipeline.renderer.domElement.addEventListener('webglcontextrestored', () => { contextLost = false; pipeline.setQuality(quality, lighting.sun); resize(); element('loading').hidden = true; });
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden || contextLost) { previous = null; return; }
    const delta = previous === null ? 0 : (now - previous) / 1000; previous = now;
    if(cameraTransition) {
      const progress = Math.min(1,(now-cameraTransition.start)/780);
      const ease = progress < .5 ? 4*progress*progress*progress : 1-Math.pow(-2*progress+2,3)/2;
      camera.position.lerpVectors(cameraTransition.position,cameraTransition.endPosition,ease);
      controls.target.lerpVectors(cameraTransition.target,cameraTransition.endTarget,ease);
      dirty = true;
      if(progress === 1) cameraTransition = null;
    }
    controls.update();
    if (!paused) time += delta;
    if (!paused || dirty) {
      if (dirty) world.updateDetail(camera, resolution[1]);
      world.update(time); lighting.sky.position.copy(camera.position);
      pipeline.render(scene, camera); frames++; dirty = false;
    }
    if (now - windowStart > 1800) {
      const stats = { fps: Number((frames * 1000 / (now - windowStart)).toFixed(1)), calls: pipeline.renderer.info.render.calls, triangles: pipeline.renderer.info.render.triangles, resolution, samples: pipeline.samples, shadow: pipeline.profile.shadow, quality, shot: currentShot, paused, buildMs, build: world.report, threeRevision: THREE.REVISION };
      root.dataset.diagnostics = JSON.stringify(stats);
      element('metrics').textContent = `${stats.fps} FPS\n${resolution.join(' × ')} / MSAA ${stats.samples}×\n阴影 ${stats.shadow} / Three r${THREE.REVISION}\n${stats.calls} 次绘制 / ${(stats.triangles / 1000).toFixed(1)} 千三角形\n初次构建 ${(buildMs / 1000).toFixed(1)} s`;
      frames = 0; windowStart = now;
    }
  }
  windowStart = performance.now(); requestAnimationFrame(frame);
}

start().catch(error => { console.error(error); element('loading').hidden = false; element('loadLabel').textContent = `样片未能加载：${error.message}。请检查浏览器硬件加速。`; });

