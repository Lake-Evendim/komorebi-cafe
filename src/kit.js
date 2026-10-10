import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

function roundedBox(size, requestedRadius) {
  const half = size.map(value=>value/2);
  const radius = Math.min(requestedRadius,...half);
  const core = half.map(value=>value-radius);
  const positions = [], normals = [], coordinates = [];
  const point = (position, normal) => ({position, normal});
  const triangle = (first, second, third) => {
    const direction = new THREE.Vector3(...second.position).sub(new THREE.Vector3(...first.position)).cross(new THREE.Vector3(...third.position).sub(new THREE.Vector3(...first.position)));
    const average = first.normal.map((value,axis)=>value+second.normal[axis]+third.normal[axis]);
    const vertices = direction.dot(new THREE.Vector3(...average)) < 0 ? [first,third,second] : [first,second,third];
    for(const vertex of vertices) {
      positions.push(...vertex.position); normals.push(...vertex.normal);
      const dominant = vertex.normal.map(Math.abs).indexOf(Math.max(...vertex.normal.map(Math.abs)));
      const axes = [0,1,2].filter(axis=>axis!==dominant);
      coordinates.push(vertex.position[axes[0]]/size[axes[0]]+.5,vertex.position[axes[1]]/size[axes[1]]+.5);
    }
  };
  const quad = vertices => {triangle(vertices[0],vertices[1],vertices[2]);triangle(vertices[0],vertices[2],vertices[3]);};
  for(let axis=0;axis<3;axis++) {
    const across = [0,1,2].filter(value=>value!==axis);
    for(const sign of [-1,1]) {
      const normal = [0,0,0]; normal[axis]=sign;
      quad([[-1,-1],[1,-1],[1,1],[-1,1]].map(offset=>{
        const position = [0,0,0];position[axis]=half[axis]*sign;
        across.forEach((component,index)=>position[component]=core[component]*offset[index]);
        return point(position,normal);
      }));
    }
    for(const firstSign of [-1,1]) for(const secondSign of [-1,1]) {
      for(let segment=0;segment<2;segment++) {
        const edgePoint = (angle,sign) => {
          const normal=[0,0,0],position=[0,0,0];
          position[axis]=core[axis]*sign;
          normal[across[0]]=Math.cos(angle)*firstSign;normal[across[1]]=Math.sin(angle)*secondSign;
          position[across[0]]=core[across[0]]*firstSign+normal[across[0]]*radius;
          position[across[1]]=core[across[1]]*secondSign+normal[across[1]]*radius;
          return point(position,normal);
        };
        const start=segment*Math.PI/4,end=(segment+1)*Math.PI/4;
        quad([edgePoint(start,-1),edgePoint(start,1),edgePoint(end,1),edgePoint(end,-1)]);
      }
    }
  }
  const diagonal=Math.SQRT1_2;
  const directions=[[1,0,0],[0,1,0],[0,0,1],[diagonal,diagonal,0],[diagonal,0,diagonal],[0,diagonal,diagonal]];
  for(const signX of [-1,1])for(const signY of [-1,1])for(const signZ of [-1,1]) {
    const signs=[signX,signY,signZ];
    const vertices=directions.map(direction=>{
      const normal=direction.map((value,axis)=>value*signs[axis]);
      return point(core.map((value,axis)=>value*signs[axis]+normal[axis]*radius),normal);
    });
    for(const indices of [[0,3,4],[1,5,3],[2,4,5],[3,5,4]])triangle(...indices.map(index=>vertices[index]));
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(coordinates,2));
  return geometry;
}

export function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function palette() {
  const ramp = new THREE.DataTexture(new Uint8Array([100, 161, 219, 255]), 4, 1, THREE.RedFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  const materials = new Map();
  const get = (color, options = {}) => {
    const key = color + JSON.stringify(options);
    if (!materials.has(key)) {
      const material = new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...options });
      materials.set(key, material);
    }
    return materials.get(key);
  };
  return { get, materials, ramp };
}

export class Kit {
  constructor(scene) {
    this.scene = scene;
    this.batches = new Map();
    this.primitives = new Map();
    this.transform = new THREE.Object3D();
    this.triangles = 0;
    this.parts = 0;
    this.transparentParts = 0;
  }

  geometry(name, create) {
    if (!this.primitives.has(name)) this.primitives.set(name, create());
    return this.primitives.get(name);
  }

  add(geometry, material, position, rotation = [0, 0, 0], scale = [1, 1, 1], shadow = true) {
    const isolated=material.transparent&&!material.alphaTest&&!material.polygonOffset;
    const key = material.uuid + ':' + shadow+(isolated?':'+this.parts:'');
    if(isolated)this.transparentParts++;
    if (!this.batches.has(key)) this.batches.set(key, { material, geometries: [], shadow });
    this.transform.position.set(...position);
    this.transform.rotation.set(...rotation);
    this.transform.scale.set(...scale);
    this.transform.updateMatrix();
    if (this.placement) this.transform.matrix.premultiply(this.placement);
    const copy = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    for (const attribute of Object.keys(copy.attributes)) if (!['position', 'normal', 'uv'].includes(attribute)) copy.deleteAttribute(attribute);
    if (!copy.attributes.uv) copy.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(copy.attributes.position.count * 2), 2));
    copy.applyMatrix4(this.transform.matrix);
    if (this.measuring) {
      copy.computeBoundingBox();
      this.measuring.union(copy.boundingBox);
    }
    this.batches.get(key).geometries.push(copy);
    this.triangles += copy.attributes.position.count / 3;
    this.parts++;
  }

  measure(build) {
    const bounds = new THREE.Box3();
    const previous = this.measuring;
    this.measuring = bounds;
    try { build(); } finally { this.measuring = previous; if(previous)previous.union(bounds); }
    return bounds;
  }

  place(position, rotation, build) {
    const placement = new THREE.Matrix4().compose(new THREE.Vector3(...position),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(1,1,1));
    const previous = this.placement;
    this.placement = previous ? previous.clone().multiply(placement) : placement;
    try { return build(); } finally { this.placement = previous; }
  }

  box(size, position, material, radius = 0, rotation = [0, 0, 0], shadow = true) {
    const geometry = radius ? this.geometry('rounded:' + size.join(':') + ':' + radius, () => roundedBox(size, radius)) : this.geometry('box', () => new THREE.BoxGeometry(1, 1, 1));
    this.add(geometry, material, position, rotation, radius ? [1, 1, 1] : size, shadow);
  }

  cylinder(radiusTop, radiusBottom, height, position, material, segments = 12, rotation = [0, 0, 0]) {
    const geometry = this.geometry(`cylinder:${radiusTop}:${radiusBottom}:${height}:${segments}`, () => new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments));
    this.add(geometry, material, position, rotation);
  }

  sphere(scale, position, material, segments = 12) {
    const geometry = this.geometry('sphere:' + segments, () => new THREE.SphereGeometry(1, segments, 8));
    this.add(geometry, material, position, [0, 0, 0], scale);
  }

  rod(start, end, radius, material, segments = 8) {
    const from = new THREE.Vector3(...start), to = new THREE.Vector3(...end);
    const direction = to.clone().sub(from);
    const geometry = new THREE.CylinderGeometry(radius * .82, radius, direction.length(), segments);
    geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()));
    this.add(geometry, material, from.add(to).multiplyScalar(.5).toArray());
    geometry.dispose();
  }

  curve(points, radius, material, segments = 22, radialSegments = 6) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    const geometry = new THREE.TubeGeometry(curve, segments, radius, radialSegments, false);
    this.add(geometry, material, [0, 0, 0]);
    geometry.dispose();
  }

  finish() {
    for (const batch of this.batches.values()) {
      const merged = mergeGeometries(batch.geometries, false);
      const mesh = new THREE.Mesh(merged, batch.material);
      mesh.castShadow = batch.shadow;
      mesh.receiveShadow = true;
      merged.computeBoundingSphere();
      this.scene.add(mesh);
      batch.geometries.forEach(geometry => geometry.dispose());
    }
    for (const geometry of this.primitives.values()) geometry.dispose();
    return { sourceParts: this.parts, mergedMeshes: this.batches.size, triangles: this.triangles, individuallySortedTransparentParts:this.transparentParts };
  }
}

const placardMaterials = new WeakMap();

export function placard(kit, dimensions, position, texture, tint = '#fffefa', rotation = [0, 0, 0]) {
  if (!placardMaterials.has(texture)) placardMaterials.set(texture, new Map());
  const variants = placardMaterials.get(texture);
  if (!variants.has(tint)) variants.set(tint, new THREE.MeshToonMaterial({ color: tint, map: texture, side: THREE.DoubleSide, alphaTest: .15, alphaToCoverage: true }));
  const material = variants.get(tint);
  kit.add(new THREE.PlaneGeometry(...dimensions), material, position, rotation, [1, 1, 1], false);
  return material;
}

export function labelTexture(lines, options = {}) {
  return canvasTexture(options.width ?? 768, options.height ?? 256, (painter, width, height) => {
    painter.fillStyle = options.background ?? '#eee5d5';
    painter.fillRect(0, 0, width, height);
    painter.strokeStyle = options.border ?? '#785842';
    painter.lineWidth = 3;
    painter.strokeRect(9, 9, width - 18, height - 18);
    painter.textAlign = 'center';
    lines.forEach((line, index) => {
      painter.fillStyle = line.color ?? options.color ?? '#4d4439';
      const font = line.font ?? '"Yu Mincho", "SimSun", serif';
      let size = line.size ?? 70;
      painter.font = `${line.weight ?? 500} ${size}px ${font}`;
      const measured = painter.measureText(line.text).width;
      if (measured > width - 40) size *= (width - 40) / measured;
      painter.font = `${line.weight ?? 500} ${size}px ${font}`;
      painter.fillText(line.text, width / 2, line.y ?? height * (index + 1) / (lines.length + 1));
    });
  });
}
