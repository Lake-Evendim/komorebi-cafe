import * as THREE from 'three';
import { canvasTexture, labelTexture, placard } from './kit.js';
import { addCafeCraft, pastry, cakeCabinetOffset } from './interior.js';
import { buildBooks } from './books.js';
import { buildEquipment } from './equipment.js';
import { buildBar } from './bar.js';
import { cafeLayout } from './cafe-layout.js';

export function addDetails(kit, colors, textures) {
  const ceramic = colors.get('#ebe4cf');
  const steel = colors.get('#aab8b1');
  const brass = colors.get('#a78d62');
  const timber = colors.get('#8c654c');
  const dark = colors.get('#55676a');
  const coffee = colors.get('#7b553b');
  const glass = new THREE.MeshPhysicalMaterial({ color: '#d3e4df', transparent: true, opacity: .075, roughness: .1, metalness: .07, envMap: textures.reflections, envMapIntensity: .7, side: THREE.DoubleSide, depthWrite: false,forceSinglePass:true });
  const clock = canvasTexture(256, 256, painter => {
    painter.fillStyle = '#e8dfc3'; painter.beginPath(); painter.arc(128, 128, 124, 0, Math.PI * 2); painter.fill();
    painter.strokeStyle = '#586568'; painter.lineWidth = 9; painter.stroke();
    for (let marker = 0; marker < 12; marker++) {
      const angle = marker * Math.PI / 6; painter.beginPath(); painter.moveTo(128 + Math.sin(angle) * 97, 128 - Math.cos(angle) * 97); painter.lineTo(128 + Math.sin(angle) * 107, 128 - Math.cos(angle) * 107); painter.lineWidth = 4; painter.stroke();
    }
    painter.lineWidth = 7; painter.beginPath(); painter.moveTo(128, 128); painter.lineTo(75, 158); painter.stroke();
    painter.lineWidth = 4; painter.beginPath(); painter.moveTo(128, 128); painter.lineTo(174, 70); painter.stroke();
    painter.fillStyle = '#697471'; painter.beginPath(); painter.arc(128, 128, 6, 0, 6.29); painter.fill();
  });
  kit.cylinder(.265, .265, .06, [.05, 2.83, -3.87], brass, 40, [Math.PI / 2, 0, 0]);
  placard(kit, [.51, .51], [.05, 2.83, -3.82], clock);

  const cabinetBounds=kit.measure(()=>kit.place(cakeCabinetOffset,[0,0,0],()=>{
    kit.box([1.02, .55, .59], [-.54, .63, -.32], timber, .024);
    kit.box([1.12, .052, .63], [-.54, .92, -.32], ceramic, .024);
    kit.box([1.10, .05, .66], [-.54, 1.58, -.36], dark, .018);
    for(const centerX of [-1.04,-.04])for(const centerZ of [-.60,-.04])kit.box([.036,.606,.036],[centerX,1.251,centerZ],brass,.005);
    kit.add(new THREE.PlaneGeometry(.964,.565),glass,[-.54,1.257,-.04],[0,0,0],[1,1,1],false);
    kit.add(new THREE.PlaneGeometry(.964,.524),glass,[-.54,1.548,-.32],[-Math.PI/2,0,0],[1,1,1],false);
    for(const centerX of [-1.04,-.04])kit.add(new THREE.PlaneGeometry(.524,.565),glass,[centerX,1.257,-.32],[0,Math.PI/2,0],[1,1,1],false);
    for (const shelfY of [1.0, 1.27]) {
      kit.box([1.02, .015, .48], [-.54, shelfY, -.32], steel);
      for (let cake = 0; cake < 3; cake++) {
        const centerX = -.88 + cake * .33;
        const variety=cake+(shelfY>1.1?3:0);
        kit.cylinder(.105, .105, .012, [centerX, shelfY + .0135, -.23], ceramic, 22);
        pastry(kit, colors, [centerX, shelfY + [.0215,.0195,.0195,.0225,.0195,.0195][variety], -.23], variety);
        const names=['苺ショート 580','ベリータルト 620','オペラ 640','バスクチーズ 600','抹茶ミルクレープ 650','モンブラン 680'];
        placard(kit,[.252,.051],[centerX,shelfY+.022,-.005],labelTexture([{text:names[variety],size:27,y:47}],{width:378,height:77,background:'#ebe5d7'}));
      }
    }
    placard(kit, [.38, .084], [-.54, .70, -.008], labelTexture([{ text: '本日のケーキ', size: 44, y: 83 }], { width: 384, height: 120 }));
  }));
  const serviceBounds=kit.measure(()=>kit.place(cafeLayout.delivery,[0,-.08,0],()=>{
    kit.box([.49,.014,.29],[0,.007,0],colors.get('#5d6b58'),.012);
    kit.box([.15,.006,.12],[.13,.017,-.045],colors.get('#dfd4be'),.003,[0,.08,0]);
    for (const centerX of [-.10]) {
      const profile=[[0,0],[.043,0],[.057,.097],[.056,.10],[.051,.10],[.039,.012],[0,.012]];
      const geometry=kit.geometry('handover-cup',()=>new THREE.LatheGeometry(profile.map(point=>new THREE.Vector2(...point)),24));
      kit.add(geometry,ceramic,[centerX,.014,-.02]);
      kit.add(kit.geometry('handover-cup-handle',()=>new THREE.TorusGeometry(.019,.004,6,24)),ceramic,[centerX+.056,.078,-.02]);
      kit.cylinder(.048, .048, .003, [centerX,.099,-.02], coffee, 24);
    }
    kit.rod([.13,.023,-.08],[.13,.023,.01],.003,steel,6);
    kit.sphere([.010,.003,.016],[.13,.023,.026],steel,8);
  }));
  kit.box([.15,.23,.020],[.72,1.388,-2.08],timber,.004,[0,.20,0]);
  placard(kit,[.135,.211],[.724,1.388,-2.067],textures.menu,'#ffffff',[0,.20,0]);
  kit.box([.18,.025,.13],[.72,1.26,-2.08],timber,.004);

  const lace = canvasTexture(256, 256, painter => {
    painter.fillStyle = 'rgba(237,231,211,.83)'; painter.fillRect(0, 0, 256, 256);
    painter.strokeStyle = 'rgba(210,207,185,.65)'; painter.lineWidth = 2;
    for (let stripe = 0; stripe < 16; stripe++) { painter.beginPath(); painter.moveTo(stripe * 16,0); painter.lineTo(stripe * 16,256); painter.stroke(); }
    painter.globalCompositeOperation='destination-out';
    for(let row=0;row<9;row++)for(let column=0;column<9;column++){
      const centerX=column*30+row%2*15,centerY=18+row*24;
      for(let petal=0;petal<4;petal++){
        const angle=petal*Math.PI/2;
        painter.beginPath();painter.ellipse(centerX+Math.cos(angle)*6,centerY+Math.sin(angle)*6,3.0,1.8,angle,0,Math.PI*2);painter.fill();
      }
    }
    painter.globalCompositeOperation='source-over';
    painter.clearRect(0, 211, 256, 45);
    for (let loop = 0; loop < 8; loop++) { painter.fillStyle = 'rgba(237,231,211,.83)'; painter.beginPath(); painter.arc(16 + loop * 32, 203, 17,0,6.3); painter.fill(); }
  });
  const curtainMaterial = new THREE.MeshToonMaterial({ map: lace, color: '#fff8e0', gradientMap: colors.ramp, alphaTest: .2, alphaToCoverage:true, side: THREE.DoubleSide });
  const curtain = new THREE.PlaneGeometry(1.04,.52,28,4);
  const folds = curtain.attributes.position;
  for(let vertex=0;vertex<folds.count;vertex++) {
    const localX=folds.getX(vertex),localY=folds.getY(vertex);
    folds.setXYZ(vertex,localX,localY+.009*Math.sin(localX*42),.023*Math.sin(localX*42)*(1.1-localY));
  }
  curtain.computeVertexNormals();
  for (let pane = 0; pane < 4; pane++) {
    const centerX = 1.1 + pane * 1.15;
    kit.add(curtain, curtainMaterial, [centerX, 2.60, 2.41], [0, 0, 0], [1,1,1], false);
    kit.rod([centerX - .54, 2.90, 2.39], [centerX + .54, 2.90, 2.39], .012, brass);
  }
  curtain.dispose();
  kit.rod([-1.76, 2.97, -.30], [-1.76, 2.62, -.30], .004, brass);
  kit.sphere([.058, .045, .058], [-1.76, 2.58, -.3], glass, 14);
  placard(kit, [.04, .18], [-1.76, 2.41, -.30], labelTexture([{text:'春',size:66,y:100}],{width:128,height:180,background:'#e3cbb0'}));

  const seam=colors.get('#6c6255');
  for (let latch=0;latch<4;latch++){
    kit.box([.085,.019,.025],[1.12+latch*1.15,2.02,2.65],brass,.006);
    kit.box([.022,.064,.02],[1.12+latch*1.15,2.00,2.66],steel,.005);
  }
  for (let screw=0;screw<14;screw++) kit.sphere([.009,.009,.004],[.47+screw*.36,.56,2.59],seam,8);
  const moss=colors.get('#9aaa78');
  for(let clump=0;clump<18;clump++)kit.sphere([.016,.018,.023],[-2.21,.17,2.6-clump*.20],moss,6);
  const craft=addCafeCraft(kit, colors, textures);
  const equipment=buildEquipment(kit,colors,textures);
  const serviceObjects=[{min:serviceBounds.min.toArray(),max:serviceBounds.max.toArray()},craft.posBounds];
  for(const object of serviceObjects)for(const obstacle of [equipment.machineBounds,...equipment.grinderBounds,...equipment.brewingBounds]){
    if(new THREE.Box3(new THREE.Vector3(...object.min),new THREE.Vector3(...object.max)).intersectsBox(new THREE.Box3(new THREE.Vector3(...obstacle.min),new THREE.Vector3(...obstacle.max))))throw new Error('交付或收银物件与咖啡设备相交');
  }
  const counterClearance=.45-cabinetBounds.max.x;
  if(counterClearance<.06||Math.abs(cabinetBounds.min.y-.348)>.001)throw new Error('蛋糕柜与吧台间距或地面支撑错误');
  const books=buildBooks(kit,colors);
  const bar=buildBar(kit,colors,textures);
  for(const workstation of bar.workstations)for(const obstacle of [equipment.machineBounds,...equipment.grinderBounds])if(new THREE.Box3(new THREE.Vector3(...workstation.min),new THREE.Vector3(...workstation.max)).intersectsBox(new THREE.Box3(new THREE.Vector3(...obstacle.min),new THREE.Vector3(...obstacle.max))))throw new Error('压粉或敲渣工位与主设备相交');
  return {books,equipment,bar,service:{bounds:serviceObjects[0],posBounds:craft.posBounds,clothBounds:craft.clothBounds},cakes:{count:6,bounds:{min:cabinetBounds.min.toArray(),max:cabinetBounds.max.toArray()},counterClearance,leftWallClearance:cabinetBounds.min.x+1.865,bookcaseClearance:cabinetBounds.min.x-books.cabinet.max[0],varieties:['strawberry shortcake','berry tart','opera','Basque cheesecake','matcha mille crepe','Mont Blanc']}};
}
