import { canvasTexture, labelTexture, seeded } from './kit.js';
import * as THREE from 'three';

export function makeTextures() {
  const random = seeded(29103);
  const plaster = canvasTexture(512, 512, painter => {
    painter.fillStyle = '#e1dbce';
    painter.fillRect(0, 0, 512, 512);
    for (let stroke = 0; stroke < 3400; stroke++) {
      painter.fillStyle = random() > .5 ? 'rgba(255,255,245,.035)' : 'rgba(72,74,74,.023)';
      painter.fillRect(random() * 512, random() * 512, 2 + random() * 30, 1 + random() * 4);
    }
  });
  const wood = canvasTexture(256, 1024, painter => {
    painter.fillStyle = '#92705b';
    painter.fillRect(0, 0, 256, 1024);
    for (let stroke = 0; stroke < 170; stroke++) {
      const column = random() * 256;
      painter.strokeStyle = `rgba(${random() > .5 ? '36,23,18' : '215,193,149'},${.04 + random() * .07})`;
      painter.lineWidth = .3 + random() * 1.1;
      painter.beginPath();
      painter.moveTo(column, 0);
      for (let step = 0; step < 9; step++) painter.lineTo(column + Math.sin(step + stroke) * 3, step * 150);
      painter.stroke();
    }
  });
  const asphalt = canvasTexture(1024, 1024, painter => {
    painter.fillStyle = '#777e87';
    painter.fillRect(0, 0, 1024, 1024);
    for (let grain = 0; grain < 14000; grain++) {
      painter.fillStyle = random() > .4 ? 'rgba(239,233,220,.05)' : 'rgba(39,41,56,.05)';
      painter.fillRect(random() * 1024, random() * 1024, 1.2, 1.2);
    }
    for (let crack = 0; crack < 12; crack++) {
      painter.strokeStyle = 'rgba(47,49,60,.17)';
      painter.lineWidth = .5;
      const start = random() * 1024, base = random() * 1024;
      painter.beginPath(); painter.moveTo(start, base);
      for (let step = 0; step < 10; step++) painter.lineTo(start + step * 14, base + (random() - .5) * 20);
      painter.stroke();
    }
  });
  const leaf = canvasTexture(128, 256, painter => {
    painter.fillStyle = '#b5bb71'; painter.beginPath(); painter.moveTo(64, 10); painter.bezierCurveTo(10, 74, 22, 185, 64, 244); painter.bezierCurveTo(108, 187, 120, 73, 64, 10); painter.fill();
    painter.strokeStyle = '#778a57'; painter.lineWidth = 2; painter.beginPath(); painter.moveTo(64, 20); painter.lineTo(64, 237); painter.stroke();
    for (let vein = 1; vein < 9; vein++) { painter.beginPath(); painter.moveTo(64, vein * 24); painter.lineTo(64 + (vein % 2 ? -30 : 30), vein * 24 + 24); painter.stroke(); }
  });
  const canopyShadow = canvasTexture(512, 512, painter => {
    for (let leafIndex = 0; leafIndex < 180; leafIndex++) {
      const angle = random() * Math.PI * 2, distance = Math.sqrt(random()) * 220;
      const centerX = 256 + Math.cos(angle) * distance, centerY = 256 + Math.sin(angle) * distance;
      const gradient = painter.createRadialGradient(centerX, centerY, 0, centerX, centerY, 10 + random() * 13);
      gradient.addColorStop(0, 'rgba(35,43,74,.16)'); gradient.addColorStop(.65, 'rgba(35,43,74,.08)'); gradient.addColorStop(1, 'rgba(35,43,74,0)');
      painter.fillStyle = gradient; painter.fillRect(centerX - 25, centerY - 25, 50, 50);
    }
  });
  const menu = labelTexture([{ text: '春の喫茶', size: 58, y: 80 }, { text: '桜クリームソーダ　650', size: 36, y: 160 }, { text: '苺のショートケーキ　520', size: 33, y: 230 }, { text: '自家焙煎珈琲　480', size: 36, y: 300 }, { text: '窓辺の席、あいています', size: 26, y: 393 }], { width: 480, height: 460, background: '#31434a', color: '#f0e4c8', border: '#b4b998' });
  const sign = labelTexture([{ text: '喫茶　木漏れ日', size: 118, y: 155, weight: 600 }, { text: '自家焙煎珈琲 と 手づくりのケーキ', size: 32, y: 207 }], { width: 1424, height: 260, background: '#e9e2ce', border: '#a2946e' });
  const noren = ['珈', '琲'].map(text => labelTexture([{ text, size: 118, y: 156 }], { width: 290, height: 210, background: '#687e80', color: '#e6dfcf', border: '#687e80' }));
  const reflections = new THREE.CubeTexture(Array.from({length:6},(_,face)=>canvasTexture(128,128,painter=>{
    const gradient=painter.createLinearGradient(0,0,0,128);
    gradient.addColorStop(0,face===2?'#e1d9c3':'#a1bcc7');gradient.addColorStop(.52,'#d6d8c5');gradient.addColorStop(1,'#697b69');
    painter.fillStyle=gradient;painter.fillRect(0,0,128,128);
    if(face!==2&&face!==3) {
      painter.fillStyle='#ede9d6';painter.fillRect(26,20,72,72);
      painter.fillStyle='#74868a';painter.fillRect(61,20,4,72);painter.fillRect(26,54,72,4);
    }
  }).image));
  reflections.colorSpace=THREE.SRGBColorSpace;reflections.needsUpdate=true;
  return { plaster, wood, asphalt, leaf, canopyShadow, menu, sign, noren, reflections };
}
