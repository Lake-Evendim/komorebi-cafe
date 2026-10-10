import * as THREE from 'three';
import {canvasTexture,labelTexture,placard} from './kit.js';
import { cafeLayout } from './cafe-layout.js';

const coffeeMenu=[
  {heading:'豆を選ぶドリップ',items:[{name:'深煎りブラジル',price:480},{name:'桜のブレンド',price:520},{name:'エチオピア',price:580},{name:'デカフェ',price:520}]},
  {heading:'ミルクと定番',items:[{name:'エスプレッソ',price:420},{name:'カフェラテ',price:560},{name:'カプチーノ',price:560},{name:'水出しアイス',price:550}]}
];

function coffeeMenuTexture() {
  return canvasTexture(1320,762,painter=>{
    painter.fillStyle='#324746';painter.fillRect(0,0,1320,762);
    painter.strokeStyle='#8b9a83';painter.lineWidth=3;painter.strokeRect(14,14,1292,734);
    painter.fillStyle='#eee4ce';painter.textAlign='center';painter.font='500 68px "Yu Mincho","SimSun",serif';painter.fillText('本日の珈琲',660,106);
    painter.strokeStyle='rgba(214,221,188,.36)';painter.lineWidth=2;painter.beginPath();painter.moveTo(660,165);painter.lineTo(660,618);painter.stroke();
    coffeeMenu.forEach((group,column)=>{
      const left=56+column*658,right=620+column*658;
      painter.textAlign='left';painter.fillStyle='#b9c8b0';painter.font='500 35px "Yu Mincho","SimSun",serif';painter.fillText(group.heading,left,181);
      group.items.forEach((item,row)=>{
        const baseline=266+row*101;
        painter.textAlign='left';painter.fillStyle='#eee4ce';painter.font='500 44px "Yu Mincho","SimSun",serif';painter.fillText(item.name,left,baseline);
        painter.textAlign='right';painter.fillStyle='#e2d7b8';painter.font='500 42px "Yu Mincho","SimSun",serif';painter.fillText('¥ '+item.price,right,baseline);
      });
    });
    painter.textAlign='center';painter.fillStyle='#bcc8b5';painter.font='500 31px "Yu Mincho","SimSun",serif';painter.fillText('一杯ずつお淹れします',660,674);
    painter.font='500 25px "Yu Mincho","SimSun",serif';painter.fillText('カフェラテはホット / アイス',660,719);
  });
}

function vessel(kit,profile,position,material) {
  const geometry=kit.geometry('bar-vessel:'+JSON.stringify(profile),()=>new THREE.LatheGeometry(profile.map(point=>new THREE.Vector2(...point)),24));
  kit.add(geometry,material,position);
}

function cup(kit,colors,position,size=1,tint='#f0e8d9',stackable=false) {
  kit.place(position,[0,0,0],()=>{
    const ceramic=colors.get(tint);
    const profile=(stackable?[[0,0],[.036,0],[.044,.013],[.049,.015],[.053,.020],[.052,.067],[.055,.071],[.049,.073],[.041,.016],[0,.014]]:[[0,0],[.036,0],[.047,.012],[.052,.067],[.055,.071],[.049,.073],[.041,.016],[0,.014]]).map(point=>point.map(value=>value*size));
    vessel(kit,profile,[0,0,0],ceramic);
    kit.add(kit.geometry('bar-cup-handle:'+size,()=>new THREE.TorusGeometry(.023*size,.005*size,6,24)),ceramic,[.052*size,.043*size,0]);
  });
}

function saucer(kit,material,position,radius) {
  vessel(kit,[[0,.006],[radius*.49,.006],[radius*.49,0],[radius*.56,0],[radius*.56,.006],[radius*.72,.006],[radius,.015],[radius,.021],[radius*.72,.013],[0,.013]],position,material);
}

function workingStock(kit,colors,steel,porcelain,rubber) {
  const dark=colors.get('#384e4d'),paper=colors.get('#d8cfb6');
  for(const [centerX,centerZ,count,size] of [[.73,-3.76,5,.85],[1.09,-3.70,4,1.0],[1.52,-3.72,6,.72]]){
    for(let level=0;level<count;level++)cup(kit,colors,[centerX,2.517+level*.058*size,centerZ],size,centerX>1.3?'#7e9990':'#f0e8d9',true);
  }
  for(const [centerX,height,count,radius] of [[.82,2.917,7,.105],[1.26,2.917,5,.088],[1.65,2.917,4,.11],[4.82,2.517,5,.115],[5.19,2.517,4,.09]]){
    for(let level=0;level<count;level++)saucer(kit,porcelain,[centerX,height+level*.013,-3.674],radius);
  }
  cup(kit,colors,[1.79,1.907,-3.65],.92);
  for(const [centerX,height,count] of [[4.57,2.917,6],[5.02,2.917,4]]){
    kit.box([.32,.014,.24],[centerX,height+.007,-3.684],dark,.009);
    for(let jar=0;jar<count;jar++){
      const localX=centerX+(jar%3-1)*.087,centerZ=-3.742+Math.floor(jar/3)*.106;
      vessel(kit,[[0,0],[.033,0],[.038,.099],[.033,.102],[.030,.010],[0,.008]],[localX,height+.014,centerZ],colors.get('#adc2bb'));
    }
  }
  kit.box([.51,.058,.27],[3.93,2.946,-3.675],colors.get('#b29b76'),.014);
  for(let napkin=0;napkin<6;napkin++)kit.box([.19,.007,.18],[3.84,2.9785+napkin*.007,-3.673],paper,.002,[0,napkin*.008,0]);
  for(let packet=0;packet<8;packet++)kit.box([.069,.061,.012],[4.04,2.982,-3.748+packet*.02],colors.get(packet%2?'#c7b195':'#e1d7c1'),.003,[-.16,0,0]);
  kit.place([2.89,1.1775,-3.66],[0,0,0],()=>{
    kit.box([.46,.031,.34],[0,.016,0],dark,.012);
    kit.box([.41,.425,.237],[0,.264,-.038],steel,.022);
    kit.box([.353,.34,.018],[0,.280,.089],dark,.015);
    for(let vent=0;vent<7;vent++)kit.box([.018,.106,.005],[-.12+vent*.041,.38,.101],colors.get('#687975'),.002);
    kit.box([.165,.069,.014],[0,.264,.103],colors.get('#748f88'),.004);
    placard(kit,[.146,.051],[0,.264,.112],labelTexture([{text:'HOT  94°C',size:38,y:60}],{width:300,height:105,background:'#233d3e',color:'#dae8de'}));
    kit.curve([[0,.226,.105],[0,.194,.14],[0,.183,.165]],.012,steel,12,8);
    kit.box([.024,.053,.024],[0,.234,.141],dark,.005);
    kit.box([.36,.025,.177],[0,.046,.087],rubber,.008);
    for(let grate=0;grate<12;grate++)kit.box([.009,.004,.133],[-.145+grate*.027,.061,.087],steel,.001);
    kit.rod([-.178,.485,-.155],[.178,.485,-.155],.007,steel,10);
  });
  kit.box([.60,.022,.32],[3.54,1.1885,-3.64],colors.get('#cbb48a'),.010);
  kit.box([.23,.020,.19],[3.44,1.2095,-3.64],paper,.004,[0,.08,0]);
  kit.rod([3.40,1.224,-3.66],[3.56,1.224,-3.59],.004,steel,6);
  kit.box([.057,.005,.033],[3.58,1.224,-3.58],steel,.006);
  for(const [centerX,centerZ] of [[3.75,-3.70],[3.79,-3.56]])vessel(kit,[[0,0],[.025,0],[.034,.075],[.034,.086],[.029,.087],[.022,.009],[0,.008]],[centerX,1.1995,centerZ],porcelain);
  kit.box([.55,.028,.35],[4.49,1.1915,-3.62],rubber,.010);
  for(const [centerX,centerZ,height] of [[4.34,-3.69,.145],[4.51,-3.56,.18],[4.62,-3.71,.125]]){
    vessel(kit,[[0,0],[.049,0],[.070,height],[.061,height+.012],[.053,height*.20],[.043,.01],[0,.008]],[centerX,1.2055,centerZ],steel);
    kit.curve([[centerX+.061,1.2055+height*.78,centerZ],[centerX+.098,1.2055+height*.79,centerZ],[centerX+.098,1.2055+height*.23,centerZ],[centerX+.063,1.2055+height*.22,centerZ]],.007,steel,12,6);
  }
  kit.box([.32,.036,.32],[5.13,1.1955,-3.64],colors.get('#ae9671'),.012);
  kit.box([.29,.13,.011],[5.13,1.262,-3.775],colors.get('#b19d7c'),.004);
  for(const side of [-1,1])kit.box([.014,.13,.30],[5.13+side*.151,1.262,-3.64],colors.get('#b19d7c'),.004);
  for(let filter=0;filter<11;filter++)kit.box([.16,.106,.004],[5.13,1.266,-3.728+filter*.014],paper,.002,[-.13,0,0]);
  kit.rod([1.63,1.51,-3.79],[2.11,1.51,-3.79],.008,steel,10);
  for(const offset of [0,.14])kit.curve([[1.66+offset,1.49,-3.79],[1.67+offset,1.32,-3.72],[1.68+offset,1.31,-3.70]],.010,colors.get(offset?'#b9c4b6':'#b4a68c'),12,6);
  kit.box([.28,.013,.21],[.81,1.184,-3.53],rubber,.004);
  for(let spoon=0;spoon<5;spoon++){
    kit.rod([.71+spoon*.034,1.194,-3.61],[.71+spoon*.034,1.194,-3.48],.003,steel,6);
    kit.sphere([.009,.003,.016],[.71+spoon*.034,1.194,-3.46],steel,8);
  }
}

export function buildBar(kit,colors,textures) {
  const wood=new THREE.MeshToonMaterial({color:'#a48b76',map:textures.wood,gradientMap:colors.ramp});
  const dark=colors.get('#514033'),steel=new THREE.MeshStandardMaterial({color:'#b9c6c5',metalness:.72,roughness:.28,envMap:textures.reflections,envMapIntensity:.65});
  const porcelain=colors.get('#f0e8d9'),brass=colors.get('#b39868'),rubber=colors.get('#374e4d');
  const tileTexture=canvasTexture(768,256,painter=>{
    painter.fillStyle='#bac9c3';painter.fillRect(0,0,768,256);
    for(let row=0;row<4;row++)for(let column=0;column<12;column++){
      painter.fillStyle=['#c4d1c9','#b5c8c0','#ced7cb'][(row*3+column)%3];painter.fillRect(column*64+2,row*64+2,60,60);
      painter.fillStyle='rgba(255,255,248,.18)';painter.fillRect(column*64+3,row*64+3,58,2);
    }
  });
  placard(kit,[5.10,.51],[3.0,1.47,-3.857],tileTexture);
  const rearBounds=kit.measure(()=>{
    kit.box([5.00,.035,.47],[3.0,.407,-3.64],wood,.008);
    kit.box([5.00,.69,.026],[3.0,.769,-3.862],wood,.008);
    for(const divider of [.513,2.17,2.99,3.81,4.63,5.487])kit.box([.026,.69,.445],[divider,.769,-3.635],wood,.006);
    kit.box([4.98,.082,.40],[3.0,.395,-3.66],dark,.012);
    for(let cabinet=0;cabinet<6;cabinet++) {
      const centerX=.94+cabinet*.82;
      if(cabinet===4) {
        kit.box([.75,.64,.018],[centerX,.76,-3.394],steel,.012);
        for(let vent=0;vent<7;vent++)kit.box([.59,.009,.008],[centerX,.48+vent*.021,-3.380],dark,.002);
        kit.rod([centerX-.23,1.03,-3.368],[centerX+.23,1.03,-3.368],.008,steel,8);
      } else {
        const drawers=cabinet===2?3:1;
        for(let drawer=0;drawer<drawers;drawer++) {
          const height=.65/drawers,centerY=.43+height*(drawer+.5);
          kit.box([.77,height-.012,.023],[centerX,centerY,-3.394],wood,.006);
          kit.rod([centerX-.11,centerY+height*.30,-3.371],[centerX+.11,centerY+height*.30,-3.371],.006,steel,8);
        }
      }
    }
    kit.box([.405,.045,.56],[.7025,1.155,-3.62],steel,.010);
    kit.box([4.045,.045,.56],[3.4775,1.155,-3.62],steel,.010);
    kit.box([.55,.045,.075],[1.18,1.155,-3.8625],steel,.006);
    kit.box([.55,.045,.105],[1.18,1.155,-3.3925],steel,.006);
    kit.box([.45,.012,.33],[1.18,1.004,-3.6325],steel,.010);
    for(const side of [-1,1]) {
      kit.box([.014,.145,.34],[1.18+side*.225,1.082,-3.6325],steel,.005);
      kit.box([.44,.145,.014],[1.18,1.082,-3.6325+side*.165],steel,.005);
    }
    kit.cylinder(.026,.026,.002,[1.18,1.011,-3.6325],rubber,20);
    kit.cylinder(.025,.031,.026,[1.18,1.190,-3.828],steel,20);
    kit.curve([[1.18,1.201,-3.828],[1.18,1.439,-3.828],[1.18,1.476,-3.70],[1.18,1.433,-3.625]],.014,steel,24,8);
    kit.cylinder(.020,.016,.019,[1.18,1.424,-3.625],steel,16);
    kit.rod([1.217,1.22,-3.829],[1.265,1.244,-3.829],.009,steel,10);
    kit.box([.087,.116,.07],[.78,1.241,-3.75],colors.get('#879d97'),.012);
    kit.rod([.78,1.303,-3.75],[.78,1.321,-3.71],.006,steel,6);
    kit.box([.31,.015,.25],[1.67,1.185,-3.59],rubber,.007);
    for(let slot=0;slot<8;slot++)kit.box([.005,.003,.21],[1.54+slot*.034,1.195,-3.59],steel,.001);
    cup(kit,colors,[1.63,1.196,-3.58],.85);
  });
  const shelves=[];
  for(const specification of [{minimum:.54,maximum:1.97},{minimum:3.65,maximum:5.51}]) {
    const width=specification.maximum-specification.minimum,center=(specification.maximum+specification.minimum)/2;
    kit.box([width,1.115,.031],[center,2.341,-3.852],wood,.008);
    for(const side of [specification.minimum,specification.maximum])kit.box([.035,1.16,.29],[side,2.343,-3.696],wood,.006);
    for(const height of [1.89,2.50,2.90]) {
      const bounds=kit.measure(()=>kit.box([width+.04,.034,.31],[center,height,-3.69],wood,.007));
      shelves.push({min:bounds.min.toArray(),max:bounds.max.toArray()});
      for(const offset of [-width*.35,width*.35])kit.rod([center+offset,height-.15,-3.821],[center+offset,height-.018,-3.56],.008,brass,6);
      if(height<2.9) {
        kit.box([width-.10,.010,.023],[center,height-.026,-3.561],rubber,.003);
        kit.box([width-.14,.004,.018],[center,height-.032,-3.561],colors.get('#fff1db',{emissive:'#fff1db',emissiveIntensity:1.1}),.001);
      }
    }
  }
  for(let group=0;group<3;group++) {
    const centerX=.77+group*.35;
    for(let plate=0;plate<3+group;plate++)saucer(kit,porcelain,[centerX,1.907+plate*.013,-3.665],.09);
    cup(kit,colors,[centerX,1.907+(3+group)*.013,-3.665],.90,group===1?'#789b94':'#f0e8d9');
  }
  for(let jar=0;jar<4;jar++) {
    const centerX=3.89+jar*.39,height=.21+jar%2*.036;
    vessel(kit,[[0,0],[.080,0],[.079,height],[.072,height+.006],[0,height+.006]],[centerX,1.907,-3.674],colors.get(['#9a7f5c','#839886','#b19c7a','#7c9290'][jar]));
    kit.cylinder(.082,.082,.016,[centerX,1.921+height,-3.674],steel,24);
    placard(kit,[.128,.079],[centerX,2.026,-3.591],labelTexture([{text:['ブラジル','エチオピア','桜ブレンド','デカフェ'][jar],size:27,y:40},{text:'焙煎 04.12',size:17,y:69}],{width:256,height:158,background:'#ede4ce'}));
  }
  for(let bottle=0;bottle<3;bottle++) {
    const centerX=3.87+bottle*.21;
    vessel(kit,[[0,0],[.046,0],[.046,.142],[.019,.176],[.019,.230],[0,.230]],[centerX,2.517,-3.672],colors.get(bottle===1?'#a58f68':'#78918a'));
    kit.rod([centerX,2.750,-3.672],[centerX+.048,2.761,-3.672],.005,steel,6);
  }
  for(let bag=0;bag<2;bag++) {
    const centerX=1.88+bag*.22;
    kit.box([.17,.226,.106],[centerX,1.291,-3.77],colors.get('#c5b28e'),.012,[0,(bag-1)*.07,0]);
    kit.box([.169,.012,.097],[centerX,1.410,-3.77],dark,.004);
    placard(kit,[.119,.073],[centerX,1.297,-3.712],labelTexture([{text:'木漏れ日',size:33,y:42},{text:'200 g',size:22,y:73}],{width:240,height:148,background:'#efe6d3'}));
  }
  kit.rod([4.07,1.67,-3.784],[5.29,1.67,-3.784],.009,steel,10);
  for(let tool=0;tool<3;tool++) {
    const centerX=4.30+tool*.27;
    kit.curve([[centerX,1.66,-3.784],[centerX,1.574,-3.753],[centerX+.054,1.528,-3.71]],.004,steel,10,6);
    vessel(kit,[[0,0],[.042,0],[.054,.077],[.051,.102],[.045,.103],[.040,.012],[0,.008]],[centerX,1.428,-3.71],steel);
    kit.add(kit.geometry('bar-pitcher-handle',()=>new THREE.TorusGeometry(.034,.005,6,24)),steel,[centerX+.054,1.501,-3.71]);
  }
  const menuBounds=kit.measure(()=>{
    kit.box([1.46,.875,.055],[2.81,2.38,-3.819],dark,.012);
    placard(kit,[1.375,.793],[2.81,2.38,-3.787],coffeeMenuTexture());
  });
  const stockBounds=kit.measure(()=>workingStock(kit,colors,steel,porcelain,rubber));
  const workstations=[];
  const stationBounds=kit.measure(()=>{
    const knock=kit.measure(()=>kit.place(cafeLayout.knockBox,[0,0,0],()=>{
      kit.box([.23,.016,.22],[0,.008,0],rubber,.008);
      vessel(kit,[[0,0],[.068,0],[.068,.090],[.057,.093],[.055,.017],[0,.012]],[0,.016,0],steel);
      kit.rod([-.059,.0765,0],[.059,.0765,0],.014,rubber,10);
    }));
    const tamper=kit.measure(()=>kit.place(cafeLayout.tamper,[0,Math.PI,0],()=>{
      kit.box([.21,.014,.23],[0,.007,0],rubber,.008);
      kit.box([.125,.25,.156],[0,.139,-.05],steel,.014);
      kit.box([.061,.039,.045],[0,.2905,.005],dark,.006);
      kit.rod([-.036,.1285,.07],[.036,.1285,.07],.007,steel,8);
    }));
    workstations.push({zone:'knock grounds beside espresso',min:knock.min.toArray(),max:knock.max.toArray()},{zone:'tamp between grinders and espresso',min:tamper.min.toArray(),max:tamper.max.toArray()});
    kit.box([.18,.013,.16],[5.36,1.254,-2.00],colors.get('#a5b3a8'),.005);
    vessel(kit,[[0,0],[.039,0],[.058,.123],[.051,.151],[.042,.15],[.047,.031],[0,.012]],[5.36,1.2605,-2.00],steel);
    kit.curve([[5.407,1.386,-2.0],[5.447,1.388,-2.0],[5.447,1.307,-2.0],[5.405,1.303,-2.0]],.006,steel,12,6);
    kit.box([.13,.021,.11],[3.46,1.258,-2.29],dark,.006);
    for(let brush=0;brush<7;brush++)kit.rod([3.42+brush*.010,1.269,-2.29],[3.42+brush*.010,1.287,-2.29],.0025,colors.get('#b7aa88'),4);
  });
  const menuShelfClearance=Math.min(menuBounds.min.x-shelves[0].max[0],shelves[3].min[0]-menuBounds.max.x);
  if(menuShelfClearance<.08)throw new Error('菜单与搁板间距不足');
  return {rearBounds:{min:rearBounds.min.toArray(),max:rearBounds.max.toArray()},shelves,menuBounds:{min:menuBounds.min.toArray(),max:menuBounds.max.toArray()},menuItems:coffeeMenu,stationBounds:{min:stationBounds.min.toArray(),max:stationBounds.max.toArray()},stockBounds:{min:stockBounds.min.toArray(),max:stockBounds.max.toArray()},workingAisle:-2.415-rearBounds.max.z,workstations,zones:['wash and drying tools','rear hot water and pour-over preparation','adjacent commercial grinding tamping and espresso','cashier and tray delivery beside cake cabinet','milk service and filter storage'],menuShelfClearance};
}
