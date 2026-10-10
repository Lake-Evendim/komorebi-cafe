import { labelTexture, placard } from './kit.js';

export function buildParking(kit, colors, origin, rotation) {
  const point = (localX, localY, localZ) => [origin[0] + localX * Math.cos(rotation) + localZ * Math.sin(rotation), origin[1] + localY, origin[2] - localX * Math.sin(rotation) + localZ * Math.cos(rotation)];
  const steel = colors.get('#85918e'), dark = colors.get('#495b5d'), brass = colors.get('#b6a071');
  const slotCenters = [];
  for (const [index, localZ] of [0, -.62].entries()) {
    const center = point(.54, 0, localZ);
    slotCenters.push(center);
    kit.box([.77, .028, .23], point(.54, -.006, localZ), steel, .010, [0, rotation, 0]);
    kit.box([.64, .015, .085], point(.54, .015, localZ), dark, .008, [0, rotation, 0]);
    for (const side of [-1, 1]) {
      kit.curve([point(.22, .035, localZ + side * .063), point(.29, .18, localZ + side * .063), point(.55, .32, localZ + side * .063), point(.78, .18, localZ + side * .063), point(.85, .035, localZ + side * .063)], .012, steel, 20, 8);
      for (const localX of [.21,.87]) {
        kit.cylinder(.014,.014,.009,point(localX,.020,localZ+side*.090),brass,6);
        kit.box([.054,.009,.06],point(localX,.014,localZ+side*.084),steel,.004,[0,rotation,0]);
      }
    }
    kit.box([.12,.011,.14],point(.93,.010,localZ),dark,.006,[0,rotation,0]);
    placard(kit,[.082,.10],point(.93,.017,localZ),labelTexture([{text:String(index+1),size:72,y:94}],{width:164,height:200,background:'#495b5d',color:'#e9dfbf',border:'#495b5d'}),'#ffffff',[-Math.PI/2,0,-rotation]);
  }
  kit.rod(point(1.02,0,-.34),point(1.02,.77,-.34),.015,dark,10);
  const sign=point(1.02,.67,-.34);
  kit.box([.40,.24,.035],sign,dark,.012,[0,-Math.PI/2,0]);
  placard(kit,[.36,.20],[sign[0]-.023,sign[1],sign[2]],labelTexture([{text:'お客様専用',size:43,y:65},{text:'駐輪スペース',size:35,y:112}],{width:360,height:200,background:'#e3ddc8',color:'#4b6058'}),'#ffffff',[0,-Math.PI/2,0]);
  return { type:'front-wheel stand',slots:slotCenters,tireWidth:.046,guideInnerWidth:.102,occupiedSlot:0,rackTopY:origin[1]+.0225 };
}
