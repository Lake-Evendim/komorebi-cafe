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

function fleshyLeaf(kit) {
  return kit.geometry('succulent-fleshy-leaf',()=>{
    const vertices=[],indices=[],rings=8,sides=8;
    for(let ring=0;ring<=rings;ring++)for(let side=0;side<=sides;side++){
      const t=ring/rings,angle=side/sides*Math.PI*2,fullness=Math.pow(Math.sin(t*Math.PI),.72);
      vertices.push(Math.sin(angle)*fullness*.5,.08*Math.sin(t*Math.PI)+.32*t*t+Math.cos(angle)*fullness*.14,t);
    }
    for(let ring=0;ring<rings;ring++)for(let side=0;side<sides;side++){
      const a=ring*(sides+1)+side,b=a+sides+1;
      indices.push(a,b,a+1,a+1,b,b+1);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
  });
}

function swordLeaf(kit,colors,position,length,width,rotation,variegated=false) {
  const geometry=kit.geometry('sword-leaf:'+length+':'+width+':'+variegated,()=>{
    const points=[],tints=[],indices=[],across=[-.5,-.36,0,.36,.5];
    for(let row=0;row<=10;row++)for(let column=0;column<across.length;column++){
      const t=row/10,shape=(.35+.65*Math.sin(t*Math.PI*.85))*(1-Math.pow(t,6)),x=across[column]*width*shape;
      points.push(x,t*length,length*(.055*Math.sin(t*Math.PI)+.11*t*t)-Math.abs(x)*.24);
      const color=new THREE.Color(variegated&&(column===0||column===4)?'#c5bd79':row%2?'#749467':'#537a60');
      tints.push(color.r,color.g,color.b);
    }
    for(let row=0;row<10;row++)for(let column=0;column<4;column++){
      const a=row*5+column,b=a+5;indices.push(a,a+1,b,a+1,b+1,b);
    }
    const leaf=new THREE.BufferGeometry();leaf.setAttribute('position',new THREE.Float32BufferAttribute(points,3));leaf.setAttribute('color',new THREE.Float32BufferAttribute(tints,3));leaf.setIndex(indices);leaf.computeVertexNormals();return leaf;
  });
  kit.add(geometry,colors.get('#ffffff',{vertexColors:true,side:THREE.DoubleSide}),position,rotation);
}

function snakePlant(kit,colors,position) {
  kit.place(position,[0,0,0],()=>{
    pot(kit,colors,.18,.29,'#ded4ba');
    for(let leaf=0;leaf<9;leaf++){
      const angle=leaf*2.4,distance=leaf%3*.035;
      swordLeaf(kit,colors,[Math.sin(angle)*distance,.265,Math.cos(angle)*distance],.51+leaf%4*.11,.084,[-.06-leaf%3*.04,angle,leaf%2*.08],true);
    }
  });
}

function splitLeaf(kit,colors,position,rotation,size) {
  const geometry=kit.geometry('split-heart-leaf',()=>{
    const shape=new THREE.Shape(),right=[[0,0],[.15,-.04],[.25,.08],[.29,.20],[.15,.24],[.30,.34],[.11,.39],[.25,.50],[.07,.53],[.14,.67],[0,.79]];
    const outline=[...right,...right.slice(1,-1).reverse().map(([x,y])=>[-x,y])];
    shape.moveTo((outline[0][0]+outline[1][0])/2,(outline[0][1]+outline[1][1])/2);
    for(let index=1;index<=outline.length;index++){
      const current=outline[index%outline.length],next=outline[(index+1)%outline.length];
      shape.quadraticCurveTo(...current,(current[0]+next[0])/2,(current[1]+next[1])/2);
    }
    shape.closePath();
    for(const side of [-1,1]){
      const hole=new THREE.Path();hole.absellipse(side*.087,.29,.020,.051,0,Math.PI*2,true,.17*side);shape.holes.push(hole);
    }
    const leaf=new THREE.ShapeGeometry(shape,10),points=leaf.attributes.position;
    for(let vertex=0;vertex<points.count;vertex++){
      const x=points.getX(vertex),y=points.getY(vertex);points.setZ(vertex,.055*Math.sin(y*Math.PI)-Math.abs(x)*.16);
    }
    leaf.computeVertexNormals();return leaf;
  });
  kit.place(position,rotation,()=>{
    kit.add(geometry,colors.get('#49775a',{side:THREE.DoubleSide}),[0,0,0],[0,0,0],[size,size,size]);
    kit.curve([[0,0,0],[0,.38*size,.05*size],[0,.76*size,.008*size]],.003,colors.get('#9ab178'),10,4);
    for(let vein=0;vein<4;vein++)for(const side of [-1,1])kit.rod([0,(.16+vein*.13)*size,.04*size],[side*(.20-vein*.025)*size,(.21+vein*.13)*size,.012*size],.0018,colors.get('#7ea070'),4);
  });
}

function monstera(kit,colors,position) {
  kit.place(position,[0,0,0],()=>{
    pot(kit,colors,.26,.37,'#879785');
    for(let stem=0;stem<7;stem++){
      const angle=stem*2.4,reach=.15+stem%3*.04,tip=[Math.sin(angle)*reach,.54+stem%3*.15,Math.cos(angle)*reach];
      kit.curve([[0,.33,0],[tip[0]*.5,tip[1]-.12,tip[2]*.5],tip],.007,colors.get('#647f54'),12,5);
      splitLeaf(kit,colors,tip,[.36+stem%2*.22,angle,.12*Math.sin(angle)],.49+stem%3*.09);
    }
  });
}

function hydrangea(kit,colors,position) {
  kit.place(position,[0,0,0],()=>{
    pot(kit,colors,.20,.27,'#bba38b');
    for(let stem=0;stem<6;stem++){
      const angle=stem*2.4,tip=[Math.sin(angle)*.14,.49+stem%3*.07,Math.cos(angle)*.14];
      kit.rod([0,.245,0],tip,.005,colors.get('#708358'),5);
      for(const side of [-1,1])blade(kit,colors,[tip[0]*.55,.35+stem%3*.03,tip[2]*.55],[.80,angle+side*.8,side*.35],.20,.125,side>0?'#71976b':'#527d5b');
      for(let floret=0;floret<22;floret++){
        const vertical=1-2*(floret+.5)/22,ring=Math.sqrt(1-vertical*vertical),phase=floret*2.4;
        const center=[tip[0]+Math.cos(phase)*ring*.079,tip[1]+vertical*.069,tip[2]+Math.sin(phase)*ring*.079];
        for(let petal=0;petal<4;petal++){
          const turn=petal*Math.PI/2;
          kit.sphere([.013,.008,.015],[center[0]+Math.cos(turn)*.011,center[1],center[2]+Math.sin(turn)*.011],colors.get(stem%2?'#b7b6d4':'#d4c1d1'),6);
        }
        kit.sphere([.004,.004,.004],center,colors.get('#ddd6b8'),6);
      }
    }
  });
}

function herbPot(kit,colors,position,lavender=false) {
  kit.place(position,[0,0,0],()=>{
    pot(kit,colors,.18,.24,lavender?'#b09d88':'#97a695');
    for(let stem=0;stem<(lavender?15:10);stem++){
      const angle=stem*2.4,spread=.10+stem%3*.025,top=.52+stem%4*.055;
      const tip=[Math.sin(angle)*spread,top,Math.cos(angle)*spread];
      kit.rod([tip[0]*.32,.215,tip[2]*.32],tip,.003,colors.get('#829675'),5);
      for(let pair=0;pair<6;pair++)for(const side of [-1,1]){
        const t=.18+pair*.11,y=.225+(top-.225)*t;
        blade(kit,colors,[tip[0]*(.32+.68*t),y,tip[2]*(.32+.68*t)],[.78,angle+side*1.2,side*.32],lavender?.066:.052,lavender?.014:.011,lavender?'#9bad95':'#6f8970');
      }
      if(lavender)for(let blossom=0;blossom<7;blossom++){
        const phase=blossom*2.4;
        kit.sphere([.013,.017,.013],[tip[0]+Math.sin(phase)*.008,top-.035+blossom*.018,tip[2]+Math.cos(phase)*.008],colors.get(blossom%2?'#9b91b2':'#b3a6c4'),8);
      }
    }
  });
}

function hangingPothos(kit,colors,position) {
  const leafGeometry=kit.geometry('pothos-heart-leaf',()=>{
    const shape=new THREE.Shape();shape.moveTo(0,0);
    shape.bezierCurveTo(.018,.040,.063,.030,.060,-.004);
    shape.bezierCurveTo(.057,-.032,.016,-.068,0,-.083);
    shape.bezierCurveTo(-.016,-.068,-.057,-.032,-.060,-.004);
    shape.bezierCurveTo(-.063,.030,-.018,.040,0,0);
    const leaf=new THREE.ShapeGeometry(shape,8),points=leaf.attributes.position;
    for(let vertex=0;vertex<points.count;vertex++)points.setZ(vertex,.012-Math.abs(points.getX(vertex))*.20);
    leaf.computeVertexNormals();return leaf;
  });
  kit.place(position,[0,0,0],()=>{
    pot(kit,colors,.17,.17,'#b8a58b');
    const steel=colors.get('#697772'),anchor=[0,1.115,.16];
    kit.add(kit.geometry('plant-hanging-hook',()=>new THREE.TorusGeometry(.034,.005,5,14,Math.PI*1.65)),steel,anchor);
    for(let cord=0;cord<3;cord++){
      const angle=cord/3*Math.PI*2;
      kit.rod(anchor,[Math.sin(angle)*.155,.15,Math.cos(angle)*.155],.0035,steel,5);
    }
    for(let vine=0;vine<7;vine++){
      const angle=vine*2.4,length=.37+vine%3*.08;
      const path=new THREE.CatmullRomCurve3([[Math.sin(angle)*.06,.145,Math.cos(angle)*.06],[Math.sin(angle)*.21,.16,Math.cos(angle)*.21],[Math.sin(angle)*.24,-length*.45,Math.cos(angle)*.24],[Math.sin(angle)*.20,-length,Math.cos(angle)*.20]].map(p=>new THREE.Vector3(...p)));
      kit.add(new THREE.TubeGeometry(path,14,.003,4,false),colors.get('#6c895e'),[0,0,0]);
      for(let leaf=0;leaf<7;leaf++){
        const point=path.getPoint(.12+leaf*.14).toArray(),side=leaf%2?1:-1;
        kit.place(point,[.18,angle+side*.7,side*.4],()=>{
          kit.add(leafGeometry,colors.get(leaf%3?'#6c946c':'#b0ba79',{side:THREE.DoubleSide}),[0,0,0]);
          kit.curve([[0,0,0],[0,-.037,.013],[0,-.078,.012]],.0013,colors.get('#b3c28a'),5,3);
        });
      }
    }
  });
}

function rosette(kit,colors,position,radius,phase=0,tints=['#88aa96','#acc3ad','#c6cdb1']) {
  kit.place(position,[0,phase,0],()=>{
    for(let layer=0;layer<3;layer++){
      const count=11-layer*2,length=radius*(1-layer*.24);
      for(let leaf=0;leaf<count;leaf++){
        const angle=leaf/count*Math.PI*2+layer*.43;
        kit.add(fleshyLeaf(kit),colors.get(tints[layer]),[Math.sin(angle)*radius*.10,layer*.012,Math.cos(angle)*radius*.10],[-.12-layer*.25,angle,0],[length*.58,length,length]);
      }
    }
    kit.sphere([radius*.12,radius*.15,radius*.12],[0,.05,0],colors.get(tints[2]),8);
  });
}

function succulentPot(kit,colors,position,radius,height,variant,tint) {
  kit.place(position,[0,variant*.7,0],()=>{
    // A visible gravel surface and saucer keep the plants seated in their pots.
    kit.cylinder(radius*.80,radius*.86,.018,[0,.009,0],colors.get('#ae9279'),24);
    pot(kit,colors,radius,height,tint);
    const soilY=height-.030,random=seeded(400+variant);
    for(let pebble=0;pebble<19;pebble++){
      const angle=pebble*2.4,distance=radius*Math.sqrt(random())*.81;
      kit.sphere([.012,.006,.009],[Math.cos(angle)*distance,soilY,Math.sin(angle)*distance],colors.get(pebble%3?'#c8ba98':'#988d73'),6);
    }
    if(variant%3===0){
      rosette(kit,colors,[0,soilY+.005,0],radius*.91,variant,['#819e9e','#a5b9b4','#c7cdb8']);
      rosette(kit,colors,[radius*.57,soilY+.006,-radius*.41],radius*.36,.7,['#ac8d97','#c5a9b0','#d9c2bc']);
    }else if(variant%3===1){
      rosette(kit,colors,[-radius*.28,soilY,0],radius*.65,.5,['#688f79','#94af89','#b9c4a0']);
      rosette(kit,colors,[radius*.37,soilY,radius*.21],radius*.48,1.8,['#b28f9b','#c6aab4','#dcc6c5']);
      rosette(kit,colors,[radius*.29,soilY,-radius*.42],radius*.36,0);
    }else if(variant===5){
      for(const [x,z,rise,scale] of [[-.035,0,.12,1],[.051,.015,.073,.64]]){
        kit.sphere([radius*.42*scale,rise*.8,radius*.42*scale],[x,soilY+rise*.68,z],colors.get('#82a48b'),16);
        for(let rib=0;rib<8;rib++){
          const angle=rib*Math.PI/4;
          kit.curve([[x+Math.sin(angle)*radius*.31*scale,soilY+.016,z+Math.cos(angle)*radius*.31*scale],[x+Math.sin(angle)*radius*.425*scale,soilY+rise*.68,z+Math.cos(angle)*radius*.425*scale],[x+Math.sin(angle)*radius*.14*scale,soilY+rise*1.4,z+Math.cos(angle)*radius*.14*scale]],.002,colors.get('#bac49b'),8,3);
          for(let spine=0;spine<3;spine++){
            const y=soilY+.026+spine*rise*.35,distance=radius*.42*scale;
            kit.rod([x+Math.sin(angle)*distance,y,z+Math.cos(angle)*distance],[x+Math.sin(angle)*(distance+.01),y+.008,z+Math.cos(angle)*(distance+.01)],.001,colors.get('#e0d9b5'),3);
          }
        }
      }
    }else{
      for(let stem=0;stem<5;stem++){
        const angle=stem*2.4,tip=[Math.sin(angle)*radius*.48,soilY+radius*(.75+stem%2*.25),Math.cos(angle)*radius*.48];
        const base=[Math.sin(angle)*radius*.15,soilY,Math.cos(angle)*radius*.15];
        kit.rod(base,tip,.007,colors.get('#7c8961'),6);
        for(let pair=0;pair<3;pair++)for(const side of [-1,1]){
          const t=.35+pair*.26;
          kit.sphere([radius*.19,radius*.085,radius*.29],[base[0]+(tip[0]-base[0])*t+side*radius*.12,base[1]+(tip[1]-base[1])*t,base[2]+(tip[2]-base[2])*t],colors.get(pair%2?'#91ac79':'#6e956d'),8);
        }
      }
    }
  });
}

function waterLeaf(kit,colors,position,radius,rotation,notched=false) {
  const key='water-leaf:'+notched;
  const geometry=kit.geometry(key,()=>{
    const outline=new THREE.Shape(),start=notched?.24:0,end=notched?Math.PI*2-.24:Math.PI*2;
    if(notched)outline.moveTo(0,-.16);
    for(let point=0;point<=40;point++){
      const angle=start+(end-start)*point/40,r=1+(notched?0:.035*Math.sin(angle*9));
      const x=Math.sin(angle)*r,y=Math.cos(angle)*r;
      if(!point&&!notched)outline.moveTo(x,y);else outline.lineTo(x,y);
    }
    outline.closePath();return new THREE.ShapeGeometry(outline,20);
  });
  kit.place(position,[0,rotation,0],()=>{
    kit.add(geometry,colors.get(notched?'#63866c':'#8caa73',{side:THREE.DoubleSide}),[0,0,0],[-Math.PI/2,0,0],[radius,radius,1]);
    for(let vein=0;vein<6;vein++){
      const angle=.5+vein*.94;
      kit.rod([0,.002,0],[Math.sin(angle)*radius*.80,.002,-Math.cos(angle)*radius*.80],.0014,colors.get('#b1bc85'),4);
    }
  });
}

function waterGarden(kit,colors,position,radius,height,lilies) {
  kit.place(position,[0,0,0],()=>{
    const glaze=colors.get(lilies?'#708b83':'#a8ad91');
    const profile=[[radius*.71,0],[radius*.83,.025],[radius*.95,height*.42],[radius,height*.88],[radius*1.03,height],[radius*.90,height],[radius*.87,height*.83],[radius*.68,.06]];
    kit.add(kit.geometry('water-bowl:'+radius+':'+height,()=>new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),32)),glaze,[0,0,0]);
    kit.cylinder(radius*.73,radius*.73,.027,[0,.0135,0],glaze,28);
    const waterY=height-.032;
    const water=colors.get('#729d96');
    kit.cylinder(radius*.89,radius*.89,.008,[0,waterY-.004,0],water,40);
    // Opaque, pale reflections avoid another transparent layer in the scene.
    for(let ripple=0;ripple<3;ripple++)kit.add(kit.geometry('water-ripple:'+radius+':'+ripple,()=>new THREE.TorusGeometry(radius*(.32+ripple*.16),.0018,4,40)),colors.get('#b0c9ba'),[0,waterY+.002,0],[-Math.PI/2,0,0],[1,1,1],false);
    if(lilies){
      // Floating pads occupy the front and right; emergent stems use the open rear water.
      for(const [x,z,size,angle] of [[-.12,.115,.097,.3],[.11,.115,.090,2.1],[.115,-.08,.076,3.7]])waterLeaf(kit,colors,[x,waterY+.009,z],size,angle,true);
      const bloom=[-.02,waterY+.055,-.04];
      kit.rod([bloom[0],waterY-.008,bloom[2]],bloom,.004,colors.get('#77946c'),6);
      for(let layer=0;layer<2;layer++)for(let petal=0;petal<9-layer*2;petal++){
        const angle=petal/(9-layer*2)*Math.PI*2+layer*.4,length=.081-layer*.026;
        kit.add(fleshyLeaf(kit),colors.get(layer?'#f5e3de':'#d9b9c5'),[bloom[0],bloom[1]+layer*.007,bloom[2]],[-.18-layer*.45,angle,0],[length*.52,length*.66,length]);
      }
      kit.sphere([.019,.012,.019],[bloom[0],bloom[1]+.027,bloom[2]],colors.get('#d4b667'),10);
    }
    const emergentSites=lilies?[[-.01,-.205],[.015,-.16],[.055,-.202]]:Array.from({length:7},(_,stem)=>[Math.sin(stem*2.4)*radius*.43,Math.cos(stem*2.4)*radius*.43]);
    for(const [stem,[x,z]] of emergentSites.entries()){
      const angle=stem*2.4;
      const top=waterY+(lilies?.14:.19)+stem%3*.05;
      kit.curve([[x,waterY-.006,z],[x+.012,top-.05,z],[x+.032,top,z+.016]],.0025,colors.get('#76935e'),8,4);
      waterLeaf(kit,colors,[x+.032,top,z+.016],lilies?.040:.057,angle);
    }
    for(let reed=0;reed<5;reed++){
      const x=-radius*(lilies?.42:.56)+reed*(lilies?.017:.022),z=-radius*(lilies?.58:.40),reach=waterY+.28+reed%3*.06;
      kit.curve([[x,waterY,z],[x,reach-.12,z],[x-.023,reach,z+.032]],.0025,colors.get('#65865a'),10,4);
      blade(kit,colors,[x,waterY+.07,z],[-.18,reed*.6,.12],.28+reed%3*.04,.022,reed%2?'#8ba375':'#577d62');
    }
  });
}

export function buildEntranceGarden(kit,colors) {
  shrub(kit,colors,[-2.56,.115,3.01],1.14,.22,781,'#b09279');
  fern(kit,colors,[-2.63,.115,3.63],12);
  monstera(kit,colors,[5.98,.115,3.08]);
  hydrangea(kit,colors,[6.30,.115,3.88]);
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
  const additions=[];
  const add=(name,build)=>{
    const bounds=kit.measure(build);
    const entrance=new THREE.Box3(new THREE.Vector3(-1.80,.115,2.58),new THREE.Vector3(-.08,2.3,4.65));
    if(bounds.intersectsBox(entrance)||bounds.min.x<-4.2||bounds.max.z>4.65)throw new Error('门口盆栽占用入口通道或道路');
    additions.push({name,min:bounds.min.toArray(),max:bounds.max.toArray()});
  };
  add('water-lily bowl',()=>waterGarden(kit,colors,[-2.20,.115,4.10],.33,.31,true));
  add('pennywort and rush bowl',()=>waterGarden(kit,colors,[.33,.115,2.99],.25,.30,false));
  add('six succulent pots on stepped timber stand',()=>kit.place([2.46,.115,2.98],[0,0,0],()=>{
    const wood=colors.get('#a08a6a'),feet=colors.get('#726e56');
    for(const [height,z] of [[.50,-.05],[.22,.29]]){
      kit.box([1.02,.04,.33],[0,height-.02,z],wood,.012);
      for(const x of [-.43,.43])for(const offsetZ of [-.11,.11])kit.box([.044,height-.04,.044],[x,(height-.04)/2,z+offsetZ],feet,.007);
    }
    for(let row=0;row<2;row++)for(let column=0;column<3;column++)succulentPot(kit,colors,[-.33+column*.33,row?.22:.50,row?.29:-.05],.112,.15,row*3+column,['#c1ad8e','#8dada2','#b18f7b'][column]);
  }));
  add('large succulent bowl',()=>succulentPot(kit,colors,[2.38,.115,3.87],.235,.19,3,'#b8947e'));
  add('jade plant pot',()=>succulentPot(kit,colors,[4.82,.115,3.02],.18,.24,8,'#879c8b'));
  add('left-side rosette pot',()=>succulentPot(kit,colors,[-3.35,.115,3.33],.21,.19,4,'#c4b79b'));
  add('variegated snake plant',()=>snakePlant(kit,colors,[.17,.115,3.84]));
  add('rosemary pot',()=>herbPot(kit,colors,[3.40,.115,3.85]));
  add('lavender pot',()=>herbPot(kit,colors,[4.21,.115,3.90],true));
  add('pothos hanging basket',()=>hangingPothos(kit,colors,[4.85,1.82,3.10]));
  return {pots:20,aquaticPots:2,succulentPots:9,hangingPots:1,species:['camellia-like woody shrub','fern','seasonal planter','water lily','pennywort','rush','rosette succulent','jade-like succulent','ribbed cactus','monstera','hydrangea','variegated snake plant','rosemary','lavender','pothos'],additions,doorwayClear:true};
}

