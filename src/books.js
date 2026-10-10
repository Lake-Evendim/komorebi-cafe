import * as THREE from 'three';
import { canvasTexture, placard, seeded } from './kit.js';

const bookTextures=new WeakMap();

function bookTexture(title,tint,index) {
  const spine=canvasTexture(128,512,painter=>{
    painter.fillStyle=tint;painter.fillRect(0,0,128,512);
    painter.fillStyle='rgba(34,31,24,.20)';painter.fillRect(0,0,12,512);painter.fillStyle='rgba(255,242,207,.16)';painter.fillRect(15,0,3,512);
    painter.strokeStyle='#d7c7a0';painter.lineWidth=2;painter.strokeRect(24,24,80,456);
    painter.fillStyle='#eee3c6';painter.font='32px "Yu Mincho",serif';painter.textAlign='center';
    [...title].slice(0,8).forEach((character,characterIndex)=>painter.fillText(character,64,92+characterIndex*42));
    painter.font='21px serif';painter.fillText(String(index+1).padStart(2,'0'),64,460);
  });
  const cover=canvasTexture(384,512,painter=>{
    painter.fillStyle=tint;painter.fillRect(0,0,384,512);painter.strokeStyle='#cdbb91';painter.lineWidth=2;painter.strokeRect(27,30,330,452);
    painter.fillStyle='#e8dec4';painter.textAlign='center';painter.font='31px "Yu Mincho",serif';painter.fillText(title,192,115);
    painter.strokeStyle='rgba(231,218,177,.6)';painter.lineWidth=2;
    for(let contour=0;contour<12;contour++){painter.beginPath();painter.ellipse(192,294,54+contour*5,32+contour*6,-.2,0,Math.PI*2);painter.stroke();}
    painter.font='17px serif';painter.fillText('木漏れ日文庫',192,451);
  });
  return {spine,cover};
}

function closedBook(kit,colors,specification,position,rotation) {
  const {title,tint,thickness,height,depth,index}=specification;
  if(!bookTextures.has(kit))bookTextures.set(kit,new Map());
  const cache=bookTextures.get(kit),key=title+':'+tint;
  if(!cache.has(key))cache.set(key,bookTexture(title,tint,index%9));
  const textures=cache.get(key),cover=colors.get(tint),paper=colors.get('#d9ceb5'),edge=colors.get('#b5a78d');
  kit.place(position,rotation,()=>{
    kit.box([thickness-.006,height-.013,depth-.012],[0,0,0],paper,.002);
    for(const side of [-1,1])kit.box([.0035,height,depth],[side*(thickness/2-.00175),0,0],cover,.0015);
    kit.box([thickness,height,.009],[0,0,depth/2-.0045],cover,.004);
    placard(kit,[thickness*.91,height*.96],[0,0,depth/2+.0002],textures.spine);
    placard(kit,[depth*.91,height*.93],[thickness/2+.0004,0,0],textures.cover,'#ffffff',[0,Math.PI/2,0]);
    placard(kit,[depth*.91,height*.93],[-thickness/2-.0004,0,0],textures.cover,'#ffffff',[0,-Math.PI/2,0]);
    for(let leaf=0;leaf<7;leaf++)kit.box([thickness-.008,.0007,.001],[0,-height*.42+leaf*height*.13,-depth/2+.005],edge);
    if(index%3===0)kit.box([.007,.044,.001],[thickness*.2,-height*.49-.015,-depth*.23],colors.get('#9a695e'));
  });
}

function readingPages(kit,colors,position,angle) {
  const ink=canvasTexture(768,512,painter=>{
    painter.fillStyle='#e6ddc4';painter.fillRect(0,0,768,512);
    painter.fillStyle='#736957';painter.font='28px "Yu Mincho",serif';painter.textAlign='center';painter.fillText('春の喫茶と小さな庭',384,63);
    painter.fillStyle='#a7b3a0';painter.fillRect(71,103,226,151);
    painter.strokeStyle='#768b72';painter.lineWidth=3;for(let curve=0;curve<9;curve++){painter.beginPath();painter.ellipse(188,187,20+curve*8,10+curve*4,0,0,Math.PI*2);painter.stroke();}
    for(let line=0;line<20;line++){painter.fillStyle=line%5?'rgba(103,93,73,.50)':'rgba(103,93,73,.23)';painter.fillRect(line<10?427:71,line<10?108+line*24:292+(line-10)*14,line%4===0?210:248,2);}
  });
  const pageMaterial=new THREE.MeshToonMaterial({color:'#eee4cc',map:ink,gradientMap:colors.ramp,side:THREE.DoubleSide});
  kit.place(position,[0,angle,0],()=>{
    kit.box([.252,.006,.206],[0,.003,0],colors.get('#7b9188'),.002);
    for(const side of [-1,1]) {
      for(let layer=0;layer<3;layer++) {
        const geometry=new THREE.PlaneGeometry(.12,.195,12,4),positions=geometry.attributes.position;
        for(let vertex=0;vertex<positions.count;vertex++){
          const horizontal=positions.getX(vertex)+.06,depth=positions.getY(vertex);
          positions.setXYZ(vertex,side*horizontal,.009+layer*.0018+.009*Math.sin(horizontal/.12*Math.PI)-.003*horizontal/.12,depth);
        }
        geometry.computeVertexNormals();
        const texture=layer===2?ink:null;
        if(texture) {
          const coordinates=geometry.attributes.uv;
          for(let vertex=0;vertex<coordinates.count;vertex++)coordinates.setX(vertex,(side<0?1-coordinates.getX(vertex):coordinates.getX(vertex))*.5+(side<0?0:.5));
        }
        kit.add(geometry,texture?pageMaterial:colors.get('#eee4cc',{side:THREE.DoubleSide}),[0,0,0],[0,0,0],[1,1,1],false);geometry.dispose();
      }
    }
    kit.box([.008,.001,.135],[.012,.017,.034],colors.get('#a07860'),.001,[0,-.09,0]);
  });
}

export function buildBooks(kit,colors) {
  const titles=['庭の時間','珈琲手帖','小さな旅','花と暮し','喫茶散歩','民藝の器','春の台所','窓辺日記','静かな町'];
  const tints=['#7e8d7e','#ad9871','#647f85','#a47e70','#838166','#556d70','#b09c7c','#847361','#9a9981'];
  const random=seeded(12741);
  const walnut=colors.get('#76543d'),dark=colors.get('#4f3a2d');
  let closed=0;
  const layouts=[];
  const cabinet=kit.measure(()=>kit.place([-1.71,.35,-2.72],[0,Math.PI/2,0],()=>{
    kit.box([1.16,1.86,.024],[0,.99,-.169],dark,.008);
    for(const side of [-1,1])kit.box([.04,1.92,.36],[side*.57,.96,0],walnut,.01);
    kit.box([1.21,.045,.385],[0,1.9175,0],walnut,.012);
    kit.box([1.16,.105,.35],[0,.0525,0],walnut,.008);
    const shelfHeights=[.13,.52,.94,1.43];
    shelfHeights.forEach(height=>kit.box([1.14,.035,.35],[0,height,0],walnut,.008));
    const specification=(height,depth,thickness)=>{
      const index=closed++;
      return {title:titles[index%titles.length],tint:tints[index%tints.length],thickness,height,depth,index};
    };
    const upright=(count,start,top,height,depth)=>{
      let offsetX=start;
      for(let column=0;column<count;column++){
        const book=specification(height+random()*.032,depth+random()*.012,.025+random()*.015);
        const lean=column===count-1?.07:0;
        closedBook(kit,colors,book,[offsetX+book.thickness/2+book.height/2*Math.sin(lean),top+book.height/2*Math.cos(lean)+book.thickness/2*Math.sin(lean),.037],[0,0,lean]);
        offsetX+=book.thickness+.005;
      }
      kit.box([.011,.105,.105],[offsetX+.005,top+.0525,-.015],dark,.002);
      return offsetX;
    };
    const stack=(count,center,top,height,depth)=>{
      let elevation=top;
      for(let layer=0;layer<count;layer++){
        const book=specification(height-layer*.009,depth,.018+layer*.005);
        closedBook(kit,colors,book,[center+(layer%2?.009:-.009),elevation+book.thickness/2,.035],[0,(layer%2?1:-1)*.045,-Math.PI/2]);
        elevation+=book.thickness+.001;
      }
    };
    const display=(center,top,height,depth)=>{
      const book=specification(height,depth,.028);
      closedBook(kit,colors,book,[center,top+height/2,.031],[0,-Math.PI/2,0]);
      for(const side of [-1,1]) {
        kit.rod([center+side*depth*.30,top+.006,.079],[center+side*depth*.30,top+.006,-.05],.003,dark,6);
        kit.rod([center+side*depth*.30,top+.006,-.05],[center+side*depth*.30,top+height*.55,.013],.003,dark,6);
      }
      kit.rod([center-depth*.30,top+height*.50,.013],[center+depth*.30,top+height*.50,.013],.003,dark,6);
    };
    upright(12,-.49,.1475,.288,.196);stack(2,.34,.1475,.29,.191);
    layouts.push({theme:'large-format garden and design collection',upright:12,stacked:2,display:0,shelf:.13});
    stack(4,-.315,.5375,.302,.187);upright(6,-.068,.5375,.228,.166);stack(2,.39,.5375,.224,.162);
    layouts.push({theme:'travel books between offset stacks',upright:6,stacked:6,display:0,shelf:.52});
    display(-.30,.9575,.315,.235);upright(5,-.072,.9575,.214,.163);display(.36,.9575,.274,.207);
    layouts.push({theme:'face-out coffee and craft recommendations',upright:5,stacked:0,display:2,shelf:.94});
    upright(7,-.46,1.4475,.196,.154);stack(3,.04,1.4475,.23,.163);
    const vase=kit.geometry('bookcase-vase',()=>new THREE.LatheGeometry([[0,0],[.043,0],[.057,.026],[.061,.106],[.028,.179],[.025,.195],[.020,.195],[.024,.18],[.050,.10],[.037,.014],[0,.013]].map(point=>new THREE.Vector2(...point)),24));
    kit.add(vase,colors.get('#79958b'),[.36,1.4475,.02]);
    for(const offset of [-.025,.013,.039])kit.curve([[.36,1.64,.02],[.36+offset,1.73,.023],[.36+offset*.7,1.80,.018]],.002,colors.get('#889269'),10,4);
    layouts.push({theme:'small paperbacks, journals and a ceramic vase',upright:7,stacked:3,display:0,shelf:1.43});
    for(const localX of [-.48,.48])for(const localZ of [-.12,.12])kit.box([.052,.08,.052],[localX,.04,localZ],dark,.004);
  }));
  readingPages(kit,colors,[1.62,1.013,1.45],-.14);
  return {closed,open:1,layouts,spines:'shared artwork with varied format and physical page blocks',cabinet:{min:cabinet.min.toArray(),max:cabinet.max.toArray(),height:1.94,placement:'left rear opaque wall',aisleClearance:.55-cabinet.max.x}};
}
