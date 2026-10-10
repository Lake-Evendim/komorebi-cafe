import * as THREE from 'three';
import { canvasTexture, placard, seeded } from './kit.js';
import { cafeLayout } from './cafe-layout.js';

function vessel(kit,profile,position,material,segments=28) {
  const geometry=kit.geometry('equipment-vessel:'+JSON.stringify(profile)+':'+segments,()=>new THREE.LatheGeometry(profile.map(point=>new THREE.Vector2(...point)),segments));
  kit.add(geometry,material,position);
}

function ring(kit,radius,tube,position,material,rotation=[-Math.PI/2,0,0]) {
  kit.add(kit.geometry('equipment-ring:'+radius+':'+tube,()=>new THREE.TorusGeometry(radius,tube,8,36)),material,position,rotation);
}

function display(kit,dimensions,position,headline,reading) {
  const height=180,width=Math.round(height*dimensions[0]/dimensions[1]);
  const texture=canvasTexture(width,height,painter=>{
    painter.fillStyle='#17282b';painter.fillRect(0,0,width,height);
    painter.textAlign='left';painter.fillStyle='#92b1b0';painter.font='22px sans-serif';painter.fillText(headline,18,41);
    painter.fillStyle='#d0e4df';painter.font='44px monospace';painter.fillText(reading,18,108);
    painter.fillStyle='#486461';painter.fillRect(18,138,width-36,3);
  });
  const material=placard(kit,dimensions,position,texture);material.emissive.set('#91b9b1');material.emissiveIntensity=.13;
}

function gauge(kit,position,steel,dark) {
  const texture=canvasTexture(256,256,painter=>{
    painter.fillStyle='#eee9d8';painter.fillRect(0,0,256,256);
    painter.strokeStyle='#4f5e59';painter.lineWidth=3;
    for(let mark=0;mark<21;mark++){
      const angle=-Math.PI*.72+mark*Math.PI*1.44/20;
      painter.beginPath();painter.moveTo(128+Math.sin(angle)*86,128-Math.cos(angle)*86);painter.lineTo(128+Math.sin(angle)*101,128-Math.cos(angle)*101);painter.stroke();
    }
    painter.font='25px sans-serif';painter.textAlign='center';painter.fillText('bar',128,183);
    painter.strokeStyle='#b66753';painter.lineWidth=6;painter.beginPath();painter.moveTo(128,128);painter.lineTo(165,57);painter.stroke();
  });
  const material=new THREE.MeshToonMaterial({map:texture});
  kit.place(position,[0,0,0],()=>{
    kit.cylinder(.042,.042,.018,[0,0,0],steel,32,[Math.PI/2,0,0]);
    kit.add(kit.geometry('pressure-face',()=>new THREE.CircleGeometry(.035,32)),material,[0,0,.010],[0,0,0],[1,1,1],false);
    ring(kit,.036,.003,[0,0,.012],dark,[0,0,0]);
  });
}

function mug(kit,colors,position,size=1,tint='#eee4d1') {
  const ceramic=colors.get(tint);
  kit.place(position,[0,0,0],()=>{
    vessel(kit,[[0,0],[.031*size,0],[.046*size,.061*size],[.047*size,.068*size],[.041*size,.069*size],[.027*size,.011*size],[0,.009*size]],[0,0,0],ceramic);
    ring(kit,.017*size,.004*size,[.046*size,.044*size,0],ceramic,[0,0,0]);
  });
}

function espressoMachine(kit,colors,steel) {
  const enamel=colors.get('#303e42'),dark=colors.get('#202f32'),brass=colors.get('#ad9875');
  const ready=colors.get('#9cbbb3',{emissive:'#76a69a',emissiveIntensity:.23});
  return kit.measure(()=>kit.place(cafeLayout.espresso,[0,Math.PI,0],()=>{
    for(const localX of [-.49,.49])for(const localZ of [-.24,.24])kit.cylinder(.030,.034,.061,[localX,.031,localZ],dark,16);
    kit.box([1.30,.051,.70],[0,.086,0],steel,.014);
    kit.box([1.22,.375,.37],[0,.333,-.141],enamel,.034);
    kit.box([1.13,.255,.012],[0,.347,-.332],dark,.014);
    for(let rib=0;rib<19;rib++)kit.box([.019,.184,.014],[-.50+rib*.055,.347,-.344],steel,.004);
    kit.box([.30,.033,.018],[0,.252,-.357],brass,.005);
    kit.box([.38,.052,.014],[0,.415,-.357],enamel,.006);
    for(const side of [-1,1]){
      kit.box([.030,.398,.41],[side*.611,.323,-.128],steel,.016);
      kit.box([.013,.266,.272],[side*.630,.336,-.134],enamel,.014);
      for(let vent=0;vent<10;vent++)kit.box([.008,.006,.152],[side*.640,.230+vent*.014,-.144],dark,.002);
      for(const height of [.226,.451])for(const depth of [-.238,-.034])kit.sphere([.003,.006,.006],[side*.640,height,depth],steel,8);
      kit.rod([side*.540,.574,-.272],[side*.540,.574,.036],.009,steel,10);
    }
    kit.rod([-.540,.574,-.272],[.540,.574,-.272],.009,steel,10);
    kit.box([1.15,.023,.382],[0,.526,-.116],steel,.012);
    for(let slot=0;slot<21;slot++)kit.box([.011,.004,.270],[-.50+slot*.050,.541,-.12],dark,.002);
    kit.box([1.115,.123,.065],[0,.444,.062],enamel,.013);
    kit.box([1.10,.092,.012],[0,.444,.102],dark,.008);
    for(const [group,localX] of [-.34,0,.34].entries()){
      display(kit,[.171,.063],[localX,.453,.112],'GROUP '+(group+1),'93.5 / 28s');
      kit.cylinder(.014,.015,.010,[localX,.401,.110],steel,24,[Math.PI/2,0,0]);
      kit.rod([localX,.401,.116],[localX,.410,.128],.005,dark,10);
      kit.box([.129,.093,.153],[localX,.328,.085],steel,.018);
      kit.cylinder(.058,.056,.039,[localX,.263,.136],steel,32);
      ring(kit,.056,.005,[localX,.245,.136],dark);
      kit.rod([localX,.242,.170],[localX+.014,.226,.379],.014,steel,12);
      kit.rod([localX+.011,.231,.276],[localX+.018,.219,.398],.021,dark,14);
      kit.sphere([.020,.021,.028],[localX+.018,.219,.401],dark,12);
      for(const side of [-1,1])kit.curve([[localX+side*.017,.242,.136],[localX+side*.019,.232,.150],[localX+side*.037,.222,.169]],.0055,steel,12,8);
      mug(kit,colors,[localX,.132,.183],1.08);
      kit.box([.014,.006,.008],[localX-.095,.348,.169],ready,.002);
    }
    kit.box([1.21,.027,.315],[0,.113,.179],dark,.009);
    for(let grate=0;grate<34;grate++)kit.box([.009,.006,.271],[-.55+grate*.033,.129,.178],steel,.002);
    for(const side of [-1,1]){
      kit.cylinder(.034,.034,.024,[side*.511,.444,.107],steel,24,[Math.PI/2,0,0]);
      kit.box([.025,.063,.034],[side*.511,.452,.129],dark,.008,[0,0,side*.2]);
      kit.cylinder(.019,.019,.073,[side*.556,.355,.077],steel,20,[Math.PI/2,0,0]);
      kit.curve([[side*.556,.355,.111],[side*.577,.286,.191],[side*.566,.167,.251],[side*.522,.149,.277]],.008,steel,20,8);
      kit.cylinder(.015,.010,.023,[side*.522,.144,.277],steel,16);
    }
    gauge(kit,[-.495,.308,.054],steel,dark);gauge(kit,[.495,.308,.054],steel,dark);
    for(const [index,localX] of [-.39,-.13,.13,.39].entries()){
      mug(kit,colors,[localX,.543,-.18],1.12,index%2?'#8fa59a':'#eee4d1');
      mug(kit,colors,[localX,.543,-.018],.88);
    }
    kit.curve([[-.43,.075,-.17],[-.46,.035,-.17],[-.46,.011,-.17]],.010,dark,8,6);
  }));
}

function beanBed(kit,coffee,random) {
  const grain=seeded(81613);
  const texture=canvasTexture(512,512,painter=>{
    painter.fillStyle='#68472f';painter.fillRect(0,0,512,512);
    for(let bean=0;bean<720;bean++){
      const centerX=grain()*512,centerY=grain()*512,angle=grain()*Math.PI;
      painter.save();painter.translate(centerX,centerY);painter.rotate(angle);
      painter.fillStyle=bean%3?'#805b3c':'#553925';painter.beginPath();painter.ellipse(0,0,5.6,3.4,0,0,Math.PI*2);painter.fill();
      painter.strokeStyle='#3e2a1d';painter.lineWidth=.9;painter.beginPath();painter.moveTo(-4,0);painter.bezierCurveTo(-1,-1,1,1,4,0);painter.stroke();painter.restore();
    }
  });
  const bedMaterial=new THREE.MeshToonMaterial({map:texture,color:'#fff2dc',gradientMap:coffee.gradientMap});
  const innerRadius=height=>height<.480?.035+(height-.436)/.044*.048:.083+(height-.480)/.112*.041;
  const surface=(horizontal,depth)=>.599+Math.sin(horizontal*83)*.0017+Math.cos(depth*71)*.0015;
  const positions=[],coordinates=[];
  const triangle=(first,second,third)=>{
    for(const point of [first,second,third]){positions.push(...point);coordinates.push(point[0]*4+.5,point[2]*4+.5);}
  };
  const segments=40,rings=6,radius=.119;
  for(let segment=0;segment<segments;segment++){
    const start=segment*Math.PI*2/segments,end=(segment+1)*Math.PI*2/segments;
    const point=(distance,angle)=>{
      const horizontal=Math.sin(angle)*distance,depth=Math.cos(angle)*distance;
      return [horizontal,surface(horizontal,depth),depth-.041];
    };
    for(let ringIndex=0;ringIndex<rings;ringIndex++){
      const inner=ringIndex/rings*radius,outer=(ringIndex+1)/rings*radius;
      triangle(point(inner,start),point(outer,start),point(outer,end));
      if(ringIndex>0)triangle(point(inner,start),point(outer,end),point(inner,end));
    }
    const profile=[[.029,.425],[.031,.436],[.079,.480],[.119,.592],[radius,surface(Math.sin(start)*radius,Math.cos(start)*radius)]];
    for(let level=0;level<profile.length-1;level++){
      const first=[Math.sin(start)*profile[level][0],profile[level][1],Math.cos(start)*profile[level][0]-.041];
      const second=[Math.sin(end)*profile[level][0],profile[level][1],Math.cos(end)*profile[level][0]-.041];
      const third=[Math.sin(end)*profile[level+1][0],level===profile.length-2?surface(Math.sin(end)*radius,Math.cos(end)*radius):profile[level+1][1],Math.cos(end)*profile[level+1][0]-.041];
      const fourth=[Math.sin(start)*profile[level+1][0],profile[level+1][1],Math.cos(start)*profile[level+1][0]-.041];
      triangle(first,second,third);triangle(first,third,fourth);
    }
    triangle([0,.425,-.041],[Math.sin(end)*.029,.425,Math.cos(end)*.029-.041],[Math.sin(start)*.029,.425,Math.cos(start)*.029-.041]);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(coordinates,2));
  geometry.computeVertexNormals();kit.add(geometry,bedMaterial,[0,0,0]);geometry.dispose();
  const beans=[],sideBeans=[];
  const bean=kit.geometry('commercial-coffee-bean',()=>new THREE.SphereGeometry(1,8,6));
  const transform=new THREE.Matrix4(),point=new THREE.Vector3();
  for(let attempt=0;attempt<2400&&beans.length<108;attempt++){
    const angle=random()*Math.PI*2,distance=Math.sqrt(random())*.112;
    const centerX=Math.cos(angle)*distance,centerZ=Math.sin(angle)*distance,rotation=random()*Math.PI*2;
    if(beans.some(existing=>Math.hypot(existing[0]-centerX,existing[2]+.041-centerZ)<.0175))continue;
    const centerY=surface(centerX,centerZ)+.003;
    transform.compose(new THREE.Vector3(centerX,centerY,centerZ-.041),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,rotation,0)),new THREE.Vector3(.009,.006,.012));
    let contained=true;
    for(let vertex=0;vertex<bean.attributes.position.count;vertex++){
      point.fromBufferAttribute(bean.attributes.position,vertex).applyMatrix4(transform);
      if(Math.hypot(point.x,point.z+.041)>innerRadius(point.y)-.002)contained=false;
    }
    if(!contained)continue;
    kit.add(bean,coffee,[centerX,centerY,centerZ-.041],[0,rotation,0],[.009,.006,.012]);
    const seam=[-.008,-.004,.004,.008].map(distance=>[centerX+Math.sin(rotation)*distance,centerY+Math.sqrt(1-(distance/.012)**2)*.006+.0003,centerZ-.041+Math.cos(rotation)*distance]);
    kit.curve(seam,.00065,coffee,4,4);
    beans.push([centerX,centerY,centerZ-.041]);
  }
  const sideBean=kit.geometry('embedded-coffee-bean',()=>new THREE.SphereGeometry(1,8,6));
  const sideScale=new THREE.Vector3(.0075,.005,.010);
  const sideTint=new THREE.MeshToonMaterial({color:'#87603f',gradientMap:coffee.gradientMap});
  for(let layer=0;layer<14;layer++){
    const height=.450+layer*.0105,bedRadius=innerRadius(height)-.004;
    const count=Math.max(9,Math.floor(2*Math.PI*bedRadius/.022));
    for(let column=0;column<count;column++){
      const angle=(column+layer*.47+random()*.15)*Math.PI*2/count;
      const rotation=angle+(random()-.5)*.65;
      let distance=bedRadius-.006;
      const center=new THREE.Vector3();
      for(let inset=0;inset<12;inset++){
        center.set(Math.sin(angle)*distance,height,Math.cos(angle)*distance-.041);
        transform.compose(center,new THREE.Quaternion().setFromEuler(new THREE.Euler(0,rotation,0)),sideScale);
        let contained=true;
        for(let vertex=0;vertex<sideBean.attributes.position.count;vertex++){
          point.fromBufferAttribute(sideBean.attributes.position,vertex).applyMatrix4(transform);
          if(Math.hypot(point.x,point.z+.041)>innerRadius(point.y)-.002)contained=false;
        }
        if(contained)break;
        distance-=.001;
      }
      kit.add(sideBean,column%4?coffee:sideTint,center.toArray(),[0,rotation,0],sideScale.toArray());
      sideBeans.push(center.toArray());
    }
  }
  return {visibleBeans:beans.length,sideBeans,fill:'continuous compact bean bed with embedded surface and side grains',beans};
}

function grinder(kit,colors,steel,clear,position,index) {
  const dark=colors.get(index?'#56645d':'#303e42'),coffee=colors.get('#6d4e35'),random=seeded(5521+index);
  let fill;
  const bounds=kit.measure(()=>kit.place(position,[0,Math.PI,0],()=>{
    kit.box([.31,.045,.39],[0,.023,0],dark,.017);
    kit.box([.205,.334,.233],[0,.207,-.041],dark,.020);
    for(const side of [-1,1])kit.box([.015,.258,.171],[side*.101,.219,-.053],steel,.008);
    kit.cylinder(.096,.105,.068,[0,.391,-.041],steel,32);
    const hopperGlass=new THREE.MeshPhysicalMaterial({color:'#ffffff',transparent:true,opacity:.045,roughness:.06,envMap:clear.envMap,envMapIntensity:.16,side:THREE.DoubleSide,depthWrite:false,forceSinglePass:true});
    vessel(kit,[[.043,0],[.091,.055],[.135,.165],[.132,.270],[.123,.274],[.124,.167],[.083,.055],[.035,.011]],[0,.425,-.041],hopperGlass,36);
    ring(kit,.132,.0025,[0,.695,-.041],steel);
    kit.cylinder(.131,.133,.022,[0,.710,-.041],dark,36);
    fill=beanBed(kit,coffee,random);
    kit.box([.075,.062,.078],[0,.318,.113],steel,.007,[-.19,0,0]);
    kit.box([.139,.098,.022],[0,.224,.087],dark,.008);
    display(kit,[.122,.076],[0,.224,.103],index?'DECAF':'HOUSE','18.0 g');
    for(const side of [-1,1])kit.rod([side*.033,.127,.113],[side*.046,.141,.182],.005,steel,8);
    ring(kit,.044,.004,[0,.143,.164],steel);
    kit.rod([0,.143,.186],[0,.14,.257],.014,dark,10);
    kit.box([.166,.012,.147],[0,.063,.103],steel,.006);
    for(let slit=0;slit<7;slit++)kit.box([.011,.003,.122],[-.067+slit*.022,.071,.103],dark,.001);
    kit.cylinder(.037,.037,.014,[.123,.397,-.041],steel,24,[0,0,Math.PI/2]);
    ring(kit,.027,.002,[.132,.397,-.041],dark,[0,Math.PI/2,0]);
    kit.box([.062,.016,.052],[0,.398,-.04],dark,.003);
  }));
  return {bounds,fill};
}

function brewing(kit,colors,steel,clear) {
  const porcelain=colors.get('#ede4cd'),coffee=colors.get('#6a4b32'),dark=colors.get('#53655e');
  const dripper=kit.measure(()=>kit.place(cafeLayout.dripper,[0,Math.PI,0],()=>{
    kit.box([.239,.025,.224],[0,.013,0],dark,.011);
    vessel(kit,[[0,0],[.044,0],[.074,.049],[.056,.127],[.032,.159],[.040,.17],[.034,.175],[.025,.153],[.048,.120],[.064,.045],[.038,.011],[0,.009]],[0,.029,0],clear);
    kit.cylinder(.045,.055,.032,[0,.056,0],coffee,28);
    kit.curve([[.050,.059,0],[.109,.063,0],[.121,.15,0],[.040,.151,0]],.007,clear,14,6);
    vessel(kit,[[.013,0],[.020,.023],[.085,.109],[.090,.121],[.084,.124],[.016,.032],[.011,.005]],[0,.204,0],porcelain);
    for(let flute=0;flute<16;flute++){
      const angle=flute*Math.PI/8;
      kit.rod([Math.cos(angle)*.021,.231,Math.sin(angle)*.021],[Math.cos(angle)*.081,.319,Math.sin(angle)*.081],.002,colors.get('#bbaa8d'),4);
    }
    vessel(kit,[[.008,0],[.074,.088],[.078,.096],[.073,.10],[.006,.008]],[0,.227,0],colors.get('#ded4b9'));
    kit.cylinder(.060,.060,.004,[0,.314,0],coffee,24);
  }));
  const kettle=kit.measure(()=>kit.place(cafeLayout.kettle,[0,-Math.PI/2,0],()=>{
    kit.box([.265,.035,.245],[0,.018,0],dark,.012);
    vessel(kit,[[0,0],[.065,0],[.088,.044],[.083,.147],[.048,.211],[0,.215]],[0,.037,0],steel);
    kit.cylinder(.049,.051,.014,[0,.259,0],steel,28);kit.sphere([.017,.015,.017],[0,.278,0],dark,12);
    kit.curve([[.075,.113,0],[.162,.141,0],[.173,.259,0],[.146,.273,0]],.010,steel,22,8);
    kit.curve([[-.068,.193,0],[-.122,.224,0],[-.141,.103,0],[-.077,.086,0]],.013,dark,20,8);
  }));
  return [dripper,kettle];
}

export function buildEquipment(kit,colors,textures) {
  const steel=new THREE.MeshStandardMaterial({color:'#bec8c7',metalness:.80,roughness:.30,envMap:textures.reflections,envMapIntensity:.75});
  const clear=new THREE.MeshPhysicalMaterial({color:'#e9eee4',transparent:true,opacity:.16,roughness:.15,envMap:textures.reflections,envMapIntensity:.65,side:THREE.DoubleSide,depthWrite:false,forceSinglePass:true});
  const machine=espressoMachine(kit,colors,steel);
  const grinderStations=cafeLayout.grinders.map((position,index)=>grinder(kit,colors,steel,clear,position,index));
  const grinders=grinderStations.map(station=>station.bounds);
  const brewingStations=brewing(kit,colors,steel,clear);
  for(const bounds of [machine,...grinders])if(bounds.min.x<.45||bounds.max.x>5.55||bounds.min.z< -2.415||bounds.max.z> -1.475)throw new Error('商用器械超出台面或侵占通道');
  if(machine.min.x-grinders[0].max.x<.30||grinders[0].min.x-grinders[1].max.x<.10)throw new Error('压粉工位或磨豆机净距不足');
  return {espressoGroups:3,style:'full-size three-group graphite commercial chassis with operator-facing controls',machineSize:machine.getSize(new THREE.Vector3()).toArray(),machineBounds:{min:machine.min.toArray(),max:machine.max.toArray()},grinders:2,grinderBounds:grinders.map(bounds=>({min:bounds.min.toArray(),max:bounds.max.toArray()})),hopperFill:grinderStations.map(station=>station.fill),brewingBounds:brewingStations.map(bounds=>({min:bounds.min.toArray(),max:bounds.max.toArray()})),grinderHeight:.721,controls:'per-group shot displays and separated start controls, pressure gauges and dual steam arms',orientation:'operating face toward rear working aisle',pourOver:'rear hot-water preparation station with scale, dripper and kettle',layout:cafeLayout};
}
