import * as THREE from 'three';
import { seeded } from './kit.js';
import { petalCollision,petalPosition,petalContact } from './petal-collision.js';

const blossomAssets = new WeakMap();
const blossomConfigurations = [
  { position: [-.13, .04, -.035], rotation: [.36, -.56, .2], radius: .135 },
  { position: [.13, -.025, .01], rotation: [-.48, .42, 1.1], radius: .122 },
  { position: [.005, .16, .025], rotation: [.68, .37, -.5], radius: .115 },
  { position: [.005, -.13, -.065], rotation: [-.8, -.7, .6], radius: .10 },
];

function daylightOnly(shader) {
  const daylight=THREE.ShaderChunk.lights_fragment_begin.replace('#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )','#if 0').replace('#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )','#if 0');
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',daylight);
}

function makeBlossomSpray(detail = 2) {
  const vertices = [], pigments = [], indices = [];
  const outline = [[0, 0], [-.28, .42], [-.25, .89], [-.055, 1], [0, .85], [.055, 1], [.25, .89], [.28, .42]];
  const rootColor = new THREE.Color('#dca0b5'), tipColor = new THREE.Color('#fff0f2');
  const transform = new THREE.Object3D();
  const addVertex = (point, tint) => {
    const world = new THREE.Vector3(...point).applyMatrix4(transform.matrix);
    vertices.push(world.x, world.y, world.z);
    pigments.push(tint.r, tint.g, tint.b);
    return vertices.length / 3 - 1;
  };
  for (const configuration of blossomConfigurations) {
    transform.position.set(...configuration.position);
    transform.rotation.set(...configuration.rotation);
    transform.updateMatrix();
    for (let petal = 0; petal < 5; petal++) {
      const angle = petal * Math.PI * .4;
      const radius = configuration.radius;
      if (detail < 2) {
        const local = (width, length) => [
          (width * Math.cos(angle) + length * Math.sin(angle)) * radius,
          (length * Math.cos(angle) - width * Math.sin(angle)) * radius,
          radius * .30 * length * length,
        ];
        const base = addVertex(local(0, 0), rootColor);
        const left = addVertex(local(-.27, .54), tipColor);
        const right = addVertex(local(.27, .54), tipColor);
        if (detail === 1) {
          const tipLeft = addVertex(local(-.055, 1), tipColor);
          const tipRight = addVertex(local(.055, 1), tipColor);
          const notch = addVertex(local(0, .85), tipColor.clone().lerp(rootColor, .12));
          indices.push(base, left, notch, left, tipLeft, notch, base, notch, right, notch, tipRight, right);
        } else {
          const tip = addVertex(local(0, .94), tipColor);
          indices.push(base, left, tip, base, tip, right);
        }
        continue;
      }
      const center = addVertex([Math.sin(angle) * radius * .57, Math.cos(angle) * radius * .57, radius * .025], tipColor.clone().lerp(rootColor, .22));
      const boundary = outline.map(([width, length]) => addVertex([
        (width * Math.cos(angle) + length * Math.sin(angle)) * radius,
        (length * Math.cos(angle) - width * Math.sin(angle)) * radius,
        radius * (.30 * length * length - .08 * Math.abs(width)),
      ], rootColor.clone().lerp(tipColor, Math.min(1, length * 1.35))));
      for (let edge = 0; edge < boundary.length; edge++) indices.push(center, boundary[edge], boundary[(edge + 1) % boundary.length]);
    }
    if (detail === 0) continue;
    const center = addVertex([0, 0, .007], rootColor);
    const ring = [];
    for (let side = 0; side < 8; side++) {
      const angle = side * Math.PI / 4;
      ring.push(addVertex([Math.cos(angle) * .020, Math.sin(angle) * .020, .005], rootColor));
    }
    for (let side = 0; side < 8; side++) indices.push(center, ring[side], ring[(side + 1) % 8]);
    const pollen = new THREE.Color('#efd49c');
    for (let stamen = 0; stamen < (detail === 2 ? 5 : 0); stamen++) {
      const angle = stamen * Math.PI * .4;
      const centerX = Math.cos(angle) * .021, centerY = Math.sin(angle) * .021;
      const first = addVertex([centerX - .004, centerY - .003, .015], pollen);
      addVertex([centerX + .004, centerY - .003, .015], pollen);
      addVertex([centerX, centerY + .005, .019], pollen);
      indices.push(first, first + 1, first + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(pigments, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function getBlossomAssets(kit, colors) {
  if (!blossomAssets.has(kit)) {
    const material = new THREE.MeshToonMaterial({ color: '#fffafa', vertexColors: true, gradientMap: colors.ramp, side: THREE.DoubleSide, shadowSide: THREE.FrontSide });
    material.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', 'outgoingLight += diffuseColor.rgb * 0.16;\n#include <opaque_fragment>');
      daylightOnly(shader);
    };
    material.customProgramCacheKey = () => 'cupped-sakura-daylight';
    const stemPositions=[],stemNormals=[];
    for(const configuration of blossomConfigurations) {
      const start=new THREE.Vector3(0,0,-.08),end=new THREE.Vector3(...configuration.position);
      const direction=end.clone().sub(start),stem=new THREE.CylinderGeometry(0,.004,direction.length(),3,1,true);
      stem.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize()));
      stem.translate(...start.add(end).multiplyScalar(.5).toArray());
      const expanded=stem.toNonIndexed();stemPositions.push(...expanded.attributes.position.array);stemNormals.push(...expanded.attributes.normal.array);expanded.dispose();stem.dispose();
    }
    const stems=new THREE.BufferGeometry();stems.setAttribute('position',new THREE.Float32BufferAttribute(stemPositions,3));stems.setAttribute('normal',new THREE.Float32BufferAttribute(stemNormals,3));
    const stemMaterial=new THREE.MeshToonMaterial({color:'#80776b',gradientMap:colors.ramp});stemMaterial.onBeforeCompile=daylightOnly;stemMaterial.customProgramCacheKey=()=> 'sakura-pedicel-daylight';
    blossomAssets.set(kit, { geometries: [makeBlossomSpray(0), makeBlossomSpray(1), makeBlossomSpray(2)], material,stems,stemMaterial });
  }
  return blossomAssets.get(kit);
}

function taperedBranch(points, radii, steps=24, sides=9) {
  const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
  const frames = curve.computeFrenetFrames(steps, false);
  const vertices = [], coordinates = [], indices = [];
  for (let step = 0; step <= steps; step++) {
    const fraction = step / steps;
    const center = curve.getPointAt(fraction);
    const radius = radii[0] * Math.pow(1 - fraction, .85) + radii[1] * fraction;
    for (let side = 0; side <= sides; side++) {
      const angle = side / sides * Math.PI * 2;
      const displacement = frames.normals[step].clone().multiplyScalar(Math.cos(angle) * radius).addScaledVector(frames.binormals[step], Math.sin(angle) * radius);
      vertices.push(center.x + displacement.x, center.y + displacement.y, center.z + displacement.z);
      coordinates.push(side / sides, fraction * 4);
      if (step < steps && side < sides) {
        const current = step * (sides + 1) + side;
        indices.push(current, current + sides + 1, current + 1, current + 1, current + sides + 1, current + sides + 2);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(coordinates, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function makeSakura(kit, colors, textures, origin, scale, seed) {
  const random = seeded(seed);
  const bark = colors.get('#68574f');
  if (!bark.userData.sakuraBark) {
    bark.userData.sakuraBark = true;
    bark.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 branchPosition;').replace('#include <begin_vertex>', '#include <begin_vertex>\nbranchPosition = position;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 branchPosition;').replace('#include <color_fragment>', '#include <color_fragment>\nfloat ridges = sin(branchPosition.y * 18.0 + sin(branchPosition.x * 21.0 + branchPosition.z * 17.0) * 3.0);\ndiffuseColor.rgb *= 0.94 + ridges * 0.065;');
    };
    bark.customProgramCacheKey = () => 'original-sakura-bark';
  }
  const toWorld = point => point.map((value, axis) => origin[axis] + value * scale);
  const skeleton=[];
  const branch = (points, base, tip) => {
    const geometry = taperedBranch(points.map(toWorld), [base * scale, tip * scale]);
    kit.add(geometry, bark, [0, 0, 0]);
    geometry.dispose();
    const curve=new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...toWorld(point))));
    for(let sample=0;sample<=16;sample++)skeleton.push(curve.getPoint(sample/16));
    return curve;
  };
  branch([[0, 0, 0], [-.05, 1.2, .05], [-.38, 2.9, -.06], [-.20, 4.3, -.28], [.25, 5.5, -.48]], .35, .085);
  for (let root = 0; root < 6; root++) {
    const angle = root * Math.PI / 3;
    branch([[Math.cos(angle) * .65, .02, Math.sin(angle) * .65], [Math.cos(angle) * .3, .12, Math.sin(angle) * .3], [0, .42, 0]], .09, .2);
  }
  const clusters = [];
  for (let limb = 0; limb < 7; limb++) {
    const angle = limb * 2.39 + random() * .32;
    const reach = 2.45 + random() * 1.6;
    const startY = 2.65 + limb * .27;
    const center = [Math.cos(angle) * reach * .72 - .25, startY + 1.5, Math.sin(angle) * reach * .72];
    const tip = [Math.cos(angle) * reach - .20, startY + 2.00 + random() * .34, Math.sin(angle) * reach];
    branch([[-.30, startY, -.05], [Math.cos(angle) * .8 - .25, startY + .85, Math.sin(angle) * .8], center, tip], .17 - limb * .009, .019);
    for (let twig = 0; twig < 4; twig++) {
      const spread = angle + (twig - 1.5) * .57;
      const end = [tip[0] + Math.cos(spread) * (1.0 + random() * .6), tip[1] + (twig % 2 ? .37 : -.25) + random() * .45, tip[2] + Math.sin(spread) * (1.0 + random() * .6)];
      const fork = [center[0] * .72 + tip[0] * .28, center[1] * .72 + tip[1] * .28, center[2] * .72 + tip[2] * .28];
      branch([fork, [(fork[0] + end[0]) * .5, fork[1] + .3, (fork[2] + end[2]) * .5], end], .041, .005);
      for (let offshoot = 0; offshoot < 2; offshoot++) {
        const fineTip = [end[0] + Math.cos(spread + (offshoot - .5) * .9) * .43, end[1] + .36 + offshoot * .15, end[2] + Math.sin(spread + (offshoot - .5) * .9) * .43];
        branch([end, fineTip], .013, .0028);
      }
      clusters.push({ center: toWorld(end), radius: (.99 + random() * .34) * scale });
      if (twig % 2 === 0) clusters.push({ center: toWorld([(fork[0] + end[0]) * .52, (fork[1] + end[1]) * .5 + .35, (fork[2] + end[2]) * .52]), radius: .91 * scale });
    }
    clusters.push({ center: toWorld(tip), radius: 1.37 * scale });
    clusters.push({ center: toWorld([center[0], center[1] + .48, center[2]]), radius: 1.18 * scale });
  }
  clusters.push({ center: toWorld([.15, 6.15, -.3]), radius: 1.35 * scale });
  const attachmentCurves=[];
  for(const cluster of clusters) {
    const center=new THREE.Vector3(...cluster.center);
    const anchor=skeleton.reduce((nearest,point)=>point.distanceToSquared(center)<nearest.distanceToSquared(center)?point:nearest,skeleton[0]);
    cluster.anchor=anchor;
    cluster.curves=[];
    const phase=random()*Math.PI*2;
    for(let twig=0;twig<12;twig++) {
      const angle=phase+twig*Math.PI/6+(random()-.5)*.24;
      const reach=cluster.radius*(.59+random()*.49);
      const tip=center.clone().add(new THREE.Vector3(Math.cos(angle)*reach*1.05,((twig%3)-1)*reach*.38-.09*scale,Math.sin(angle)*reach));
      const middle=anchor.clone().lerp(tip,.52);middle.y+=.12*scale;
      const points=[anchor,middle,tip];
      const curve=new THREE.CatmullRomCurve3(points);
      const geometry=taperedBranch(points.map(point=>point.toArray()),[.012*scale,.0018*scale],8,4);
      kit.add(geometry,bark,[0,0,0]);geometry.dispose();cluster.curves.push(curve);attachmentCurves.push(curve);
    }
  }
  const spraysPerCluster = 92;
  const count = clusters.length * spraysPerCluster;
  const assets = getBlossomAssets(kit, colors);
  const bloom = new THREE.InstancedMesh(assets.geometries[2], assets.material, count);
  const transform = new THREE.Object3D();
  const normal = new THREE.Vector3(), up = new THREE.Vector3(0, 0, 1), stemOffset=new THREE.Vector3();
  const flowerSources=[],attachmentPoints=[];
  let instance = 0;
  for (const cluster of clusters) {
    for (let floret = 0; floret < spraysPerCluster; floret++) {
      const curve=cluster.curves[floret%cluster.curves.length];
      const along=.19+(.78*(Math.floor(floret/12)+.20+random()*.60)/8);
      const attachment=curve.getPoint(along);
      normal.copy(attachment).sub(cluster.anchor).normalize();normal.y+=.28;normal.normalize();
      transform.quaternion.setFromUnitVectors(up, normal);
      transform.rotateZ(random() * Math.PI * 2);
      transform.rotateX((random() - .5) * 1.1);
      transform.scale.setScalar((.79 + random() * .48) * scale);
      transform.position.copy(attachment).addScaledVector(stemOffset.copy(up).applyQuaternion(transform.quaternion),.08*transform.scale.x);
      transform.updateMatrix(); bloom.setMatrixAt(instance, transform.matrix);
      attachmentPoints.push(attachment.clone());
      if(floret%2===0)for(const configuration of blossomConfigurations)flowerSources.push(new THREE.Vector3(...configuration.position).applyMatrix4(transform.matrix));
      const inner=1-along;
      bloom.setColorAt(instance, new THREE.Color().setHSL(.95 + random() * .02, .035 + random() * .075, .87 + random() * .12-inner*.08));
      instance++;
    }
  }
  bloom.castShadow = true; bloom.receiveShadow = true;
  bloom.computeBoundingSphere(); bloom.name = 'Cupped five-petal sakura sprays';
  const stems=new THREE.InstancedMesh(assets.stems,assets.stemMaterial,count);stems.instanceMatrix.array.set(bloom.instanceMatrix.array);stems.computeBoundingSphere();stems.receiveShadow=true;stems.name='Attached blossom pedicels';kit.scene.add(stems);
  const levels = [0, 1].map(detail => new THREE.InstancedMesh(assets.geometries[detail], assets.material, count)).concat(bloom);
  const matrices = bloom.instanceMatrix.array.slice(), tints = bloom.instanceColor.array.slice();
  const shadow = new THREE.InstancedMesh(assets.geometries[1], assets.material, count);
  shadow.instanceMatrix.array.set(matrices);
  shadow.instanceColor = new THREE.InstancedBufferAttribute(tints.slice(),3);
  shadow.boundingSphere = bloom.boundingSphere.clone();
  shadow.count = 0; shadow.castShadow = true;
  shadow.onBeforeShadow = () => { shadow.count = count; };
  shadow.onAfterShadow = () => { shadow.count = 0; };
  shadow.name = 'Stable canopy shadow geometry'; kit.scene.add(shadow);
  const positions = Array.from({length:count}, (_,index)=>new THREE.Vector3(matrices[index*16+12],matrices[index*16+13],matrices[index*16+14]));
  for (const mesh of levels) {
    mesh.castShadow = false; mesh.receiveShadow = true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
    mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    mesh.boundingSphere = bloom.boundingSphere.clone();
    mesh.count = 0;
    kit.scene.add(mesh);
  }
  const cameraPosition = new THREE.Vector3(), cameraDirection = new THREE.Vector3(), offsetPosition = new THREE.Vector3();
  const previousLevels=new Uint8Array(count);
  let initialized=false;
  const updateDetail = (camera, height) => {
    camera.getWorldPosition(cameraPosition); camera.getWorldDirection(cameraDirection);
    const projection = height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    const counts = [0, 0, 0];
    for (let index = 0; index < count; index++) {
      const depth = offsetPosition.copy(positions[index]).sub(cameraPosition).dot(cameraDirection);
      const diameter = .26 * scale * projection / Math.max(.1, depth);
      let detail = depth < 0 ? 0 : diameter > 32 ? 2 : diameter > 14 ? 1 : 0;
      const previous=previousLevels[index];
      if(initialized&&depth>0) {
        if(previous===2&&diameter>28)detail=2;
        else if(previous===1&&diameter>12&&diameter<36)detail=1;
        else if(previous===0&&diameter<16)detail=0;
      }
      previousLevels[index]=detail;
      const offset = counts[detail]++;
      levels[detail].instanceMatrix.array.set(matrices.subarray(index * 16, index * 16 + 16), offset * 16);
      levels[detail].instanceColor.array.set(tints.subarray(index * 3, index * 3 + 3), offset * 3);
    }
    levels.forEach((mesh,index)=>{
      mesh.count = counts[index]; mesh.visible = counts[index] > 0;
      mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
    });
    initialized=true;
    return { counts, triangles: counts.reduce((sum,value,index)=>sum+value*assets.geometries[index].index.count/3,0) };
  };
  const leaves = new THREE.InstancedMesh(new THREE.PlaneGeometry(.14, .27), new THREE.MeshToonMaterial({ map: textures.leaf, gradientMap: colors.ramp, color: '#f6eed4', alphaTest: .35, side: THREE.DoubleSide, alphaToCoverage: true }), 240);
  for (let leafIndex = 0; leafIndex < 240; leafIndex++) {
    const curve=attachmentCurves[leafIndex%attachmentCurves.length];
    transform.position.copy(curve.getPoint(.35+random()*.6));
    transform.rotation.set(random() * 6, random() * 6, random() * 6);
    transform.scale.setScalar(scale); transform.updateMatrix(); leaves.setMatrixAt(leafIndex, transform.matrix);
  }
  leaves.computeBoundingSphere(); leaves.receiveShadow = true; kit.scene.add(leaves);
  leaves.material.onBeforeCompile=daylightOnly;leaves.material.customProgramCacheKey=()=> 'sakura-leaf-daylight';
  const canopyBounds=new THREE.Box3().setFromPoints(flowerSources);
  return { origin, scale, blossoms: count * 4, flowerInstances: count, flowerTriangles: count * assets.geometries[2].index.count / 3, shadowFlowerTriangles: count * assets.geometries[1].index.count / 3, pedicelTriangles:count*assets.stems.attributes.position.count/3,updateDetail,flowerSources,attachmentPoints,canopyBounds,attachmentCurves:attachmentCurves.length };
}

export function makePetals(scene, colors, centers,building) {
  const random = seeded(991011);
  const shape = new THREE.Shape();
  shape.moveTo(0, -.5); shape.bezierCurveTo(-.52, -.20, -.5, .52, -.07, .5); shape.lineTo(0, .34); shape.lineTo(.07, .5); shape.bezierCurveTo(.5, .52, .52, -.2, 0, -.5);
  const geometry = new THREE.ShapeGeometry(shape, 3);
  const material = colors.get('#f9d8e0', { side: THREE.DoubleSide });
  material.onBeforeCompile=daylightOnly;material.customProgramCacheKey=()=> 'outdoor-petals-daylight';
  const resting = new THREE.InstancedMesh(geometry, material, 1400);
  const falling = new THREE.InstancedMesh(geometry, material, 220);
  const transform = new THREE.Object3D();
  const particles = [];
  const collision=petalCollision(building),normalAxis=new THREE.Vector3(0,0,1),spin=new THREE.Quaternion();
  let roofResting=0,rejectedSources=0;
  for (let index = 0; index < 1400; index++) {
    const tree = centers[index % centers.length];
    const angle = random() * Math.PI * 2, radius = random() ** .55 * tree.scale * 4.9;
    transform.position.set(tree.origin[0] + Math.cos(angle) * radius + .7, .024, tree.origin[2] + Math.sin(angle) * radius);
    const surface=collision.surface(transform.position.x,transform.position.z);
    const normal=surface?.normal??new THREE.Vector3(0,1,0);
    if(surface){transform.position.copy(surface.point).addScaledVector(normal,.007);if(surface.point.y>4)roofResting++;}
    transform.quaternion.setFromUnitVectors(normalAxis,normal);spin.setFromAxisAngle(normalAxis,random()*6.2);transform.quaternion.multiply(spin);
    transform.scale.setScalar(.035 + random() * .027); transform.updateMatrix(); resting.setMatrixAt(index, transform.matrix);
    if (index < 220) {
      let source=null;
      const start=Math.floor(random()*tree.flowerSources.length);
      for(let attempt=0;attempt<tree.flowerSources.length;attempt++) {
        const candidate=tree.flowerSources[(start+attempt)%tree.flowerSources.length],above=collision.surface(candidate.x,candidate.z);
        if(!above||candidate.y>above.point.y+.06){source=candidate.clone();break;}rejectedSources++;
      }
      if(!source)continue;
      const particle={source,canopy:tree.canopyBounds,phase:random(),duration:9+random()*7,angle:random()*Math.PI*2,drift:.35+random()*.55,size:.035+random()*.022};
      particle.contact=petalContact(particle,collision);particles.push(particle);
    }
  }
  resting.computeBoundingSphere(); falling.frustumCulled = false;
  falling.count=particles.length;
  falling.name='Petals detached from real blossoms';falling.userData.sources=particles.map(particle=>particle.source.toArray());
  falling.userData.particles=particles;resting.name='Petals resting on roof and outdoor ground';
  scene.add(resting, falling);
  const update=time => {
    particles.forEach((particle, index) => {
      const cycle = (time / particle.duration + particle.phase) % 1,progress=Math.min(cycle/.80,particle.contact.progress);
      if(progress>=particle.contact.progress) {
        transform.position.copy(particle.contact.point).addScaledVector(particle.contact.normal,.009);
        transform.quaternion.setFromUnitVectors(normalAxis,particle.contact.normal);spin.setFromAxisAngle(normalAxis,particle.angle);transform.quaternion.multiply(spin);
      } else {petalPosition(particle,progress,transform.position);transform.rotation.set(time + particle.angle, time * .7 + particle.phase * 6, time * .43);}
      const appearance=Math.min(1,cycle/.04,(1-cycle)/.07);
      transform.scale.setScalar(particle.size*Math.max(0,appearance)); transform.updateMatrix(); falling.setMatrixAt(index, transform.matrix);
    });
    falling.instanceMatrix.needsUpdate = true;
  };
  update.report={emitter:'actual blossom positions',count:particles.length,maxBirthHeight:Math.max(...particles.map(particle=>particle.source.y)),minBirthHeight:Math.min(...particles.map(particle=>particle.source.y)),birthAboveCanopy:particles.filter(particle=>!particle.canopy.containsPoint(particle.source)).length,roofResting,roofLandings:particles.filter(particle=>particle.contact.progress<1&&particle.contact.point.y>4).length,buildingContacts:particles.filter(particle=>particle.contact.progress<1).length,rejectedSources,collisionTriangles:collision.triangles,pathSamples:96,collision:'precomputed first contact on actual roof, glass and shell'};
  return update;
}
