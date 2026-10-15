import { Kit, palette } from './kit.js';
import { makeTextures } from './textures.js';
import { buildCafe } from './architecture.js';
import { buildEnvironment,sakuraSites } from './environment.js';
import { makeSakura, makePetals } from './trees.js';
import { addDetails } from './details.js';
import { buildRoom } from './room.js';
import { shadeRoom, addCafeLighting } from './room-light.js';
import { makeArtTextures, buildWallArt } from './art.js';

export async function createWorld(scene, progress) {
  const kit = new Kit(scene);
  const colors = palette();
  const textures = makeTextures();
  progress('绘制木纹、花瓣与店牌');
  await new Promise(resolve => requestAnimationFrame(resolve));
  const buildingCollision=buildCafe(kit, colors, textures);
  const details=addDetails(kit, colors, textures);
  const room = buildRoom(kit,colors,textures);
  const fixtures=addCafeLighting(kit,colors);
  const art=buildWallArt(kit,colors,makeArtTextures());
  progress('搭建屋檐、窗洞与室内');
  await new Promise(resolve => requestAnimationFrame(resolve));
  const placement = buildEnvironment(kit, colors, textures);
  progress('铺设街角、铁路与生活物件');
  await new Promise(resolve => requestAnimationFrame(resolve));
  const trees=sakuraSites.map(site=>makeSakura(kit,colors,textures,site.origin,site.scale,site.seed));
  const updatePetals = makePetals(scene, colors, trees,buildingCollision);
  const report = kit.finish();
  report.room = room;
  report.entranceGarden=buildingCollision.userData.entranceGarden;
  report.art=art;
  Object.assign(report,details);
  report.roomLight = {...shadeRoom(scene),...fixtures};
  Object.assign(report, placement);
  report.flowerCards = 0;
  report.blossoms = trees.reduce((count, tree) => count + tree.blossoms, 0);
  report.flowerInstances = trees.reduce((count, tree) => count + tree.flowerInstances, 0);
  report.flowerTriangles = trees.reduce((count, tree) => count + tree.flowerTriangles, 0);
  report.shadowFlowerTriangles = trees.reduce((count, tree) => count + tree.shadowFlowerTriangles, 0);
  report.attachmentCurves=trees.reduce((count,tree)=>count+tree.attachmentCurves,0);
  report.pedicelTriangles=trees.reduce((count,tree)=>count+tree.pedicelTriangles,0);
  report.petals=updatePetals.report;
  return {
    report, update: updatePetals,
    updateDetail(camera, height) {
      const levels = trees.map(tree => tree.updateDetail(camera,height));
      report.activeFlowerTriangles = levels.reduce((sum,level)=>sum+level.triangles,0);
      report.flowerLevels = levels.reduce((sum,level)=>sum.map((value,index)=>value+level.counts[index]),[0,0,0]);
    },
  };
}

