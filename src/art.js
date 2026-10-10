import { canvasTexture, placard, seeded } from './kit.js';

function paper(painter,width,height,base,random) {
  painter.fillStyle=base;painter.fillRect(0,0,width,height);
  for(let grain=0;grain<22000;grain++) {
    painter.fillStyle=grain%3?'rgba(255,250,229,.045)':'rgba(70,64,47,.045)';
    painter.fillRect(random()*width,random()*height,.5+random()*2,.5+random()*2);
  }
}

function stone(painter,centerX,centerY,width,height,random) {
  painter.save();painter.translate(centerX,centerY);
  painter.fillStyle='rgba(47,52,42,.16)';painter.beginPath();painter.ellipse(6,8,width*.68,height*.18,0,0,Math.PI*2);painter.fill();
  painter.beginPath();painter.moveTo(-width*.51,0);painter.lineTo(-width*.42,-height*.62);painter.lineTo(-width*.17,-height);painter.lineTo(width*.25,-height*.89);painter.lineTo(width*.49,-height*.48);painter.lineTo(width*.55,-height*.08);painter.lineTo(width*.29,height*.05);painter.closePath();
  const wash=painter.createLinearGradient(-width/2,-height,width/2,0);wash.addColorStop(0,'#aaa99b');wash.addColorStop(.42,'#85867b');wash.addColorStop(1,'#575e58');painter.fillStyle=wash;painter.fill();painter.clip();
  painter.fillStyle='rgba(213,207,184,.27)';painter.beginPath();painter.moveTo(-width*.48,-height*.6);painter.lineTo(-width*.17,-height);painter.lineTo(-width*.03,-height*.31);painter.lineTo(-width*.21,0);painter.closePath();painter.fill();
  painter.strokeStyle='rgba(48,55,50,.24)';painter.lineWidth=2;
  for(let crack=0;crack<8;crack++){const baseX=(random()-.5)*width;painter.beginPath();painter.moveTo(baseX,-height);painter.lineTo(baseX+random()*30,-height*.5);painter.lineTo(baseX-15+random()*30,10);painter.stroke();}
  for(let fleck=0;fleck<1800;fleck++){painter.fillStyle=fleck%2?'rgba(226,218,194,.15)':'rgba(37,49,44,.13)';painter.fillRect((random()-.5)*width, -random()*height,1+random()*4,1+random()*3);}
  painter.restore();
}

function garden() {
  return canvasTexture(1536,1024,(painter,width,height)=>{
    const random=seeded(47013);paper(painter,width,height,'#ddd8c7',random);
    painter.fillStyle='#c8cbb8';painter.fillRect(0,0,width,226);
    for(let shrub=0;shrub<190;shrub++){const centerX=random()*width,centerY=80+random()*130;painter.fillStyle=['#8d9b81','#a4ae96','#b2baa1'][shrub%3];painter.beginPath();painter.ellipse(centerX,centerY,25+random()*40,14+random()*22,0,0,Math.PI*2);painter.fill();}
    painter.fillStyle='#b5ad96';painter.fillRect(0,208,width,146);painter.fillStyle='#777b6c';painter.fillRect(0,203,width,12);painter.fillStyle='#c7bda4';painter.fillRect(0,224,width,9);
    for(let seam=0;seam<20;seam++){painter.strokeStyle='rgba(110,102,84,.10)';painter.beginPath();painter.moveTo(seam*83,225);painter.lineTo(seam*83-12,343);painter.stroke();}
    const ground=painter.createLinearGradient(0,340,0,height);ground.addColorStop(0,'#d7d2bd');ground.addColorStop(1,'#ece4ce');painter.fillStyle=ground;painter.fillRect(0,354,width,height-354);
    painter.save();
    for(let rake=0;rake<72;rake++) {
      const baseY=365+rake*11;painter.strokeStyle=rake%2?'rgba(111,110,91,.22)':'rgba(255,250,223,.55)';painter.lineWidth=2.2;
      painter.beginPath();painter.moveTo(-30,baseY);painter.bezierCurveTo(390,baseY-40,1090,baseY+29,1566,baseY-19);painter.stroke();
    }
    for(const [centerX,centerY,radiusX,radiusY] of [[512,617,230,89],[1110,767,198,78]]) {
      for(let ring=0;ring<15;ring++){painter.strokeStyle=ring%2?'rgba(111,110,91,.25)':'rgba(254,247,222,.65)';painter.lineWidth=2.8;painter.beginPath();painter.ellipse(centerX,centerY,radiusX+ring*12,radiusY+ring*5,0,0,Math.PI*2);painter.stroke();}
      painter.fillStyle='#71816a';painter.beginPath();painter.ellipse(centerX,centerY,radiusX*.61,radiusY*.64,-.05,0,Math.PI*2);painter.fill();
      for(let moss=0;moss<1100;moss++){const angle=random()*Math.PI*2,radial=Math.sqrt(random());painter.fillStyle=['#8c986f','#5b715b','#a1a87f'][moss%3];painter.fillRect(centerX+Math.cos(angle)*radiusX*.60*radial,centerY+Math.sin(angle)*radiusY*.61*radial,2+random()*4,2);}
    }
    stone(painter,470,622,174,237,random);stone(painter,580,637,125,127,random);stone(painter,402,638,95,77,random);
    stone(painter,1094,772,146,153,random);stone(painter,1179,789,93,87,random);
    painter.restore();
    for(let grit=0;grit<9000;grit++){painter.fillStyle='rgba(91,92,74,.06)';painter.fillRect(random()*width,354+random()*670,1,1);}
  });
}

function coffeeStillLife() {
  return canvasTexture(1536,1152,(painter,width,height)=>{
    const random=seeded(23041);paper(painter,width,height,'#d8cebb',random);
    const wall=painter.createLinearGradient(0,0,width,600);wall.addColorStop(0,'#8fa5a1');wall.addColorStop(.6,'#c9cbb5');wall.addColorStop(1,'#e4d8be');painter.fillStyle=wall;painter.fillRect(0,0,width,720);
    painter.fillStyle='#ebdfbd';painter.fillRect(73,58,597,531);
    const window=painter.createLinearGradient(0,50,0,584);window.addColorStop(0,'#b3cfcd');window.addColorStop(.66,'#e4e5c9');window.addColorStop(1,'#a9b29b');painter.fillStyle=window;painter.fillRect(98,80,545,482);
    painter.fillStyle='#837e64';painter.fillRect(342,80,15,482);painter.fillRect(98,337,545,16);
    painter.fillStyle='rgba(243,237,214,.55)';painter.beginPath();painter.moveTo(110,95);painter.lineTo(230,95);painter.lineTo(168,526);painter.lineTo(111,567);painter.closePath();painter.fill();
    painter.fillStyle='#8e654b';painter.beginPath();painter.moveTo(0,736);painter.lineTo(width,627);painter.lineTo(width,height);painter.lineTo(0,height);painter.closePath();painter.fill();
    for(let grain=0;grain<150;grain++){painter.strokeStyle=grain%3?'rgba(48,28,17,.12)':'rgba(235,190,127,.11)';painter.lineWidth=1+random();const baseY=690+random()*500;painter.beginPath();painter.moveTo(0,baseY);painter.bezierCurveTo(430,baseY-32,890,baseY-12,1536,baseY-108);painter.stroke();}
    painter.fillStyle='rgba(241,232,204,.75)';painter.beginPath();painter.moveTo(281,761);painter.lineTo(1045,659);painter.lineTo(1285,1050);painter.lineTo(466,1152);painter.closePath();painter.fill();
    for(let weave=0;weave<100;weave++){painter.strokeStyle='rgba(159,145,112,.10)';painter.lineWidth=1;painter.beginPath();painter.moveTo(281+weave*7,762-weave*.9);painter.lineTo(466+weave*8,1152-weave);painter.stroke();}
    painter.fillStyle='rgba(39,29,22,.16)';painter.beginPath();painter.ellipse(841,867,216,58,-.07,0,Math.PI*2);painter.fill();
    painter.fillStyle='#e9e2ce';painter.beginPath();painter.ellipse(803,849,195,60,-.07,0,Math.PI*2);painter.fill();painter.strokeStyle='#b3ad95';painter.lineWidth=4;painter.stroke();
    painter.strokeStyle='#e9e2cf';painter.lineWidth=25;painter.beginPath();painter.ellipse(977,748,43,61,-.2,0,Math.PI*2);painter.stroke();
    const cup=painter.createLinearGradient(652,0,951,0);cup.addColorStop(0,'#f7efd9');cup.addColorStop(.62,'#ddd7bf');cup.addColorStop(1,'#a9b5a8');painter.fillStyle=cup;painter.beginPath();painter.moveTo(663,708);painter.bezierCurveTo(681,909,925,909,944,708);painter.closePath();painter.fill();
    painter.fillStyle='#eee5ce';painter.beginPath();painter.ellipse(803,708,142,51,0,0,Math.PI*2);painter.fill();painter.fillStyle='#634330';painter.beginPath();painter.ellipse(803,708,124,37,0,0,Math.PI*2);painter.fill();
    painter.strokeStyle='#d2a475';painter.lineWidth=4;painter.beginPath();painter.ellipse(803,708,116,32,0,0,Math.PI*2);painter.stroke();
    painter.strokeStyle='rgba(243,236,209,.39)';painter.lineWidth=3;for(let steam=0;steam<3;steam++){painter.beginPath();painter.moveTo(758+steam*47,655);painter.bezierCurveTo(732+steam*50,600,810+steam*38,548,780+steam*39,510);painter.stroke();}
    const kettle=painter.createLinearGradient(184,0,496,0);kettle.addColorStop(0,'#5f7977');kettle.addColorStop(.45,'#d3d7c7');kettle.addColorStop(.7,'#849994');kettle.addColorStop(1,'#435e5e');painter.fillStyle=kettle;painter.beginPath();painter.moveTo(229,704);painter.bezierCurveTo(159,653,212,538,257,508);painter.lineTo(382,508);painter.bezierCurveTo(425,546,467,668,415,704);painter.closePath();painter.fill();
    painter.strokeStyle='#8ea4a0';painter.lineWidth=17;painter.beginPath();painter.moveTo(408,615);painter.bezierCurveTo(506,598,488,492,550,469);painter.stroke();painter.strokeStyle='#4f6058';painter.lineWidth=15;painter.beginPath();painter.moveTo(235,540);painter.bezierCurveTo(119,480,136,661,222,666);painter.stroke();
    painter.fillStyle='#a7b5a7';painter.beginPath();painter.ellipse(320,510,70,17,0,0,Math.PI*2);painter.fill();painter.fillStyle='#735238';painter.beginPath();painter.ellipse(320,484,17,13,0,0,Math.PI*2);painter.fill();
    painter.fillStyle='#e4dcc5';painter.beginPath();painter.ellipse(533,1002,159,57,-.1,0,Math.PI*2);painter.fill();
    painter.save();painter.translate(526,979);painter.rotate(-.12);
    for(let fold=0;fold<7;fold++){const centerX=(fold-3)*31,centerY=Math.abs(fold-3)*8;const pastry=painter.createLinearGradient(0,-63,0,40);pastry.addColorStop(0,'#e6bf77');pastry.addColorStop(.55,'#ba8144');pastry.addColorStop(1,'#925b2e');painter.fillStyle=pastry;painter.beginPath();painter.ellipse(centerX,centerY,28,55-Math.abs(fold-3)*7,fold*.10-.3,0,Math.PI*2);painter.fill();painter.strokeStyle='rgba(238,204,145,.62)';painter.lineWidth=3;painter.stroke();}painter.restore();
    painter.fillStyle='#809681';painter.beginPath();painter.moveTo(1180,635);painter.bezierCurveTo(1102,590,1162,490,1180,473);painter.lineTo(1242,473);painter.bezierCurveTo(1265,510,1314,606,1255,635);painter.closePath();painter.fill();
    for(let twig=0;twig<6;twig++){const topX=1145+twig*31,topY=294+twig%3*38;painter.strokeStyle='#687960';painter.lineWidth=4;painter.beginPath();painter.moveTo(1210,475);painter.quadraticCurveTo(1180+twig*9,374,topX,topY);painter.stroke();for(let petal=0;petal<5;petal++){const angle=petal*Math.PI*.4;painter.fillStyle=petal%2?'#ead5c5':'#d6bcae';painter.beginPath();painter.ellipse(topX+Math.cos(angle)*13,topY+Math.sin(angle)*13,16,8,angle,0,Math.PI*2);painter.fill();}painter.fillStyle='#c3a466';painter.beginPath();painter.arc(topX,topY,5,0,Math.PI*2);painter.fill();}
    for(let brush=0;brush<14000;brush++){painter.fillStyle=brush%2?'rgba(255,248,220,.025)':'rgba(46,39,25,.023)';painter.fillRect(random()*width,random()*height,2+random()*7,1+random()*2);}
  });
}

function frame(kit,colors,texture,position,width,height) {
  kit.place(position,[0,-Math.PI/2,0],()=>{
    const wood=colors.get('#624c38'), trim=colors.get('#a38d66'), mat=colors.get('#eee7d5');
    kit.box([width+.12,height+.12,.032],[0,0,-.022],wood,.006);
    kit.box([width+.07,height+.07,.012],[0,0,.003],mat,.002);
    placard(kit,[width,height],[0,0,.013],texture);
    for(const side of [-1,1]) {
      kit.box([.038,height+.12,.044],[side*(width/2+.04),0,.009],wood,.005);
      kit.box([width+.12,.038,.044],[0,side*(height/2+.04),.009],wood,.005);
      kit.box([.007,height+.058,.009],[side*(width/2+.019),0,.019],trim,.001);
      kit.box([width+.058,.007,.009],[0,side*(height/2+.019),.019],trim,.001);
    }
  });
}

export function makeArtTextures() {
  return {garden:garden(),coffee:coffeeStillLife()};
}

export function buildWallArt(kit,colors,art) {
  frame(kit,colors,art.garden,[5.795,2.14,-1.73],.93,.62);
  frame(kit,colors,art.coffee,[5.795,2.12,.27],.87,.6525);
  return {subjects:['karesansui garden','window-side coffee still life'],textures:[[1536,1024],[1536,1152]]};
}
