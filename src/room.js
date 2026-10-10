import * as THREE from 'three';
import { canvasTexture, placard, seeded } from './kit.js';
import { pastry } from './interior.js';
import { cafeLayout } from './cafe-layout.js';

function lathe(kit, profile, position, material, rotation = [0,0,0]) {
  const geometry=kit.geometry('room-lathe:'+JSON.stringify(profile),()=>new THREE.LatheGeometry(profile.map(point=>new THREE.Vector2(...point)),32));
  kit.add(geometry,material,position,rotation);
}

function chair(kit, wood, fabric, position, angle) {
  kit.place(position,[0,angle,0],()=>{
    kit.box([.46,.06,.46],[0,.26,0],wood,.025);
    kit.box([.42,.055,.41],[0,.31,0],fabric,.035);
    for(const localX of [-.18,.18])for(const localZ of [-.18,.18])kit.rod([localX*1.12,0,localZ*1.12],[localX,.29,localZ],.024,wood,10);
    for(const localX of [-.19,.19])kit.rod([localX,.27,-.19],[localX,.86,-.24],.023,wood,10);
    kit.box([.42,.26,.065],[0,.72,-.22],fabric,.045,[-.09,0,0]);
    kit.curve([[-.21,.84,-.23],[0,.88,-.25],[.21,.84,-.23]],.021,wood,16,8);
    kit.rod([-.18,.12,-.18],[.18,.12,-.18],.013,wood);
  });
}

function service(kit, colors, position, rotation, variant) {
  const porcelain=colors.get('#eee2cc'), coffee=colors.get('#533827'), blue=colors.get('#748d92'), silver=colors.get('#aeb2aa');
  kit.place(position,[0,rotation,0],()=>{
    lathe(kit,[[0,0],[.08,0],[.107,.015],[.104,.020],[.072,.009],[0,.009]],[0,0,0],porcelain);
    lathe(kit,[[0,0],[.042,0],[.046,.015],[.060,.079],[.064,.081],[.058,.083],[.044,.019],[0,.018]],[0,.011,0],porcelain);
    kit.cylinder(.051,.051,.004,[0,.084,0],coffee,24);
    kit.add(new THREE.TorusGeometry(.029,.007,6,22),porcelain,[.057,.057,0]);
    kit.add(new THREE.TorusGeometry(.063,.0024,4,32),blue,[0,.093,0],[-Math.PI/2,0,0]);
    kit.rod([.085,.018,.015],[.12,.018,.085],.0028,silver,6);
    kit.sphere([.009,.002,.015],[.122,.018,.088],silver,10);
    kit.cylinder(.097,.097,.009,[.24,.004,-.03],porcelain,24);
    pastry(kit,colors,[.24,.009,-.03],variant);
    kit.box([.12,.007,.085],[-.14,.004,-.04],colors.get('#d8cbb5'),.003,[0,.2,0]);
    kit.cylinder(.032,.028,.078,[-.17,.043,.10],colors.get('#a7b6b0'),20);
  });
}

function pendant(kit, colors, position, radius) {
  const brass=colors.get('#b59864'),dark=colors.get('#353d36'),glaze=colors.get('#496659');
  const milk=colors.get('#fff0d7',{emissive:'#ffe0ac',emissiveIntensity:.85});
  kit.place(position,[0,0,0],()=>{
    kit.cylinder(.078,.065,.032,[0,3.25-position[1],0],dark,24);
    kit.rod([0,3.23-position[1],0],[0,.23,0],.005,dark,10);
    lathe(kit,[[radius,0],[radius*.98,.022],[radius*.74,.14],[radius*.23,.21],[radius*.18,.23],[radius*.13,.23],[radius*.18,.195],[radius*.69,.126],[radius*.94,.008],[radius,0]],[0,0,0],glaze);
    kit.add(new THREE.TorusGeometry(radius,.007,8,48),brass,[0,0,0],[-Math.PI/2,0,0]);
    kit.cylinder(.035,.042,.041,[0,.196,0],brass,24);
    kit.cylinder(.022,.024,.048,[0,.137,0],dark,20);
    for(const height of [.117,.125,.133])kit.add(new THREE.TorusGeometry(.023,.0018,5,24),brass,[0,height,0],[-Math.PI/2,0,0]);
    lathe(kit,[[.018,.112],[.025,.099],[.051,.074],[.062,.04],[.052,-.006],[.028,-.030],[0,-.035]],[0,0,0],milk);
    for(const side of [-1,1])kit.sphere([.007,.007,.007],[side*radius*.94,.027,0],brass,8);
  });
  const lamp=new THREE.SpotLight('#fff0da',10,5.8,Math.PI*.30,.92,2);
  lamp.position.set(position[0],position[1]-.022,position[2]);
  lamp.target.position.set(position[0],.65,position[2]-.12);
  lamp.name='Light inside opal pendant bulb';
  lamp.userData.fixture='green enamel pendant';
  kit.scene.add(lamp,lamp.target);
}

function umbrellaStand(kit,colors) {
  const metal=colors.get('#3b4640'),steel=colors.get('#a3aaa3'),brass=colors.get('#ad9875');
  const fabrics=['#658b85','#a59179','#71838f'].map(tint=>colors.get(tint));
  const folds=new THREE.BufferGeometry(),positions=[],coordinates=[];
  const levels=[[0,.007],[.033,.021],[.13,.036],[.38,.028],[.52,.011],[.55,.004]];
  const segments=24;
  const point=(level,segment)=>{
    const angle=segment/segments*Math.PI*2;
    const radius=level[1]*(segment%3===0?1:segment%3===1?.84:.77);
    return [Math.sin(angle)*radius,level[0],Math.cos(angle)*radius];
  };
  for(let row=0;row<levels.length-1;row++)for(let segment=0;segment<segments;segment++){
    const vertices=[point(levels[row],segment),point(levels[row],segment+1),point(levels[row+1],segment+1),point(levels[row+1],segment)];
    for(const vertex of [vertices[0],vertices[1],vertices[2],vertices[0],vertices[2],vertices[3]]){
      positions.push(...vertex);coordinates.push(vertex[0]*8+.5,vertex[1]/.55);
    }
  }
  folds.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  folds.setAttribute('uv',new THREE.Float32BufferAttribute(coordinates,2));folds.computeVertexNormals();
  const slots=[-.14,0,.14],umbrellas=[],topRails=[];
  let tray;
  const bounds=kit.measure(()=>kit.place([-1.68,.348,1.75],[0,Math.PI/2,0],()=>{
    for(const offsetX of [-.207,.207])for(const offsetZ of [-.129,.129]){
      kit.cylinder(.015,.016,.014,[offsetX,.007,offsetZ],metal,16);
      kit.rod([offsetX,.014,offsetZ],[offsetX,.565,offsetZ],.007,metal,10);
      kit.cylinder(.010,.010,.018,[offsetX,.539,offsetZ],brass,12);
    }
    for(const offsetZ of [-.129,.129]){
      const rail=kit.measure(()=>kit.rod([-.207,.565,offsetZ],[.207,.565,offsetZ],.008,metal,12));
      topRails.push({min:rail.min.toArray(),max:rail.max.toArray()});
      kit.rod([-.207,.039,offsetZ],[.207,.039,offsetZ],.007,metal,10);
    }
    for(const offsetX of [-.207,-.07,.07,.207]){
      const rail=kit.measure(()=>kit.rod([offsetX,.565,-.129],[offsetX,.565,.129],.006,metal,10));
      topRails.push({min:rail.min.toArray(),max:rail.max.toArray()});
    }
    tray=kit.measure(()=>{
      const trayMaterial=colors.get('#969f97');
      kit.box([.43,.008,.27],[0,.050,0],trayMaterial,.002);
      for(const offsetZ of [-.141,.141])kit.box([.448,.018,.012],[0,.063,offsetZ],trayMaterial,.003);
      for(const offsetX of [-.218,.218])kit.box([.012,.018,.27],[offsetX,.063,0],trayMaterial,.003);
      kit.box([.09,.018,.022],[0,.063,-.154],metal,.004);
      for(let groove=0;groove<5;groove++)kit.box([.36,.001,.002],[0,.0545,-.088+groove*.044],metal);
    });
    for(const [index,slot] of [0,2].entries()){
      let fabricBounds;
      const umbrella=kit.measure(()=>kit.place([slots[slot],.054,0],[0,index*Math.PI/2,0],()=>{
        kit.rod([0,0,0],[0,.693,0],.0045,steel,10);
        kit.cylinder(.008,.005,.036,[0,.018,0],steel,12);
        fabricBounds=kit.measure(()=>kit.add(folds,fabrics[index],[0,.045,0]));
        kit.cylinder(.031,.032,.018,[0,.385,0],metal,24);
        kit.box([.008,.023,.009],[.032,.385,0],steel,.002);
        kit.cylinder(.010,.009,.085,[0,.687,0],colors.get('#514238'),16);
        kit.curve([[0,.727,0],[0,.810,0],[.030,.848,0],[.063,.819,0],[.060,.782,0]],.012,colors.get('#514238'),18,8);
      }));
      umbrellas.push({slot,min:umbrella.min.toArray(),max:umbrella.max.toArray(),fabricBounds:{min:fabricBounds.min.toArray(),max:fabricBounds.max.toArray()}});
    }
  }));
  folds.dispose();
  return {type:'open three-slot steel umbrella rack with removable shallow drip tray',slots:3,count:umbrellas.length,umbrellas,topRails,tray:{min:tray.min.toArray(),max:tray.max.toArray()},min:bounds.min.toArray(),max:bounds.max.toArray()};
}

export function buildRoom(kit,colors,textures) {
  const random=seeded(11821);
  const walnut=new THREE.MeshToonMaterial({color:'#8d7561',map:textures.wood,gradientMap:colors.ramp});
  const dark=colors.get('#48382b'), brass=colors.get('#ae8c53'), cream=colors.get('#eee2cc');
  const weave=canvasTexture(256,256,painter=>{
    painter.fillStyle='#405e50';painter.fillRect(0,0,256,256);
    for(let thread=0;thread<128;thread++){painter.fillStyle=thread%3?'rgba(199,200,150,.06)':'rgba(20,32,29,.1)';painter.fillRect(thread*2,0,1,256);painter.fillRect(0,thread*2,256,1);}
  });
  const fabric=new THREE.MeshToonMaterial({color:'#c4d2b3',map:weave,gradientMap:colors.ramp});
  const floorTexture=canvasTexture(1024,1024,painter=>{
    painter.fillStyle='#8b674d';painter.fillRect(0,0,1024,1024);
    for(let board=0;board<8;board++){
      const offset=board%3*180;painter.fillStyle=board%2?'rgba(62,38,22,.10)':'rgba(220,181,125,.06)';painter.fillRect(0,board*128,1024,128);
      painter.fillStyle='rgba(43,27,20,.30)';painter.fillRect(0,board*128,1024,2);
      for(let seam=0;seam<3;seam++)painter.fillRect(offset+seam*380,board*128,2,128);
      for(let grain=0;grain<50;grain++){painter.strokeStyle='rgba(52,33,20,.08)';painter.lineWidth=.5;painter.beginPath();const baseY=board*128+random()*126;painter.moveTo(0,baseY);for(let step=0;step<9;step++)painter.lineTo(step*128,baseY+Math.sin(step*.7+grain)*3);painter.stroke();}
    }
  });
  kit.add(new THREE.PlaneGeometry(7.73,6.25),new THREE.MeshToonMaterial({color:'#c7ad8d',map:floorTexture,gradientMap:colors.ramp}),[2,.348,-.69],[-Math.PI/2,0,0]);

  for(let panel=0;panel<5;panel++) {
    const centerX=.95+panel*.98;
    kit.box([.86,.64,.027],[centerX,.74,-1.550],walnut,.015);
    for(const offset of [-.39,.39])kit.box([.021,.53,.025],[centerX+offset,.74,-1.530],dark,.005);
    for(const height of [.48,1.0])kit.box([.80,.021,.025],[centerX,height,-1.530],dark,.005);
  }
  const stools=[];
  for(const [index,centerX] of [1.18,2.43,3.61,4.84].entries()){
    const centerZ=-1.00+[.02,-.06,.08,-.04][index];
    const bounds=kit.measure(()=>kit.place([centerX,.35,centerZ],[0,Math.PI+[.09,-.12,.04,.15][index],0],()=>{
      lathe(kit,[[0,.55],[.21,.55],[.23,.59],[.22,.64],[0,.64]],[0,0,0],fabric);
      for(const localX of [-.14,.14])for(const localZ of [-.14,.14])kit.rod([localX*1.18,0,localZ*1.18],[localX,.58,localZ],.023,walnut,10);
      kit.add(new THREE.TorusGeometry(.18,.011,6,28),brass,[0,.26,0],[-Math.PI/2,0,0]);
      for(const localX of [-.14,.14])kit.rod([localX,.61,-.13],[localX,.93,-.17],.018,walnut,10);
      kit.box([.32,.13,.055],[0,.90,-.17],fabric,.029,[-.12,0,0]);
    }));
    stools.push({min:bounds.min.toArray(),max:bounds.max.toArray()});
  }

  const boothChairs=[];
  const booth=kit.measure(()=>kit.place(cafeLayout.boothOffset,[0,0,0],()=>{
  kit.box([.53,.27,2.35],[5.54,.505,.12],walnut,.022);
  kit.box([.055,.60,2.35],[5.78,.87,.12],walnut,.018);
  for(let cushion=0;cushion<4;cushion++) {
    const centerZ=-.75+cushion*.58;
    kit.box([.48,.09,.55],[5.51,.68,centerZ],fabric,.038);
    kit.box([.13,.50,.55],[5.70,1.00,centerZ],fabric,.036,[0,0,-.08]);
    for(const offset of [-.13,.13])kit.sphere([.005,.010,.01],[5.625,.97,centerZ+offset],brass,8);
  }
  for(const centerZ of [-.65,.81]) {
    kit.box([.94,.075,.80],[4.76,.99,centerZ],walnut,.035);
    kit.cylinder(.045,.055,.62,[4.76,.65,centerZ],dark,16);
    kit.box([.59,.025,.38],[4.76,.369,centerZ],dark,.018);
  }
  for(const [position,angle] of [[[3.98,.35,-.65],Math.PI/2+.12],[[3.99,.35,.86],Math.PI/2-.05]]){
    const bounds=kit.measure(()=>chair(kit,walnut,fabric,position,angle));
    boothChairs.push({min:bounds.min.toArray(),max:bounds.max.toArray()});
  }
  service(kit,colors,[4.68,1.033,.76],.1,1);
  service(kit,colors,[4.84,1.033,-.7],2.7,0);
  }));

  kit.box([1.20,.075,.86],[1.27,.97,1.47],walnut,.035,[0,.04,0]);
  for(const localX of [-.46,.46])for(const localZ of [-.3,.3])kit.rod([1.27+localX,.35,1.47+localZ],[1.27+localX,.97,1.47+localZ],.027,walnut,10);
  chair(kit,walnut,fabric,[1.12,.35,.68],.11);
  chair(kit,walnut,fabric,[1.35,.35,2.19],Math.PI-.08);
  service(kit,colors,[1.0,1.013,1.47],-.1,2);
  lathe(kit,[[0,0],[.03,0],[.052,.035],[.034,.105],[.016,.143],[.022,.15]],[1.52,1.013,1.68],cream);
  for(const offset of [-.03,.02,.055])kit.curve([[1.52,1.13,1.68],[1.52+offset,1.26,1.69],[1.52+offset*.7,1.34,1.70]],.0024,colors.get('#738467'),12,4);

  pendant(kit,colors,[1.62,2.64,-1.96],.23);
  pendant(kit,colors,[4.48,2.64,-1.96],.23);
  pendant(kit,colors,[4.79,2.57,1.16],.28);
  const umbrellas=umbrellaStand(kit,colors);
  const glaze=colors.get('#829a89');
  kit.place(cafeLayout.boothOffset,[0,0,0],()=>{
    lathe(kit,[[0,0],[.028,0],[.052,.026],[.041,.070],[.023,.093],[.025,.103]],[5.08,1.033,.99],glaze);
    for(let twig=0;twig<5;twig++) {
      const top=[5.07+Math.cos(twig*2.4)*.04,1.26+twig%2*.04,.99+Math.sin(twig*2.4)*.04];
      kit.rod([5.08,1.12,.99],top,.0025,colors.get('#77896a'),5);
      for(let leaf=0;leaf<2;leaf++) {
        const geometry=new THREE.SphereGeometry(1,8,6);
        kit.add(geometry,colors.get('#97a47d'),[top[0]+.022*(leaf?1:-1),top[1]-.018,top[2]],[0,twig,.4],[.037,.006,.014]);
        geometry.dispose();
      }
    }
  });
  for(const seat of boothChairs)for(const stool of stools)if(new THREE.Box3(new THREE.Vector3(...seat.min),new THREE.Vector3(...seat.max)).intersectsBox(new THREE.Box3(new THREE.Vector3(...stool.min),new THREE.Vector3(...stool.max))))throw new Error('卡座椅与吧椅相交');
  return { seating:'window-side banquette separated from counter stools',stools,boothChairs,boothBounds:{min:booth.min.toArray(),max:booth.max.toArray()},boothOffset:cafeLayout.boothOffset,umbrellas,pendants:3,fixture:'thick green enamel shade, brass rolled rim, socket and opal LED bulb' };
}
