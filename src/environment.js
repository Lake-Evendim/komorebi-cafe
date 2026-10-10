import * as THREE from 'three';
import { placard, labelTexture, seeded } from './kit.js';
import { buildParking } from './parking.js';

export const sakuraSites=[
  {origin:[9.4,.08,-.7],scale:1.10,seed:11132,site:'side garden'},
  {origin:[-12.8,.16,1.2],scale:.94,seed:76162,site:'left roadside planting verge'},
  {origin:[-.85,.16,-6.45],scale:.81,seed:541,site:'cafe rear garden'},
  {origin:[-12.9,.08,-24],scale:.8,seed:889,site:'outer roadside garden'},
  {origin:[19,.08,-31],scale:.84,seed:13021,site:'railway-side garden'},
];

function bicycle(kit, colors, origin, rotation) {
  const point = (offsetX, offsetY, offsetZ) => [origin[0] + offsetX * Math.cos(rotation) + offsetZ * Math.sin(rotation), origin[1] + offsetY, origin[2] - offsetX * Math.sin(rotation) + offsetZ * Math.cos(rotation)];
  const chrome = colors.get('#afb6aa'), rubber = colors.get('#444b54'), paint = colors.get('#84a8a0');
  const wheelGeometry = new THREE.TorusGeometry(.33, .023, 8, 40);
  const rimGeometry = new THREE.TorusGeometry(.306, .010, 6, 40);
  for (const wheelX of [-.54, .54]) {
    kit.add(wheelGeometry, rubber, point(wheelX, .35, 0), [0, rotation, 0]);
    kit.add(rimGeometry, chrome, point(wheelX, .35, 0), [0, rotation, 0]);
    for (let spoke = 0; spoke < 18; spoke++) {
      const angle = spoke * Math.PI / 9;
      kit.rod(point(wheelX, .35, .017), point(wheelX + Math.cos(angle) * .299, .35 + Math.sin(angle) * .299, .012), .0025, chrome, 4);
    }
    kit.cylinder(.016, .016, .085, point(wheelX, .35, 0), chrome, 8, [Math.PI / 2, 0, rotation]);
  }
  const joints = [[[-.54,.35,0],[-.23,.84,0]], [[-.23,.84,0],[.15,.80,0]], [[.15,.80,0],[.54,.35,0]], [[-.54,.35,0],[-.03,.34,0]], [[-.03,.34,0],[.15,.80,0]], [[-.03,.34,0],[-.23,.84,0]], [[-.23,.84,0],[-.23,.98,0]], [[.15,.80,0],[.18,1.04,0]]];
  for (const [start, end] of joints) kit.rod(point(...start), point(...end), .019, paint, 8);
  kit.box([.23, .049, .17], point(-.23, 1.0, 0), rubber, .03, [0, rotation, 0]);
  kit.rod(point(.18, 1.04, -.22), point(.18, 1.04, .22), .013, chrome);
  for (const sign of [-1, 1]) kit.rod(point(.16, 1.04, sign * .16), point(.23, 1.02, sign * .29), .023, rubber);
  kit.add(new THREE.TorusGeometry(.11, .009, 6, 20), chrome, point(-.03, .34, .03), [0, rotation, 0]);
  kit.rod(point(-.03, .34, .03), point(.07, .28, .06), .008, chrome);
  kit.box([.11, .018, .054], point(.10, .28, .08), rubber, .006, [0, rotation, 0]);
  kit.box([.29, .05, .33], point(.5, .84, 0), colors.get('#b7b2a0'), .017, [0, rotation, 0]);
  for (const height of [.86, .94, 1.02]) {
    for (const side of [-1, 1]) kit.rod(point(.34, height, side * .17), point(.65, height, side * .17), .004, chrome, 4);
    for (const offsetX of [.34, .65]) kit.rod(point(offsetX, height, -.17), point(offsetX, height, .17), .004, chrome, 4);
  }
  for (let wire = 0; wire < 7; wire++) for (const side of [-1, 1]) kit.rod(point(.34 + wire * .05, .85, side * .17), point(.34 + wire * .05, 1.02, side * .17), .003, chrome, 4);
  kit.rod(point(-.25, .30, -.04), point(-.4, 0, -.25), .008, chrome);
  kit.rod(point(-.57, .39, .07), point(-.65, .81, .07), .006, chrome);
  kit.box([.39, .02, .21], point(-.48, .80, .0), chrome, .015, [0, rotation, 0]);
  kit.sphere([.025, .025, .013], point(-.72, .76, 0), colors.get('#b75b57'), 8);
  kit.sphere([.033, .03, .027], point(.72, .69, 0), colors.get('#f5e6b8'), 8);
}

function house(kit, colors, position, width, depth, height, tint, roofTint) {
  const [centerX, baseY, centerZ] = position;
  const plaster = colors.get(tint), timber = colors.get('#797868'), roof = colors.get(roofTint);
  kit.box([width, height, depth], [centerX, baseY + height / 2, centerZ], plaster, .024);
  const slope = Math.atan2(.9, width / 2 + .2);
  for (const side of [-1, 1]) {
    kit.box([Math.hypot(width / 2 + .3, .9), .13, depth + .6], [centerX + side * width / 4, baseY + height + .46, centerZ], roof, .03, [0, 0, -side * slope]);
    kit.box([.13, .18, depth + .65], [centerX + side * (width / 2 + .29), baseY + height - .03, centerZ], timber, .015);
  }
  for (let story = 0; story < 2; story++) for (const side of [-1, 1]) {
    const frameX = centerX + side * width * .27, frameY = baseY + 1.35 + story * 2.15;
    kit.box([1.24, 1.09, .065], [frameX, frameY, centerZ + depth / 2 + .03], timber, .018);
    kit.box([1.1, .97, .028], [frameX, frameY, centerZ + depth / 2 + .073], colors.get('#9eafb3'), .01);
    kit.box([.035, 1.01, .036], [frameX, frameY, centerZ + depth / 2 + .094], colors.get('#dfdbcb'));
    kit.box([1.37, .085, .35], [frameX, frameY + .65, centerZ + depth / 2 + .18], roof, .01);
    for (let slat = 0; slat < 4; slat++) kit.box([1.1, .02, .014], [frameX, frameY - .45 + slat * .26, centerZ + depth / 2 + .096], colors.get('#d4d5c9'));
  }
  kit.box([.86, 1.95, .075], [centerX, baseY + .98, centerZ + depth / 2 + .03], colors.get('#806c5c'), .03);
  kit.box([1.35, .10, .7], [centerX, baseY + 2.14, centerZ + depth / 2 + .32], roof, .016);
  kit.cylinder(.035, .035, height, [centerX + width / 2 + .07, baseY + height / 2, centerZ + depth / 2 - .1], colors.get('#aaa89a'), 8);
  kit.box([1.0, .46, .28], [centerX - width * .32, baseY + .66, centerZ + depth / 2 + .2], colors.get('#bdbfb3'), .025);
  for (let slit = 0; slit < 10; slit++) kit.box([.075, .023, .015], [centerX - width * .32, baseY + .48 + slit * .032, centerZ + depth / 2 + .349], timber);
}

export function buildEnvironment(kit, colors, textures) {
  const random = seeded(77102);
  const stone = colors.get('#b7b7aa'), gutter = colors.get('#a9aaa0'), metal = colors.get('#667077');
  const asphalt = new THREE.MeshToonMaterial({ color: '#afb3b8', map: textures.asphalt, gradientMap: colors.ramp });
  kit.box([220, .18, 210], [0, -.20, -50], colors.get('#a8b596'));
  const roadOutline=new THREE.Shape();
  const roadPoints=[[-18,16],[18,16],[18,4.65],[-4.2,4.65],[-4.2,-59.5],[-10.8,-59.5],[-10.8,4.65],[-18,4.65]];
  roadPoints.forEach((point,index)=>index?roadOutline.lineTo(point[0],-point[1]):roadOutline.moveTo(point[0],-point[1]));roadOutline.closePath();
  const roadGeometry=new THREE.ShapeGeometry(roadOutline),roadPositions=roadGeometry.attributes.position,roadCoordinates=roadGeometry.attributes.uv;
  for(let vertex=0;vertex<roadPositions.count;vertex++)roadCoordinates.setXY(vertex,roadPositions.getX(vertex)/5,-roadPositions.getY(vertex)/5);
  textures.asphalt.wrapS=textures.asphalt.wrapT=THREE.RepeatWrapping;textures.asphalt.needsUpdate=true;
  kit.add(roadGeometry,asphalt,[0,.007,0],[-Math.PI/2,0,0],[1,1,1],false);roadGeometry.dispose();
  kit.box([3.9,.16,9.5],[-12.85,.065,.75],stone,.025);
  kit.box([3.60,.055,9.20],[-12.85,.150,.75],colors.get('#a3b58d'),.018);
  kit.box([.13,.23,9.52],[-10.94,.084,.75],gutter,.018);
  kit.box([2.15,.06,2.10],[-12.8,.148,1.2],colors.get('#81765e'),.035);
  for(const offset of [-1.14,1.14])kit.box([.12,.13,2.30],[-12.8+offset,.185,1.2],gutter,.014);
  for(const offset of [-1.10,1.10])kit.box([2.16,.13,.12],[-12.8,.185,1.2+offset],gutter,.014);
  kit.box([3.4,.13,2.7],[-.75,.065,-6.4],colors.get('#a3b18e'),.02);
  kit.box([1.45,.05,1.45],[-.85,.145,-6.45],colors.get('#82765c'),.024);
  for(const site of sakuraSites.slice(3))kit.cylinder(.75,.77,.055,[site.origin[0],.055,site.origin[2]],colors.get('#8b836a'),24);
  kit.box([8.5,.09,6.72],[2,.01,-.7],stone);
  kit.box([10.8,.03,1.92],[1.35,.10,3.55],colors.get('#c2beb0'),.02);
  kit.box([1.50,.03,18.48],[-3.225,.07,-6.65],colors.get('#979e91'),.015);
  for (let slab = 0; slab < 26; slab++) {
    kit.box([.38, .09, .28], [-3.955 + slab * .41, .12, 4.51], gutter, .014);
    kit.box([.011, .006, 1.69], [-3.955 + slab * .41, .118, 3.63], colors.get('#a8a79d'));
  }
  for (let section = 0; section < 18; section++) {
    const centerZ = 4.01 - section * 1.1;
    kit.box([.35, .105, 1.0], [-4.12, .035, centerZ], gutter, .015);
    if (section % 5 === 1) {
      kit.box([.30, .009, .92], [-4.12, .093, centerZ], colors.get('#454e53'));
      for (let bar = 0; bar < 13; bar++) kit.box([.30, .017, .022], [-4.12, .111, centerZ - .43 + bar * .068], metal);
    }
    kit.box([.10, .01, .96], [-4.52, .008, centerZ], colors.get('#dad8c7'), .004);
  }
  for (let paving = 0; paving < 23; paving++) {
    const centerZ = paving===22?2.3675:-15.48+paving*.82;
    kit.box([1.23,.03,paving===22?.425:.79],[-3.28,.10,centerZ],colors.get(paving%3?'#b4b5a7':'#c5c1b1'),.006);
  }
  kit.cylinder(.34, .34, .018, [-6.95, -.001, 6.8], colors.get('#687477'), 32);
  for (let bar = 0; bar < 8; bar++) kit.box([.47, .006, .014], [-6.95, .012, 6.58 + bar * .059], metal);
  const stop = labelTexture([{ text: '止まれ', size: 118, y: 151 }], { width: 512, height: 256, background: '#777e87', color: '#e2dfcb', border: '#777e87' });
  placard(kit, [2.1, 1.2], [-7.0, .013, -8.4], stop, '#ffffff', [-Math.PI / 2, 0, 0]);
  kit.box([2.8,.006,.18],[-7,.018,-10.1],colors.get('#e4e0c8'));
  for (let crossingLine=0;crossingLine<6;crossingLine++) kit.box([.43,.008,3.12],[-2.8+crossingLine*.73,.012,8.35],colors.get(crossingLine%2?'#d9d5c6':'#d2d1c3'),.002);
  for (let patch=0;patch<7;patch++){
    const centerX=-1.8+patch*1.24, centerZ=6.1+Math.sin(patch*2.8)*.46;
    kit.box([.96,.004,.52],[centerX,.011,centerZ],colors.get(patch%2?'#737c86':'#7b838b'),.001,[0,.13*patch,0],false);
    kit.curve([[centerX-.4,.017,centerZ-.20],[centerX-.12,.017,centerZ-.22],[centerX+.21,.017,centerZ-.16],[centerX+.4,.017,centerZ-.14]],.0025,colors.get('#5c6674'),9,3);
  }
  kit.box([.13,.035,10],[8.4,.01,9],colors.get('#d4b581'),.006,[0,Math.PI/2,0]);
  for (let line = 0; line < 4; line++) kit.box([.11,.006,2.1],[-7.3,.012,1-line*6],colors.get('#d7d2bd'));
  const bicycleOrigin = [-3.00, .137, .65], bicycleRotation = .98, incline = .0347;
  const bicycleBounds = kit.measure(() => kit.place(bicycleOrigin,[0,bicycleRotation,incline],()=>bicycle(kit,colors,[0,0,0],0)));
  const parking = buildParking(kit, colors, [-3.00,.13,.65], bicycleRotation);
  const frontBottomY = bicycleOrigin[1] + .54*Math.sin(incline) + .35*Math.cos(incline) - .353;
  const rearBottomY = bicycleOrigin[1] - .54*Math.sin(incline) + .35*Math.cos(incline) - .353;
  if(Math.abs(frontBottomY-parking.rackTopY)>.003||Math.abs(rearBottomY-.115)>.003)throw new Error('自行车轮胎未贴合轮槽或地面');
  parking.frontTireContactError = frontBottomY-parking.rackTopY;
  parking.rearTireContactError = rearBottomY-.115;
  const wallClearance = -2.18 - bicycleBounds.max.x;
  if (wallClearance < .15) throw new Error('自行车与外墙净距不足');
  for (let stoneIndex = 0; stoneIndex < 24; stoneIndex++) {
    const angle = stoneIndex / 24 * Math.PI * 2;
    kit.box([.43, .23, .20], [9.4 + Math.cos(angle) * 1.60, .16, -.7 + Math.sin(angle) * 1.60], colors.get(stoneIndex % 2 ? '#9f9e8d' : '#aaa994'), .027, [0, -angle + Math.PI / 2, 0]);
  }
  kit.cylinder(1.54, 1.54, .07, [9.4, .045, -.7], colors.get('#897e66'), 48);
  for (let tuft = 0; tuft < 260; tuft++) {
    const angle = random() * Math.PI * 2, radius = 1.4 * Math.sqrt(random());
    const centerX = 9.4 + Math.cos(angle) * radius, centerZ = -.7 + Math.sin(angle) * radius;
    kit.rod([centerX, .075, centerZ], [centerX + .025, .15 + random() * .11, centerZ + .035], .006, colors.get(tuft % 2 ? '#93a16f' : '#9ba674'), 4);
  }
  for (let leafIndex = 0; leafIndex < 70; leafIndex++) {
    const angle = random() * Math.PI * 2, radius = 1.42 * Math.sqrt(random());
    kit.sphere([.037, .024, .035], [9.4 + Math.cos(angle) * radius, .11, -.7 + Math.sin(angle) * radius], colors.get('#e7c9d2'), 6);
  }
  for (const centerZ of [-10, -25, -44]) {
    kit.cylinder(.14, .18, 8.2, [-10.7, 4.1, centerZ], colors.get('#909697'), 16);
    kit.box([.63, .66, .52], [-10.7, 5.69, centerZ], colors.get('#7a878c'), .026);
    kit.box([2.25, .12, .13], [-10.7, 6.97, centerZ], metal, .013);
    for (const offsetX of [-.94, .94]) kit.cylinder(.075, .075, .27, [-10.7 + offsetX, 7.1, centerZ], colors.get('#d4d2c5'), 12);
    for (let strap = 0; strap < 5; strap++) kit.box([.04, .047, .11], [-10.88, .74 + strap * .14, centerZ], colors.get(strap % 2 ? '#535855' : '#d1b96e'));
  }
  for (const offsetX of [-.94, 0, .94]) kit.curve([[-10.7 + offsetX, 7.28, 4], [-10.7 + offsetX, 6.79, -4], [-10.7 + offsetX, 7.28, -10], [-10.7 + offsetX, 6.65, -17], [-10.7 + offsetX, 7.28, -25], [-10.7 + offsetX, 6.61, -34], [-10.7 + offsetX, 7.28, -44]], .011, colors.get('#505863'), 72, 4);

  house(kit, colors, [7.8, 0, -9.8], 5.4, 5.6, 4.5, '#d5d6c7', '#738288');
  house(kit, colors, [15.6, 0, -6.8], 5.7, 6.1, 4.4, '#cccfb9', '#748386');
  house(kit, colors, [23.6, 0, -8.5], 5.4, 6.5, 4.7, '#d9cfbf', '#6f858b');
  for (let fence = 0; fence < 25; fence++) {
    const centerX = 6.2 + fence * .51;
    kit.box([.055, 1.03, .07], [centerX, .5, -4.6], colors.get('#7f8875'), .014);
    kit.box([.48, .07, .10], [centerX + .22, .66, -4.6], colors.get('#8c927c'), .013);
    kit.box([.48, .07, .10], [centerX + .22, .30, -4.6], colors.get('#8c927c'), .013);
  }
  house(kit, colors, [-15.2, 0, -7.5], 5.6, 6.5, 4.5, '#bdc9bf', '#67757d');
  house(kit, colors, [-15, 0, -18.7], 6.5, 7.3, 4.8, '#ddd4c2', '#747e80');
  house(kit, colors, [3.9, 0, -21], 6.7, 6.0, 4.2, '#c6cbc0', '#668081');
  house(kit, colors, [14.4, 0, -22], 5.3, 5.7, 4.3, '#d9d3bf', '#7c827b');
  for (let home = 0; home < 15; home++) house(kit, colors, [-37 + home * 6.5, 0, -62 - home % 3 * 7], 4 + random() * 1.5, 4.5, 3.7, ['#c3d0c3','#d4d9cc','#d1d2c2'][home % 3], '#718889');
  for (const centerX of [-13.8, 8.5]) {
    kit.box([7.1, .62, .19], [centerX, .30, -4.85], colors.get('#aab3a5'), .02);
    for (let column = 0; column < 15; column++) kit.box([.025, .62, .20], [centerX - 3.45 + column * .49, .31, -4.85], colors.get('#97a18f'));
  }
  for (let bush = 0; bush < 50; bush++) {
    const centerX = -18 + random() * 40, centerZ = -12 - random() * 45;
    if (centerX > -11 && centerX < -4) continue;
    kit.sphere([.6, .65, .55], [centerX, .65, centerZ], colors.get(bush % 2 ? '#9cae86' : '#91a27e'));
  }
  for (const trackZ of [-35.2, -39.2]) {
    kit.box([120, .14, 2.6], [0, -.08, trackZ], colors.get('#939c94'));
    for (let sleeper = 0; sleeper < 165; sleeper++) kit.box([.17, .10, 1.8], [-60 + sleeper * .72, .012, trackZ], colors.get('#8a887b'), .01);
    for (const offsetZ of [-.55, .55]) kit.box([120, .10, .045], [0, .07, trackZ + offsetZ], colors.get('#8f9893'));
  }
  const train = colors.get('#d7d9ca');
  for (let car = 0; car < 2; car++) {
    const centerX = 5.9 + car * 12.6;
    kit.box([12.3, 2.7, 2.6], [centerX, 1.72, -39.2], train, .18);
    kit.box([12.35, .23, 2.62], [centerX, 1.43, -39.2], colors.get('#b8c5b4'), .02);
    kit.box([12.35, .09, 2.63], [centerX, 1.60, -39.2], colors.get('#c5a1ac'));
    for (let windowIndex = 0; windowIndex < 9; windowIndex++) {
      kit.box([.76, .98, .021], [centerX - 5.1 + windowIndex * 1.24, 2.16, -37.888], colors.get('#87a9b1'), .045);
      kit.box([.023, .95, .028], [centerX - 5.1 + windowIndex * 1.24, 2.16, -37.86], colors.get('#c2cbbd'));
    }
    kit.box([11.8, .19, 2.5], [centerX, 3.13, -39.2], colors.get('#a4b5b1'), .075);
    for (const offsetX of [-4.2, 4.2]) kit.box([1.9, .35, 2.0], [centerX + offsetX, .28, -39.2], colors.get('#616d71'), .07);
  }
  for (let post = 0; post < 12; post++) {
    const centerX = -40 + post * 8;
    kit.cylinder(.075, .075, 6.5, [centerX, 3.25, -42], metal, 10);
    kit.box([.09, .09, 6.0], [centerX, 6.4, -39.5], metal);
  }
  kit.rod([-55, 5.6, -35.2], [62, 5.6, -35.2], .012, metal, 4);
  kit.rod([-55, 5.6, -39.2], [62, 5.6, -39.2], .012, metal, 4);

  for (let ridge = 0; ridge < 3; ridge++) {
    const outline = new THREE.Shape();
    outline.moveTo(-180, -.5);
    for (let step = 0; step <= 60; step++) {
      const centerX = -180 + step * 6;
      const peak = 8 + ridge * 5 + Math.sin(step * .31 + ridge) * 3 + Math.sin(step * .67 + ridge * 2) * 1.7 + Math.exp(-Math.pow((centerX - 22) / 44, 2)) * (13 + ridge * 2);
      outline.lineTo(centerX, peak);
    }
    outline.lineTo(180, -.5); outline.closePath();
    kit.add(new THREE.ExtrudeGeometry(outline,{depth:2,bevelEnabled:false}),colors.get(['#9eafa3','#a8bdb3','#b5c8c2'][ridge]),[0,0,-109-ridge*25]);
  }
  for (let tree=0;tree<65;tree++) {
    const centerX=-85+tree*3.1, centerZ=-86-tree%4*4;
    const height=3+random()*4;
    kit.cylinder(.012,.85+random()*.3,height,[centerX,height*.5,centerZ],colors.get(tree%2?'#92a78b':'#9caf99'),8);
  }
  const canopyShadow = new THREE.MeshBasicMaterial({ map: textures.canopyShadow, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
  kit.add(new THREE.PlaneGeometry(11, 9), canopyShadow, [7.5, .09, .8], [-Math.PI / 2, 0, .4], [1, 1, 1], false);
  kit.add(new THREE.PlaneGeometry(9, 7), canopyShadow, [-11,.20,1.5], [-Math.PI / 2, 0, -.8], [1, 1, 1], false);
  const treeSites=sakuraSites.map(site=>{
    const trunkRadius=.35*site.scale,laneDistance=site.origin[0]<-7.5?-10.8-site.origin[0]:site.origin[0]+4.2;
    const clearance=laneDistance-trunkRadius;
    const rootClearance=laneDistance-.74*site.scale;
    if(clearance<.4||rootClearance<.4)throw new Error('樱花树干或树根侵入车道');
    return {site:site.site,origin:site.origin,trunkRoadClearance:clearance,rootRoadClearance:rootClearance};
  });
  return { bicycleBounds: { min: bicycleBounds.min.toArray(), max: bicycleBounds.max.toArray() }, bicycleWallClearance: wallClearance, parking,treeSites,street:{surface:'continuous asphalt with world-scale grain',frontRoadStart:4.65,sideRoadEdges:[-10.8,-4.2],sidewalk:'L-shaped cafe frontage only',convexMirrors:0} };
}
