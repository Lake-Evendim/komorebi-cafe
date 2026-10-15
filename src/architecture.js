import * as THREE from 'three';
import { placard, labelTexture } from './kit.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildEntranceGarden } from './greenery.js';

function gableGeometry(width, height, depth) {
  const outline = new THREE.Shape();
  outline.moveTo(-width / 2, 0); outline.lineTo(width / 2, 0); outline.lineTo(0, height); outline.closePath();
  return new THREE.ExtrudeGeometry(outline, { depth, bevelEnabled: false });
}

function tileGeometry() {
  const geometry = new THREE.PlaneGeometry(.43, .31, 3, 6);
  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index++) {
    const longitudinal = positions.getX(index), lateral = positions.getY(index);
    positions.setXYZ(index, longitudinal, .034 * Math.cos(lateral / .155 * Math.PI * .5) + .012 * (longitudinal + .215) / .43, lateral);
  }
  geometry.computeVertexNormals();
  const normals = geometry.attributes.normal;
  for (let index = 0; index < normals.count; index++) normals.setXYZ(index, -normals.getX(index), -normals.getY(index), -normals.getZ(index));
  return geometry;
}

function plant(kit, colors, position, size = .65, tint = '#ac7862') {
  const [centerX, baseY, centerZ] = position;
  kit.cylinder(size * .22, size * .16, size * .32, [centerX, baseY + size * .16, centerZ], colors.get(tint), 16);
  kit.cylinder(size * .21, size * .21, .035, [centerX, baseY + size * .32, centerZ], colors.get('#534a3d'), 16);
  for (let stem = 0; stem < 8; stem++) {
    const angle = stem * 2.4;
    const top = [centerX + Math.cos(angle) * size * .23, baseY + size * (.7 + (stem % 3) * .12), centerZ + Math.sin(angle) * size * .23];
    kit.rod([centerX, baseY + size * .3, centerZ], top, .008, colors.get('#789566'), 5);
    const geometry = new THREE.PlaneGeometry(.18 * size, .36 * size, 2, 4);
    const positions = geometry.attributes.position;
    for (let index = 0; index < positions.count; index++) {
      const leafY = positions.getY(index);
      positions.setXYZ(index, positions.getX(index) * Math.sin((leafY / (.36 * size) + .5) * Math.PI), leafY, .035 * size * Math.sin((leafY / (.36 * size) + .5) * Math.PI));
    }
    geometry.computeVertexNormals();
    kit.add(geometry, colors.get(stem % 2 ? '#97ae77' : '#718969', {side: THREE.DoubleSide}), top, [.35, angle, .2]);
    geometry.dispose();
  }
}

export function buildCafe(kit, colors, textures) {
  const collisionParts=[];
  const checkpoint=()=>new Map([...kit.batches].map(([key,batch])=>[key,batch.geometries.length]));
  const collectCollision=start=>{
    for(const [key,batch] of kit.batches)for(const geometry of batch.geometries.slice(start.get(key)??0))collisionParts.push(geometry.clone());
  };
  const shellStart=checkpoint();
  const timber = new THREE.MeshToonMaterial({ color: '#9c8570', map: textures.wood, gradientMap: colors.ramp });
  const plaster = new THREE.MeshToonMaterial({ color: '#f5f0e4', map: textures.plaster, gradientMap: colors.ramp });
  const frame = colors.get('#695043');
  const counterWood = new THREE.MeshToonMaterial({color:'#ad9885',map:textures.wood,gradientMap:colors.ramp});
  const cream = colors.get('#e2d8bc');
  const teal = colors.get('#718b8b');
  const slate = ['#5f7985', '#607b87', '#647e89', '#5e7783'].map(color => colors.get(color, { side: THREE.DoubleSide }));
  const metal = colors.get('#52616b');
  const copper = colors.get('#8e7b67');
  const glass = new THREE.MeshPhysicalMaterial({ color: '#d3e4df', transparent: true, opacity: .10, roughness: .13, metalness: .06, envMap: textures.reflections, envMapIntensity: .4, side: THREE.DoubleSide, depthWrite: false,forceSinglePass:true });
  const wallFront = 2.45;

  kit.box([8.25, .28, 6.8], [2, .12, -.7], colors.get('#92918a'), .05);
  kit.box([7.8, .08, 6.3], [2, .30, -.65], timber);
  kit.box([.16, 3.15, 6.6], [6, 1.87, -.8], plaster, .018);
  kit.box([8, 3.15, .15], [2, 1.87, -4], plaster);
  kit.box([.15, 3.15, 2.55], [-2, 1.87, -2.74], plaster);
  kit.box([.15, .71, 3.95], [-2, .66, .52], timber);
  kit.box([.15, .62, 3.95], [-2, 3.09, .52], plaster);
  for (const boundaryZ of [-1.5, 2.4]) kit.box([.17, 2.3, .14], [-2, 1.95, boundaryZ], timber);
  kit.box([8, .56, .14], [2, 3.2, wallFront], plaster);
  kit.box([.45, 2.68, .16], [-1.8, 1.58, wallFront], timber);
  kit.box([.38, 2.68, .16], [.03, 1.58, wallFront], timber);
  kit.box([.60, 2.68, .16], [5.7, 1.58, wallFront], timber);
  kit.box([5.6, .75, .17], [2.8, .67, wallFront], timber);
  kit.box([8.13, .16, 6.65], [2, 3.43, -.8], timber);
  kit.box([8, 1.0, 6.45], [2, 4.0, -.8], plaster);
  kit.add(gableGeometry(8, 1.55, .14), plaster, [2, 4.45, 2.38]);
  kit.add(gableGeometry(8, 1.55, .14), plaster, [2, 4.45, -4.1]);

  for (let slat = 0; slat < 34; slat++) {
    const centerX = -1.95 + slat * .237;
    if (centerX < -.25 || centerX > .28) kit.box([.223, .69, .035], [centerX, .64, 2.56], timber, .006);
  }
  for (let slat = 0; slat < 29; slat++) kit.box([.035, .69, .215], [-2.09, .64, -3.9 + slat * .227], timber, .006);
  for (let course = 0; course < 7; course++) {
    kit.box([8.03, .018, .05], [2, 3.52 + course * .14, 2.53], cream);
    kit.box([.05, .018, 6.5], [-2.09, 3.52 + course * .14, -.77], cream);
  }
  for (const centerX of [-1.84, .1, 5.65]) kit.box([.12, 2.77, .14], [centerX, 1.75, 2.55], frame, .012);
  for (let pillar = 0; pillar < 5; pillar++) kit.box([.09, 2.21, .11], [.55 + pillar * 1.15, 1.96, 2.56], frame, .008);
  for (const height of [.97, 2.03, 2.92]) kit.box([5.24, .08, .14], [2.88, height, 2.58], frame, .008);
  for (let pane = 0; pane < 4; pane++) kit.add(new THREE.PlaneGeometry(1.06,1.9),glass,[1.10+pane*1.15,1.97,2.57],[0,0,0],[1,1,1],false);
  kit.box([5.36, .07, .26], [2.88, .91, 2.61], cream, .022);
  for (let mullion = 0; mullion < 4; mullion++) kit.box([.13, 1.96, .06], [-2.11, 1.97, -1.25 + mullion * 1.1], frame);
  for (const height of [.95, 2.06, 2.97]) kit.box([.14, .085, 3.90], [-2.11, height, .55], frame, .012);
  for (let pane = 0; pane < 3; pane++) kit.add(new THREE.PlaneGeometry(1.00,1.90),glass,[-2.09,1.95,-.70+pane*1.1],[0,Math.PI/2,0],[1,1,1],false);
  for (const centerX of [-1.48,-.34]) kit.box([.10,2.55,.12],[centerX,1.59,2.46],frame,.012);
  for (const height of [.34,1.09,2.82]) kit.box([1.20,.10,.12],[-.91,height,2.46],frame,.012);
  kit.box([1.02,.62,.085],[-.91,.70,2.47],timber,.012);
  kit.add(new THREE.PlaneGeometry(.98,1.58),glass,[-.91,1.92,2.54],[0,0,0],[1,1,1],false);
  kit.box([1.02, .61, .045], [-.91, .67, 2.55], timber, .018);
  kit.rod([-.46, 1.37, 2.67], [-.46, 1.62, 2.67], .025, copper, 12);
  for (const height of [.56, 2.67]) kit.cylinder(.023, .023, .1, [-1.49, height, 2.62], metal, 8);
  placard(kit, [.29, .13], [-.90, 2.11, 2.58], labelTexture([{ text: 'OPEN', size: 62, y: 110 }], { width: 256, height: 144, background: '#e9e0c7' }));

  kit.box([.05, 2.89, 6.32], [5.90, 1.79, -.77], plaster);
  kit.box([7.9, .08, 6.3], [2, 3.30, -.76], cream);
  for (let beam = 0; beam < 7; beam++) kit.box([.11, .16, 6.25], [-1.56 + beam * 1.1, 3.18, -.77], frame, .015);
  const cornerTrim=new THREE.Shape();
  const cornerOutline=[[-.022,-.020],[.060,-.020],[.060,.065],[.026,.065],[.026,.14],[-.022,.14]];
  cornerOutline.forEach(([offsetX,offsetZ],index)=>index?cornerTrim.lineTo(offsetX,-offsetZ):cornerTrim.moveTo(offsetX,-offsetZ));
  cornerTrim.closePath();
  kit.add(new THREE.ExtrudeGeometry(cornerTrim,{depth:2.89,bevelEnabled:false}),frame,[-1.925,.35,-3.925],[-Math.PI/2,0,0]);
  collectCollision(shellStart);
  kit.box([4.9, .83, .80], [3.0, .75, -1.970], timber, .025);
  kit.box([5.1, .095, .94], [3.0, 1.20, -1.945], counterWood, .035);
  plant(kit, colors, [-1.6, .36, -.7], 1.2, '#c3bc9a');

  const roofStart=checkpoint();
  const tile = tileGeometry();
  const pitch = Math.atan2(1.55, 4.20);
  const slopeLength = Math.hypot(4.2, 1.55);
  for (const direction of [-1, 1]) {
    const rotation = [0, 0, direction === 1 ? -pitch : pitch];
    kit.box([slopeLength + .45, .09, 7.55], [2 + direction * 2.1, 5.225, -.76], slate[0], 0, rotation);
    for (let course = 0; course < 12; course++) {
      const distance = .2 + course * .365;
      for (let column = 0; column < 25; column++) {
        kit.add(tile, slate[(course + column * 3) % slate.length], [2 + direction * distance * Math.cos(pitch), 6.13 - distance * Math.sin(pitch), -4.45 + column * .303], rotation);
      }
    }
    kit.box([.15, .20, 7.64], [2 + direction * 4.45, 4.39, -.77], frame, .018);
    for (const endZ of [-4.50, 3.0]) kit.box([slopeLength + .4, .21, .15], [2 + direction * 2.14, 5.24, endZ], cream, .023, rotation);
    for (let bracket = 0; bracket < 10; bracket++) {
      const centerZ = -4.35 + bracket * .77;
      kit.rod([2 + direction * 3.94, 4.35, centerZ], [2 + direction * 4.40, 4.23, centerZ], .055, timber);
      kit.rod([2 + direction * 3.94, 4.10, centerZ], [2 + direction * 4.34, 4.24, centerZ], .026, frame);
    }
    kit.cylinder(.071, .071, 7.66, [2 + direction * 4.55, 4.31, -.8], copper, 14, [Math.PI / 2, 0, 0]);
  }
  for (let cap = 0; cap < 25; cap++) kit.cylinder(.118, .118, .31, [2, 6.19, -4.43 + cap * .307], slate[1], 16, [Math.PI / 2, 0, 0]);
  kit.curve([[-2.56, 4.31, 2.76], [-2.60, 4.1, 2.6], [-2.28, 3.7, 2.53], [-2.27, .38, 2.53], [-2.40, .26, 2.8]], .039, copper);
  for (const height of [.95, 2.05, 3.15]) kit.box([.11, .028, .08], [-2.27, height, 2.56], metal);
  kit.box([8.32, .045, .77], [2, 3.02, 2.89], colors.get('#708784'), 0, [-.11, 0, 0]);
  kit.box([8.32, .14, .04], [2, 2.99, 3.26], frame, .015);
  collectCollision(roofStart);
  for (let support = 0; support < 6; support++) kit.rod([-1.7 + support * 1.48, 2.75, 2.58], [-1.7 + support * 1.48, 2.99, 3.20], .022, copper);
  kit.box([3.75, .73, .13], [2.5, 3.54, 2.70], frame, .025);
  placard(kit, [3.56, .65], [2.5, 3.54, 2.775], textures.sign);
  for (const centerX of [1.02, 3.94]) for (const height of [3.25, 3.82]) kit.sphere([.012, .012, .008], [centerX, height, 2.79], copper, 8);
  for (let strip = 0; strip < 2; strip++) placard(kit, [.58, .42], [-1.24 + strip * .63, 2.79, 2.68], textures.noren[strip]);

  kit.box([1.45, .14, .66], [-.94, .20, 2.99], colors.get('#b5b1a4'), .032);
  kit.box([1.68, .10, .46], [-.94, .10, 3.47], colors.get('#a4a7a1'), .024);
  kit.place([1.20,.115,3.30],[0,-Math.PI/8,0],()=>{
    kit.box([.78, 1.02, .045], [0, .5686, 0], frame, .025, [-.14, 0, 0]);
    placard(kit, [.68, .78], [0, .6186, .09], textures.menu, '#ffffff', [-.14, 0, 0]);
    for (const offsetX of [-.29, .29]) kit.rod([offsetX, .0086, -.35], [offsetX, 1.0986, .05], .025, frame);
  });
  const entranceGarden=buildEntranceGarden(kit,colors);
  const lamp = colors.get('#eee0ad', { emissive: '#efb773', emissiveIntensity: .25 });
  kit.curve([[-1.85, 2.4, 2.55], [-1.85, 2.55, 2.91], [-1.85, 2.48, 3.02]], .016, metal);
  kit.cylinder(.04, .10, .08, [-1.85, 2.46, 3.02], metal, 16);
  kit.sphere([.053, .055, .053], [-1.85, 2.38, 3.02], lamp);
  kit.box([.67, .28, .29], [-2.30, .66, -2.52], colors.get('#a7b1a4'), .032);
  for (let vent = 0; vent < 12; vent++) kit.box([.007, .21, .025], [-2.67, .66, -2.80 + vent * .047], metal);
  kit.curve([[-2.36, .50, -2.27], [-2.39, .31, -2.28], [-2.4, .19, -3.10]], .012, copper);
  const collisionGeometry=mergeGeometries(collisionParts,false);
  collisionParts.forEach(geometry=>geometry.dispose());
  collisionGeometry.computeBoundingBox();collisionGeometry.computeBoundingSphere();
  const collision=new THREE.Mesh(collisionGeometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
  collision.name='Cafe roof, windows and opaque shell collision';collision.userData.entranceGarden=entranceGarden;collision.updateMatrixWorld();
  return collision;
}

