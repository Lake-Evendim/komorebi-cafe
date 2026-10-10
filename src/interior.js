import * as THREE from 'three';
import { canvasTexture, labelTexture, placard } from './kit.js';
import { cafeLayout } from './cafe-layout.js';

export const cakeCabinetOffset=[.36,-.007,-1.48];

function vessel(kit, profile, position, material, rotation = 0, segments = 28) {
  const geometry = kit.geometry('vessel:' + JSON.stringify(profile) + ':' + segments, () => new THREE.LatheGeometry(profile.map(point => new THREE.Vector2(...point)), segments));
  kit.add(geometry, material, position, [0, rotation, 0]);
}

function ring(kit, radius, thickness, position, material, rotation = [-Math.PI / 2, 0, 0]) {
  const geometry = kit.geometry(`ring:${radius}:${thickness}`, () => new THREE.TorusGeometry(radius, thickness, 6, 28));
  kit.add(geometry, material, position, rotation);
}

function berry(kit, colors, position) {
  const [centerX, baseY, centerZ] = position;
  const red = colors.get('#c56672'), seed = colors.get('#e7b798'), leaf = colors.get('#85986a');
  vessel(kit, [[0, 0], [.012, .004], [.024, .019], [.020, .04], [.009, .052], [0, .053]], position, red, 0, 16);
  for (let dot = 0; dot < 10; dot++) {
    const angle = dot * 2.4, height = .010 + dot % 3 * .012;
    kit.sphere([.0019, .003, .0019], [centerX + Math.cos(angle) * .021, baseY + height, centerZ + Math.sin(angle) * .021], seed, 6);
  }
  for (let tip = 0; tip < 5; tip++) {
    const angle = tip * Math.PI * .4;
    kit.rod([centerX, baseY + .046, centerZ], [centerX + Math.cos(angle) * .017, baseY + .043, centerZ + Math.sin(angle) * .017], .004, leaf, 4);
  }
}

export function pastry(kit, colors, position, variant = 0) {
  const [centerX, baseY, centerZ] = position;
  const sponge = colors.get('#e3bc82'), cream = colors.get('#f3e8d3'), chocolate = colors.get('#785241');
  if (variant === 0) {
    const outline = new THREE.Shape();
    outline.moveTo(-.072, -.061); outline.lineTo(.081, 0); outline.lineTo(-.072, .061); outline.closePath();
    const layer = (height, offset, material) => {
      const geometry = new THREE.ExtrudeGeometry(outline, { depth: height, steps: 1, bevelEnabled: true, bevelSegments: 1, bevelSize: .002, bevelThickness: .002 });
      kit.add(geometry, material, [centerX, baseY + offset, centerZ], [-Math.PI / 2, 0, 0]);
      geometry.dispose();
    };
    layer(.038, 0, sponge); layer(.025, .039, cream);
    layer(.037, .065, sponge); layer(.014, .103, cream);
    for (let dollop = 0; dollop < 3; dollop++) {
      const localX = -.048 + dollop * .04;
      vessel(kit, [[0,0],[.013,.002],[.017,.010],[.012,.019],[.005,.026],[0,.029]], [centerX + localX, baseY + .119, centerZ], cream, dollop, 12);
    }
    berry(kit, colors, [centerX - .025, baseY + .132, centerZ]);
    for (let filling = 0; filling < 3; filling++) kit.sphere([.009,.009,.004], [centerX - .074, baseY + .051, centerZ - .04 + filling * .04], colors.get('#d9a0a3'), 8);
  } else if (variant === 1) {
    vessel(kit, [[0,0],[.067,0],[.072,.013],[.067,.024],[.059,.030],[0,.030]], position, sponge, 0, 24);
    kit.cylinder(.055, .055, .008, [centerX, baseY + .031, centerZ], cream, 24);
    for (let fruit = 0; fruit < 5; fruit++) {
      const angle = fruit * Math.PI * .4;
      berry(kit, colors, [centerX + Math.cos(angle) * .034, baseY + .036, centerZ + Math.sin(angle) * .034]);
    }
    kit.sphere([.013,.014,.013], [centerX, baseY + .05, centerZ], colors.get('#858497'), 10);
  } else if(variant===2) {
    kit.box([.12,.066,.11], [centerX,baseY+.033,centerZ], chocolate, .008);
    kit.box([.123,.018,.112], [centerX,baseY+.073,centerZ], colors.get('#ad8b66'), .005);
    kit.box([.123,.017,.112], [centerX,baseY+.091,centerZ], chocolate, .006);
    vessel(kit, [[0,0],[.026,.001],[.020,.014],[.013,.025],[.004,.035],[0,.038]], [centerX,baseY+.101,centerZ], cream, 0, 16);
    kit.box([.015,.036,.044], [centerX+.018,baseY+.14,centerZ], chocolate, .002, [0,.25,-.28]);
  } else if(variant===3) {
    const outline=new THREE.Shape();outline.moveTo(-.076,-.060);outline.lineTo(.081,0);outline.lineTo(-.076,.060);outline.closePath();
    const geometry=new THREE.ExtrudeGeometry(outline,{depth:.085,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.004,bevelThickness:.003});
    kit.add(geometry,colors.get('#e8cb9c'),position,[-Math.PI/2,0,0]);geometry.dispose();
    const top=new THREE.ExtrudeGeometry(outline,{depth:.005,steps:1,bevelEnabled:true,bevelSegments:1,bevelSize:.003,bevelThickness:.002});
    kit.add(top,colors.get('#996847'),[centerX,baseY+.089,centerZ],[-Math.PI/2,0,0]);top.dispose();
    for(let fleck=0;fleck<11;fleck++)kit.sphere([.004+fleck%3*.002,.001,.006],[centerX-.065+fleck%4*.021,baseY+.097,centerZ+(Math.floor(fleck/4)-1)*.018],colors.get('#654b38'),6);
    vessel(kit,[[0,0],[.025,0],[.026,.010],[.015,.024],[0,.030]],[centerX-.02,baseY+.096,centerZ+.009],cream,0,16);
  } else if(variant===4) {
    const outline=new THREE.Shape();outline.moveTo(-.070,-.061);outline.lineTo(.084,0);outline.lineTo(-.070,.061);outline.closePath();
    for(let layer=0;layer<12;layer++) {
      const geometry=new THREE.ExtrudeGeometry(outline,{depth:layer%2?.005:.004,steps:1,bevelEnabled:false});
      kit.add(geometry,colors.get(layer%2?'#e7ddbd':'#87955d'),[centerX,baseY+layer*.008,centerZ],[-Math.PI/2,0,0]);geometry.dispose();
    }
    const top=new THREE.ExtrudeGeometry(outline,{depth:.004,steps:1,bevelEnabled:false});
    kit.add(top,colors.get('#667642'),[centerX,baseY+.095,centerZ],[-Math.PI/2,0,0]);top.dispose();
    vessel(kit,[[0,0],[.024,0],[.029,.012],[.016,.026],[.004,.037],[0,.039]],[centerX-.025,baseY+.100,centerZ],cream,0,16);
    for(let bean=0;bean<3;bean++)kit.sphere([.011,.008,.014],[centerX-.025+(bean-1)*.019,baseY+.117,centerZ+.024],colors.get('#775744'),8);
  } else {
    vessel(kit,[[0,0],[.062,0],[.064,.01],[.061,.027],[.048,.029],[0,.029]],position,sponge,0,24);
    vessel(kit,[[0,0],[.035,0],[.035,.019],[.022,.073],[.006,.103],[0,.112]],[centerX,baseY+.029,centerZ],colors.get('#c7a17c'),0,24);
    for(let coil=0;coil<11;coil++) {
      const height=.031+coil*.009,radius=.049*(1-coil/13),points=[];
      for(let segment=0;segment<=24;segment++){const angle=segment*Math.PI/12;points.push([centerX+Math.cos(angle)*radius,baseY+height+segment/24*.005,centerZ+Math.sin(angle)*radius]);}
      kit.curve(points,.0033,colors.get(coil%2?'#b58d68':'#c7a17c'),24,4);
    }
    kit.sphere([.021,.020,.022],[centerX,baseY+.143,centerZ],colors.get('#7a4e35'),12);
    kit.box([.016,.025,.023],[centerX+.027,baseY+.130,centerZ-.006],chocolate,.002,[0,.12,-.18]);
  }
}

export function addCafeCraft(kit, colors, textures) {
  const cream = colors.get('#f0e7d3'), dark = colors.get('#516167'), timber = colors.get('#8c654c');
  const brass = colors.get('#a78d62'), paper = colors.get('#e1cfad');
  const steel = new THREE.MeshStandardMaterial({ color: '#b0bbb6', roughness: .32, metalness: .65, envMap: textures.reflections, envMapIntensity: .65 });

  const cloth=canvasTexture(256,256,painter=>{
    painter.fillStyle='#ded7c1';painter.fillRect(0,0,256,256);
    for(let stripe=0;stripe<32;stripe++) {painter.fillStyle=stripe%4===0?'rgba(93,116,110,.30)':'rgba(92,85,70,.07)';painter.fillRect(stripe*8,0,stripe%4===0?3:1,256);painter.fillRect(0,stripe*8,256,1);}
  });
  const clothMaterial=new THREE.MeshToonMaterial({map:cloth,color:'#fffaf0',gradientMap:colors.ramp,side:THREE.DoubleSide});
  const profile=[];
  for(let segment=0;segment<=12;segment++)profile.push([1.2495,-1.885+segment/12*.375]);
  for(let segment=1;segment<=12;segment++){
    const angle=segment/12*Math.PI/2;
    profile.push([1.2125+Math.cos(angle)*.037,-1.510+Math.sin(angle)*.037]);
  }
  for(let segment=1;segment<=12;segment++)profile.push([1.2125-segment/12*.23,-1.473]);
  const clothGeometry=new THREE.PlaneGeometry(.40,1,12,profile.length-1);
  const clothPositions=clothGeometry.attributes.position;
  for(let row=0;row<profile.length;row++)for(let column=0;column<=12;column++) {
    const vertex=row*13+column,localX=clothPositions.getX(vertex),[height,depth]=profile[row];
    const drop=Math.max(0,1.2125-height);
    clothPositions.setXYZ(vertex,localX,height+Math.sin(localX*36)*Math.min(drop,.02)*.08,depth+(1+Math.sin(localX*38))*drop*.0175);
  }
  const clothBounds=kit.measure(()=>{clothGeometry.computeVertexNormals();kit.add(clothGeometry,clothMaterial,[.85,0,0],[0,0,0],[1,1,1],false);});clothGeometry.dispose();

  const panel=colors.get('#a1886a');
  kit.box([7.7,.62,.028],[2,.68,-3.902],panel);
  kit.box([7.76,.043,.056],[2,1.015,-3.88],timber,.009);
  for(let board=0;board<35;board++)kit.box([.012,.59,.008],[-1.75+board*.222,.68,-3.88],timber);
  const calendar=labelTexture([{text:'四 月',size:50,y:65},{text:'日 月 火 水 木 金 土',size:20,y:104},{text:'　　1　2　3　4　5',size:20,y:145},{text:'6　7　8　9 10 11 12',size:20,y:183},{text:'春の便り',size:22,y:234}],{width:320,height:260,background:'#eee4ce'});
  kit.box([.43,.36,.022],[.04,2.31,-3.89],timber,.008);
  placard(kit,[.40,.325],[.04,2.31,-3.872],calendar);

  kit.place(cakeCabinetOffset,[0,0,0],()=>kit.box([1.02,.012,.025],[-.54,1.52,-.52],colors.get('#f3dfa9',{emissive:'#e9bb72',emissiveIntensity:.35})));
  const contact = canvasTexture(128,128,painter=>{
    const gradient=painter.createRadialGradient(64,64,8,64,64,62);
    gradient.addColorStop(0,'rgba(43,33,30,.28)');gradient.addColorStop(.38,'rgba(43,33,30,.19)');gradient.addColorStop(1,'rgba(43,33,30,0)');
    painter.fillStyle=gradient;painter.fillRect(0,0,128,128);
  });
  const contactMaterial=new THREE.MeshBasicMaterial({map:contact,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  const shadows=[...cafeLayout.grinders.map(position=>[position[0],position[1]+.0035,position[2],.36,.44]),...[[cafeLayout.dripper,.32,.30],[cafeLayout.kettle,.34,.31]].map(([position,width,depth])=>[position[0],position[1]+.0035,position[2],width,depth])];
  for(const [centerX,height,centerZ,width,depth] of [[4.53,1.251,-1.97,1.36,.77],...shadows,[-.54+cakeCabinetOffset[0],.350,-.32+cakeCabinetOffset[2],1.5,.91],[1.2,.350,-1.06,.72,.64],[2.35,.350,-1.06,.72,.64],[3.5,.350,-1.06,.72,.64],[4.65,.350,-1.06,.72,.64]]) {
    kit.add(new THREE.PlaneGeometry(width,depth),contactMaterial,[centerX,height,centerZ],[-Math.PI/2,0,0],[1,1,1],false);
  }
  kit.box([.028,.62,5.85],[5.859,.68,-.7],panel);
  kit.box([.052,.041,5.88],[5.841,1.015,-.7],timber,.008);
  for(let board=0;board<27;board++)kit.box([.006,.60,.012],[5.839,.68,-3.55+board*.223],timber);
  kit.box([.42,.04,.10],[.05,1.77,-3.84],timber,.008);
  for(const centerX of [-.09,.04,.17]) {
    kit.curve([[centerX,1.8,-3.78],[centerX,1.71,-3.75],[centerX,1.73,-3.70]],.006,brass,10,6);
  }
  kit.box([.20,.30,.052],[-.08,1.485,-3.77],colors.get('#bac0a5'),.024);
  ring(kit,.071,.006,[-.08,1.70,-3.74],colors.get('#bac0a5'),[0,0,0]);
  kit.box([.008,.12,.061],[.54,1.313,-2.14],timber,.004);
  kit.box([.17,.17,.09],[.56,1.335,-2.15],colors.get('#9c8770'),.017);
  for(let utensil=0;utensil<7;utensil++)kit.rod([.50+utensil*.018,1.37,-2.15],[.49+utensil*.020,1.55+utensil%3*.013,-2.15],.003,steel,5);
  const posBounds=kit.measure(()=>kit.place(cafeLayout.cashier,[0,0,0],()=>{
    kit.box([.22,.026,.18],[0,.013,0],dark,.007);
    kit.rod([0,.026,-.03],[0,.131,-.07],.016,steel,10);
    kit.box([.29,.184,.018],[0,.2125,-.06],dark,.010,[-.12,0,0]);
    placard(kit,[.259,.150],[0,.2125,-.044],labelTexture([{text:'ご注文',size:35,y:44},{text:'珈琲　2　¥ 1,000',size:24,y:95}],{width:518,height:300,background:'#355251',color:'#dce5d4'}),'#ffffff',[-.12,0,0]);
  }));
  return {posBounds:{min:posBounds.min.toArray(),max:posBounds.max.toArray()},clothBounds:{min:clothBounds.min.toArray(),max:clothBounds.max.toArray()}};
}
