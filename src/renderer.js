import * as THREE from 'three';

export const profiles = {
  high: { label: '精细', dpr: 1.5, shadow: 4096, samples: 4 },
  balanced: { label: '均衡', dpr: 1, shadow: 2048, samples: 4 },
};

export function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', stencil: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.info.autoReset = false;
  container.appendChild(renderer.domElement);
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4, depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedIntType) });
  const material = new THREE.ShaderMaterial({
    uniforms: { image: { value: target.texture }, depth: { value: target.depthTexture }, pixel: { value: new THREE.Vector2() }, nearPlane: { value: .1 }, farPlane: { value: 600 } },
    vertexShader: `varying vec2 screenUv; void main(){screenUv = uv; gl_Position = vec4(position.xy,0.0,1.0);}`,
    fragmentShader: `
      uniform sampler2D image, depth;
      uniform vec2 pixel;
      uniform float nearPlane, farPlane;
      varying vec2 screenUv;
      float worldDepth(vec2 coord){float sampled=texture2D(depth,coord).r;return nearPlane*farPlane/(farPlane-sampled*(farPlane-nearPlane));}
      void main(){
        vec3 center=texture2D(image,screenUv).rgb;
        float centerDepth=worldDepth(screenUv);
        float closest=min(min(worldDepth(screenUv+vec2(pixel.x,0)),worldDepth(screenUv-vec2(pixel.x,0))),min(worldDepth(screenUv+vec2(0,pixel.y)),worldDepth(screenUv-vec2(0,pixel.y))));
        float edge=smoothstep(.028,.17,(centerDepth-closest)/max(closest,.1))*(1.0-smoothstep(15.0,42.0,closest));
        center=mix(center,center*vec3(.53,.51,.63),edge*.18);
        float lightness=dot(center,vec3(.2126,.7152,.0722));
        vec3 halo=texture2D(image,screenUv+pixel*2.0).rgb+texture2D(image,screenUv-pixel*2.0).rgb;
        center+=max(halo*.5-1.1,0.0)*.025;
        center*=mix(vec3(.95,.97,1.055),vec3(1.01,1.0,.98),smoothstep(.16,.76,lightness));
        center=max(center,0.0);
        vec3 knee=vec3(.81);
        center=min(center,knee)+.19*(1.0-exp(-max(center-knee,0.0)/.19));
        gl_FragColor=vec4(center,1.0);
        #include <colorspace_fragment>
      }
    `,
    depthTest: false, depthWrite: false,
  });
  const screen = new THREE.Scene();
  screen.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  const screenCamera = new THREE.Camera();
  let activeProfile = profiles.high;
  const size = new THREE.Vector2();
  return {
    renderer,
    setQuality(name, sun) {
      activeProfile = profiles[name];
      target.samples = Math.min(activeProfile.samples, renderer.capabilities.maxSamples);
      target.dispose();
      sun.shadow.map?.dispose(); sun.shadow.map = null;
      sun.shadow.mapSize.set(activeProfile.shadow, activeProfile.shadow);
      renderer.shadowMap.needsUpdate = true;
    },
    resize(width, height) {
      renderer.setPixelRatio(Math.min(devicePixelRatio, activeProfile.dpr));
      renderer.setSize(width, height);
      renderer.getDrawingBufferSize(size);
      target.setSize(size.x, size.y);
      material.uniforms.pixel.value.set(1 / size.x, 1 / size.y);
      return size.toArray();
    },
    render(scene, camera) {
      renderer.info.reset();
      material.uniforms.nearPlane.value = camera.near;
      material.uniforms.farPlane.value = camera.far;
      renderer.setRenderTarget(target); renderer.render(scene, camera);
      renderer.setRenderTarget(null); renderer.render(screen, screenCamera);
    },
    get profile() { return activeProfile; },
    get samples() { return target.samples; },
  };
}

export function addLight(scene) {
  const sun = new THREE.DirectionalLight('#fff0d4', 2.5);
  sun.position.set(-30, 27, 39);
  sun.target.position.set(0, 1, -4);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -29, right: 29, top: 27, bottom: -27, near: 1, far: 150 });
  sun.shadow.bias = -.00025; sun.shadow.normalBias = .022;
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight('#b9cddd', '#c8b49d', 1.45));
  scene.fog = new THREE.FogExp2('#bfd3d9', .0045);
  const skyMaterial = new THREE.ShaderMaterial({
    vertexShader: `varying vec3 direction; void main(){direction=position;vec4 clip=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_Position=clip.xyww;}`,
    fragmentShader: `
      varying vec3 direction;
      float noise(vec2 coord){return sin(coord.x*.83+sin(coord.y*1.17))*.5+sin(coord.y*.68+cos(coord.x*.53))*.25+sin(coord.x*2.4+coord.y*.8)*.125;}
      void main(){vec3 ray=normalize(direction);float height=max(ray.y,0.0);vec3 color=mix(vec3(.64,.79,.87),vec3(.19,.43,.70),smoothstep(0.0,.65,height));vec2 clouds=ray.xz/(height+.14);float cloud=smoothstep(.20,.64,noise(clouds*vec2(1.1,5.6)))*smoothstep(.02,.17,height);color=mix(color,vec3(1.0,.986,.954),cloud*.76);gl_FragColor=vec4(color,1.0);}
    `,
    side: THREE.BackSide, depthWrite: false,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 24, 12), skyMaterial);
  sky.frustumCulled = false; sky.renderOrder = -10;
  scene.add(sky);
  return { sun, sky };
}
