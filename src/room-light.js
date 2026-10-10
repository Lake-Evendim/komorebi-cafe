import * as THREE from 'three';

export function addCafeLighting(kit,colors) {
  const graphite=colors.get('#37413d'),steel=colors.get('#9caaa3');
  const lens=colors.get('#fff0d7',{emissive:'#ffe8c7',emissiveIntensity:.45});
  kit.box([4.8,.038,.050],[3.0,3.08,-3.04],graphite,.006);
  for(const centerX of [.68,5.32])kit.rod([centerX,3.10,-3.04],[centerX,3.26,-3.04],.012,steel,10);
  const fixtures=[];
  for(const [centerX,depth,targetX] of [[2.20,-3.04,2.22],[4.72,-3.04,4.50]]){
    const origin=new THREE.Vector3(centerX,2.937,depth);
    const target=new THREE.Vector3(targetX,1.22,-3.52),direction=target.clone().sub(origin).normalize();
    const center=origin.clone().addScaledVector(direction,-.072);
    const rotation=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().negate())).toArray().slice(0,3);
    kit.box([.11,.045,.068],[centerX,3.05,depth],graphite,.009);
    kit.rod([centerX,3.03,depth],center.toArray(),.012,steel,10);
    kit.cylinder(.060,.065,.14,center.toArray(),graphite,28,rotation);
    kit.cylinder(.055,.055,.006,origin.toArray(),lens,28,rotation);
    const light=new THREE.SpotLight('#ffedd5',9,4.2,Math.PI*.27,.94,2);
    light.position.copy(origin).addScaledVector(direction,.004);light.target.position.copy(target);
    light.name='Track spot from visible recessed lens';light.userData.fixture='ceiling track cylinder';
    kit.scene.add(light,light.target);
    fixtures.push({type:light.userData.fixture,position:light.position.toArray()});
  }
  for(const [centerX,width] of [[1.255,1.43],[4.58,1.86]]){
    const light=new THREE.SpotLight('#fff0da',1.7,2.6,Math.PI*.38,.97,2);
    light.position.set(centerX,1.850,-3.56);light.target.position.set(centerX,1.15,-3.53);
    light.name='Worktop light from shelf underside LED';light.userData.fixture='existing shelf underside light strip';
    kit.scene.add(light,light.target);fixtures.push({type:light.userData.fixture,position:light.position.toArray(),width});
  }
  return {fixtures,trackLights:2,shelfLights:2};
}

export function shadeRoom(scene) {
  const materials=new Set();
  const enclosedMaterials=new Set();
  const room=new THREE.Box3(new THREE.Vector3(-2.04,.27,-4.03),new THREE.Vector3(5.98,3.40,2.51));
  scene.updateMatrixWorld(true);
  scene.traverse(object=>{
    if(!object.material||!object.geometry||object.isInstancedMesh)return;
    object.geometry.computeBoundingBox();
    const intersects=object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld).intersectsBox(room);
    for(const material of Array.isArray(object.material)?object.material:[object.material]){materials.add(material);if(intersects)enclosedMaterials.add(material);}
  });
  for(const material of materials) {
    if(!material.isMeshToonMaterial&&!material.isMeshStandardMaterial)continue;
    const previous=material.onBeforeCompile.bind(material), cacheKey=material.customProgramCacheKey.bind(material);
    const key=cacheKey();
    material.onBeforeCompile=shader=>{
      previous(shader);
      if(!enclosedMaterials.has(material)){
        const daylight=THREE.ShaderChunk.lights_fragment_begin.replace('#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )','#if 0').replace('#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )','#if 0');
        shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',daylight);
        return;
      }
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 roomWorldPosition;').replace('#include <project_vertex>',`#include <project_vertex>
        vec4 roomPosition = vec4(transformed,1.0);
        #ifdef USE_INSTANCING
          roomPosition = instanceMatrix * roomPosition;
        #endif
        roomWorldPosition = (modelMatrix * roomPosition).xyz;`);
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
        varying vec3 roomWorldPosition;
        float roomAmount;
        float localLightAmount;
        float localLightBlend(){
          vec3 point=roomWorldPosition;
          return smoothstep(-2.035,-1.93,point.x)*(1.0-smoothstep(5.93,5.985,point.x))*smoothstep(-4.012,-3.945,point.z)*(1.0-smoothstep(2.40,2.49,point.z))*smoothstep(.27,.31,point.y)*(1.0-smoothstep(3.32,3.39,point.y));
        }
        float roomBlend(){
          vec3 point=roomWorldPosition;
          return smoothstep(-2.04,-1.88,point.x)*(1.0-smoothstep(5.80,5.98,point.x))*smoothstep(-4.03,-3.88,point.z)*(1.0-smoothstep(2.35,2.51,point.z))*smoothstep(.27,.34,point.y)*(1.0-smoothstep(3.29,3.40,point.y));
        }
        float windowBounce(){
          return max(exp(-max(0.0,2.4-roomWorldPosition.z)*.46)*.23,exp(-max(0.0,roomWorldPosition.x+1.95)*.54)*.21);
        }`);
      shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nroomAmount=roomBlend();localLightAmount=localLightBlend();');
      const roomLights=THREE.ShaderChunk.lights_fragment_begin.replace('getPointLightInfo( pointLight, geometryPosition, directLight );','getPointLightInfo( pointLight, geometryPosition, directLight );\n directLight.color *= localLightAmount;').replace('getSpotLightInfo( spotLight, geometryPosition, directLight );','getSpotLightInfo( spotLight, geometryPosition, directLight );\n directLight.color *= localLightAmount;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',roomLights);
      if(material.isMeshToonMaterial) {
        shader.fragmentShader=shader.fragmentShader.replace('#include <lights_toon_pars_fragment>',`#include <lights_toon_pars_fragment>
          #undef RE_Direct
          void RE_Direct_Room(const in IncidentLight directLight,const in vec3 geometryPosition,const in vec3 geometryNormal,const in vec3 geometryViewDir,const in vec3 geometryClearcoatNormal,const in ToonMaterial material,inout ReflectedLight reflectedLight){
            vec3 shading=mix(getGradientIrradiance(geometryNormal,directLight.direction),vec3(max(dot(geometryNormal,directLight.direction),0.0)),roomAmount);
            reflectedLight.directDiffuse+=shading*directLight.color*BRDF_Lambert(material.diffuseColor);
          }
          #define RE_Direct RE_Direct_Room`);
      }
      shader.fragmentShader=shader.fragmentShader.replace('#include <aomap_fragment>',`#include <aomap_fragment>
        float enclosed=roomAmount;
        reflectedLight.indirectDiffuse*=mix(1.0,.74+windowBounce(),enclosed);
        reflectedLight.indirectSpecular*=mix(1.0,.80,enclosed);`);
    };
    material.customProgramCacheKey=()=>key+':local-light-volume-v8:'+enclosedMaterials.has(material);
    material.needsUpdate=true;
  }
  return {indoorAmbient:'daylight and sky diffuse, without invisible window spots',localLightMask:'point and spot contributions restricted to cafe interior, exterior-only materials skip local loops',windowFillLights:0,unattachedLocalLights:0,pendantLights:3,shadows:'cached directional only; fixture lights use bounded cones without extra shadow maps'};
}
