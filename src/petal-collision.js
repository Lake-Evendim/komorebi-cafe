import * as THREE from 'three';

export function petalCollision(mesh) {
  const cells=new Map(),cellSize=.5,position=mesh.geometry.attributes.position;
  const triangles=[];
  for(let vertex=0;vertex<position.count;vertex+=3) {
    const first=new THREE.Vector3().fromBufferAttribute(position,vertex),second=new THREE.Vector3().fromBufferAttribute(position,vertex+1),third=new THREE.Vector3().fromBufferAttribute(position,vertex+2);
    const normal=second.clone().sub(first).cross(third.clone().sub(first)).normalize();
    const triangle={first,second,third,normal};triangles.push(triangle);
    const minimumX=Math.floor(Math.min(first.x,second.x,third.x)/cellSize),maximumX=Math.floor(Math.max(first.x,second.x,third.x)/cellSize);
    const minimumZ=Math.floor(Math.min(first.z,second.z,third.z)/cellSize),maximumZ=Math.floor(Math.max(first.z,second.z,third.z)/cellSize);
    for(let column=minimumX;column<=maximumX;column++)for(let row=minimumZ;row<=maximumZ;row++) {
      const key=column+':'+row;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(triangle);
    }
  }
  const ray=new THREE.Ray(),intersection=new THREE.Vector3(),direction=new THREE.Vector3();
  const intersect=(start,end)=>{
    direction.copy(end).sub(start);const length=direction.length();if(length<1e-9)return null;
    ray.set(start,direction.multiplyScalar(1/length));
    const candidates=new Set();
    for(let column=Math.floor(Math.min(start.x,end.x)/cellSize);column<=Math.floor(Math.max(start.x,end.x)/cellSize);column++)for(let row=Math.floor(Math.min(start.z,end.z)/cellSize);row<=Math.floor(Math.max(start.z,end.z)/cellSize);row++)for(const triangle of cells.get(column+':'+row)??[])candidates.add(triangle);
    let nearest=null,distance=length+1e-7;
    for(const triangle of candidates)if(ray.intersectTriangle(triangle.first,triangle.second,triangle.third,false,intersection)) {
      const candidateDistance=start.distanceTo(intersection);
      if(candidateDistance<=length+1e-7&&candidateDistance<distance) {
        distance=candidateDistance;const normal=triangle.normal.clone();if(normal.dot(direction)>0)normal.negate();
        nearest={point:intersection.clone(),normal,distance,fraction:distance/length};
      }
    }
    return nearest;
  };
  const surface=(horizontal,depth)=>intersect(new THREE.Vector3(horizontal,20,depth),new THREE.Vector3(horizontal,-.1,depth));
  return {intersect,surface,triangles:triangles.length,cells:cells.size};
}

export function petalPosition(particle,progress,target=new THREE.Vector3()) {
  const flutter=Math.sin(progress*Math.PI*6+particle.angle)*Math.sin(progress*Math.PI)*.14;
  const descent=Math.pow(progress,.87);
  return target.set(particle.source.x+progress*particle.drift+flutter,particle.source.y*(1-descent)+.026*descent,particle.source.z+progress*particle.drift*.24+flutter*.7);
}

export function petalContact(particle,collision) {
  const previous=particle.source.clone(),next=new THREE.Vector3();
  const offsets=[new THREE.Vector3(),new THREE.Vector3(particle.size*.5,0,0),new THREE.Vector3(-particle.size*.5,0,0),new THREE.Vector3(0,0,particle.size*.5),new THREE.Vector3(0,0,-particle.size*.5)];
  const samples=96;
  for(let sample=1;sample<=samples;sample++) {
    const progress=sample/samples;petalPosition(particle,progress,next);
    let firstContact=null;
    for(const offset of offsets) {
      const contact=collision.intersect(previous.clone().add(offset),next.clone().add(offset));
      if(contact&&(!firstContact||contact.fraction<firstContact.fraction))firstContact=contact;
    }
    if(firstContact)return {...firstContact,progress:(sample-1+firstContact.fraction)/samples};
    previous.copy(next);
  }
  return {point:petalPosition(particle,1),normal:new THREE.Vector3(0,1,0),progress:1,distance:0};
}
