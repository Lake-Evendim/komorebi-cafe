import * as THREE from 'three';
import { seeded } from './kit.js';

function blade(kit,colors,start,angle,length,width,tint) {
  const geometry=kit.geometry('botanical-blade:'+length+':'+width,()=>{
    const leaf=new THREE.PlaneGeometry(width,length,2,6),points=leaf.attributes.position;
    for(let vertex=0;vertex<points.count;vertex++){
      const progress=THREE.MathUtils.clamp((points.getY(vertex)+length/2)/length,0,1),across=points.getX(vertex);
      points.setXYZ(vertex,across*Math.pow(Math.sin(progress*Math.PI),.72),progress*length,.045*Math.sin(progress*Math.PI)-Math.abs(across)*.22);
    }
    leaf.computeVertexNormals();return leaf;
  });
  kit.place(start,angle,()=>{
    kit.rod([0,0,0],[0,.024,0],.0025,colors.get('#5c7950'),5);
    kit.add(geometry,colors.get(tint,{side:THREE.DoubleSide}),[0,.024,0]);
    kit.curve([[0,.024,0],[0,length*.45+.024,.044],[0,length+.024,0]],.0012,colors.get('#97a478'),4,3);
  });
}

function pot(kit,colors,radius,height,tint) {
  const profile=[[radius*.70,0],[radius*.82,.04],[radius,height*.86],[radius*1.03,height*.91],[radius*1.03,height],[radius*.90,height],[radius*.88,height*.87]];
  kit.add(new THREE.LatheGeometry(profile.map(point=>new THREE.Vector2(...point)),28),colors.get(tint),[0,0,0]);
  kit.cylinder(radius*.89,radius*.89,.022,[0,height-.044,0],colors.get('#534f39'),24);
  kit.cylinder(radius*.82,radius*.87,.024,[0,.012,0],colors.get('#8b7058'),24);
}

function shrub(kit,colors,position,height,radius,seed,tint) {
  const random=seeded(seed),bark=colors.get('#6f6148');
  kit.place(position,[0,seed*.01,0],()=>{
    pot(kit,colors,radius,height*.31,tint);
    const base=height*.29;
    kit.curve([[0,base,0],[.016,height*.63,.012],[-.025,height*.91,0]],.014,bark,14,6);
    for(let branch=0;branch<9;branch++){
      const angle=branch*2.4,reach=height*(.17+random()*.08),root=[.007,base+branch*height*.055,.006];
      const end=[Math.cos(angle)*reach,height*(.53+branch*.045),Math.sin(angle)*reach];
      kit.curve([root,[end[0]*.48,end[1]-.10,end[2]*.48],end],.006,bark,9,5);
      const twig=new THREE.CatmullRomCurve3([new THREE.Vector3(...root),new THREE.Vector3(end[0]*.48,end[1]-.10,end[2]*.48),new THREE.Vector3(...end)]);
      for(let leaf=0;leaf<5;leaf++){
        const progress=.30+leaf*.175,start=twig.getPoint(progress).toArray();
        blade(kit,colors,start,[.55+random()*.4,angle+leaf%2*Math.PI,.3],height*.15,height*.082,leaf%2?'#4e7555':'#6f8f66');
      }
    }
  });
}

function fern(kit,colors,position,seed) {
  kit.place(position,[0,seed,0],()=>{
    pot(kit,colors,.155,.225,'#889784');
    for(let frond=0;frond<9;frond++)kit.place([0,.20,0],[0,frond*2.4,0],()=>{
      const tip=.29+frond%3*.06;
      kit.curve([[0,0,0],[0,.22,.10],[0,.23,tip]],.003,colors.get('#667e52'),14,4);
      const rachis=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0,.22,.10),new THREE.Vector3(0,.23,tip)]);
      for(let pair=0;pair<7;pair++)for(const side of [-1,1]){
        const fraction=(pair+1)/8;
        blade(kit,colors,rachis.getPoint(fraction).toArray(),[.5,side*1.20,side*-.72],.10*(1-fraction*.65),.038,pair%2?'#78935f':'#557a52');
      }
    });
  });
}

export function buildEntranceGarden(kit,colors) {
  shrub(kit,colors,[-2.56,.115,3.01],1.14,.22,781,'#b09279');
  fern(kit,colors,[-2.63,.115,3.63],12);
  shrub(kit,colors,[5.98,.115,3.08],1.37,.27,942,'#83917d');
  shrub(kit,colors,[6.30,.115,3.77],.74,.17,219,'#bb9986');
  fern(kit,colors,[5.58,.115,3.42],4);
  kit.box([1.13,.32,.33],[3.83,.275,2.95],colors.get('#c1b28f'),.025);
  kit.box([1.01,.018,.255],[3.83,.428,2.95],colors.get('#59543c'),.009);
  for(let stem=0;stem<11;stem++){
    const centerX=3.36+stem*.09,topY=.56+stem%3*.06;
    kit.rod([centerX,.433,2.95],[centerX,topY,2.95],.003,colors.get('#6b8557'),5);
    blade(kit,colors,[centerX,.49,2.95],[.9,stem,0],.12,.058,stem%2?'#708957':'#59794f');
    for(let petal=0;petal<5;petal++){
      const angle=petal*Math.PI*.4;
      kit.sphere([.027,.009,.026],[centerX+Math.cos(angle)*.018,topY,2.95+Math.sin(angle)*.018],colors.get(stem%2?'#e5ce92':'#d6a9b6'),8);
    }
    kit.sphere([.009,.006,.009],[centerX,topY+.008,2.95],colors.get('#b39c52'),8);
  }
  return {pots:5,species:['camellia-like woody shrub','small-leaf shrub','fern','seasonal planter'],doorwayClear:true};
}
