import { Product } from '../types';

export interface FittingAdjustments {
  scale: number;        // 0.8 to 1.3
  offsetX: number;      // -50 to 50 px
  offsetY: number;      // -50 to 50 px
  blendStrength: number;// 0.8 to 1.0
}

/**
 * Loads an image URL or Data URL safely
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback: create mock image if CORS issues
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = (e) => reject(e);
      fallback.src = src;
    };
    img.src = src;
  });
}

/**
 * Composites any selected fashion garments & accessories realistically onto the user's uploaded photo
 */
export async function compositeVirtualTryOn(
  baseImageUrl: string,
  selectedProducts: Product[],
  adjustments: FittingAdjustments = { scale: 1.0, offsetX: 0, offsetY: 0, blendStrength: 0.95 }
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Load user image
  const baseImg = await loadImage(baseImageUrl);
  const width = baseImg.naturalWidth || 800;
  const height = baseImg.naturalHeight || 1066;

  canvas.width = width;
  canvas.height = height;

  // 1. Draw user's actual photo in full resolution
  ctx.drawImage(baseImg, 0, 0, width, height);

  // Proportional body anchoring points based on human anatomy in canvas dimensions
  const centerX = width * 0.5 + adjustments.offsetX;
  const headY = height * 0.16 + adjustments.offsetY;
  const eyeY = height * 0.22 + adjustments.offsetY;
  const earY = height * 0.24 + adjustments.offsetY;
  const neckY = height * 0.30 + adjustments.offsetY;
  const chestY = height * 0.38 + adjustments.offsetY;
  const waistY = height * 0.52 + adjustments.offsetY;
  const hipsY = height * 0.62 + adjustments.offsetY;
  const wristX = centerX + 88 * (width / 400) * adjustments.scale;
  const wristY = height * 0.58 + adjustments.offsetY;
  const handX = centerX + 96 * (width / 400) * adjustments.scale;
  const handY = height * 0.65 + adjustments.offsetY;
  const anklesY = height * 0.84 + adjustments.offsetY;
  const feetY = height * 0.91 + adjustments.offsetY;
  const bodyScale = (width / 400) * adjustments.scale;

  // Sort products to wear in realistic clothing hierarchy:
  // Underwear first, then Bottoms/Skirts, then Dresses, then Tops, Belts, Outerwear, Shoes, Bags, Jewelry, Eyewear, Hats
  const productOrder: Record<string, number> = {
    underwear: 0,
    socks: 1,
    pants: 2,
    skirts: 2,
    dresses: 2.5,
    tops: 3,
    belts: 4,
    outerwear: 5,
    shoes: 6,
    bags: 7,
    jewelry: 8,
    eyewear: 9,
    hats: 10,
    accessories: 11
  };

  const sortedProducts = [...selectedProducts].sort((a, b) => {
    const orderA = productOrder[a.category] !== undefined ? productOrder[a.category] : 3;
    const orderB = productOrder[b.category] !== undefined ? productOrder[b.category] : 3;
    return orderA - orderB;
  });

  // Render each garment/accessory onto the user's photo
  for (const prod of sortedProducts) {
    ctx.save();
    const alpha = adjustments.blendStrength;

    switch (prod.category) {
      case 'hats':
        drawHat(ctx, centerX, headY, bodyScale, alpha, prod);
        break;

      case 'eyewear':
        drawEyewear(ctx, centerX, eyeY, bodyScale, alpha, prod);
        break;

      case 'jewelry':
        if (prod.name.includes('ต่างหู') || prod.name.includes('ตุ้มหู') || prod.id.includes('ear')) {
          drawEarrings(ctx, centerX, earY, bodyScale, alpha, prod);
        } else if (prod.name.includes('สร้อยคอ') || prod.name.includes('มุก') || prod.id.includes('neck')) {
          drawNecklace(ctx, centerX, neckY, bodyScale, alpha, prod);
        } else if (prod.name.includes('กำไล') || prod.name.includes('สายรัดข้อมือ') || prod.id.includes('bra')) {
          drawBracelet(ctx, wristX, wristY, bodyScale, alpha, prod);
        } else if (prod.name.includes('แหวน') || prod.id.includes('ring')) {
          drawRing(ctx, handX, handY, bodyScale, alpha, prod);
        } else {
          drawNecklace(ctx, centerX, neckY, bodyScale, alpha, prod);
        }
        break;

      case 'dresses':
        drawDress(ctx, centerX, chestY, bodyScale, alpha, prod);
        break;

      case 'tops':
        if (prod.id === 'prod-2' || prod.name.includes('แขนพอง')) {
          drawPuffSleeveKnit(ctx, centerX, chestY, bodyScale, alpha);
        } else if (prod.id === 'prod-3' || prod.name.includes('คอกลม')) {
          drawBlackCropTee(ctx, centerX, chestY, bodyScale, alpha);
        } else if (prod.id === 'prod-4' || prod.name.includes('โอลีฟ')) {
          drawOliveShirt(ctx, centerX, chestY, bodyScale, alpha);
        } else if (prod.name.includes('ออกซ์ฟอร์ด') || prod.name.includes('เชิ้ต')) {
          drawOxfordShirt(ctx, centerX, chestY, bodyScale, alpha, prod);
        } else if (prod.name.includes('เบลาส์')) {
          drawChiffonBlouse(ctx, centerX, chestY, bodyScale, alpha, prod);
        } else if (prod.name.includes('โปโล')) {
          drawPoloShirt(ctx, centerX, chestY, bodyScale, alpha, prod);
        } else if (prod.name.includes('แคชเมียร์') || prod.name.includes('สเวตเตอร์')) {
          drawCashmereTurtleneck(ctx, centerX, chestY, bodyScale, alpha, prod);
        } else {
          drawBlackCropTee(ctx, centerX, chestY, bodyScale, alpha);
        }
        break;

      case 'outerwear':
        if (prod.id === 'prod-5' || prod.name.includes('เทรนช์')) {
          drawTrenchCoat(ctx, centerX, chestY - 15 * bodyScale, bodyScale, alpha);
        } else if (prod.id === 'prod-7' || prod.name.includes('สูท') || prod.name.includes('เบลเซอร์')) {
          drawWoolBlazer(ctx, centerX, chestY, bodyScale, alpha);
        } else {
          drawWoolBlazer(ctx, centerX, chestY, bodyScale, alpha);
        }
        break;

      case 'belts':
        drawBelt(ctx, centerX, waistY, bodyScale, alpha, prod);
        break;

      case 'pants':
        if (prod.id === 'prod-1' || prod.name.includes('ลินิน')) {
          drawLinenShorts(ctx, centerX, waistY, bodyScale, alpha);
        } else if (prod.id === 'prod-6' || prod.name.includes('ยีนส์')) {
          drawDenimJeans(ctx, centerX, waistY, bodyScale, alpha);
        } else if (prod.name.includes('สแล็ค')) {
          drawTailoredSlacks(ctx, centerX, waistY, bodyScale, alpha, prod);
        } else if (prod.name.includes('คาร์โก้')) {
          drawCargoPants(ctx, centerX, waistY, bodyScale, alpha, prod);
        } else {
          drawLinenShorts(ctx, centerX, waistY, bodyScale, alpha);
        }
        break;

      case 'skirts':
        drawSkirt(ctx, centerX, waistY, bodyScale, alpha, prod);
        break;

      case 'socks':
        drawSocks(ctx, centerX, anklesY, bodyScale, alpha, prod);
        break;

      case 'shoes':
        drawShoes(ctx, centerX, feetY, bodyScale, alpha, prod);
        break;

      case 'underwear':
        if (prod.name.includes('กางเกง') || prod.name.includes('บ็อกเซอร์') || prod.name.includes('ซีมเลส') || prod.id.includes('und')) {
          drawUnderwearBottom(ctx, centerX, hipsY, bodyScale, alpha, prod);
        } else {
          drawUnderwearTop(ctx, centerX, chestY, bodyScale, alpha, prod);
        }
        break;

      case 'bags':
        drawLeatherBag(ctx, centerX + 90 * bodyScale, waistY + 15 * bodyScale, bodyScale, alpha);
        break;

      default:
        drawBlackCropTee(ctx, centerX, chestY, bodyScale, alpha);
        break;
    }

    ctx.restore();
  }

  // Return composited image as Data URL
  return canvas.toDataURL('image/png', 0.95);
}

// -------------------------------------------------------------
// HELPER SHADOW UTILITIES
// -------------------------------------------------------------

function applyGarmentShadow(ctx: CanvasRenderingContext2D, blur = 14) {
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = 4;
}

function clearShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

// -------------------------------------------------------------
// REALISTIC GARMENT & ACCESSORY RENDERING FUNCTIONS
// -------------------------------------------------------------

/**
 * 1. หมวก (Hats)
 */
function drawHat(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 15 * scale);

  const isCap = prod.name.includes('แก๊ป');
  const isBeret = prod.name.includes('เบเร่ต์');
  const isBeanie = prod.name.includes('บีนนี่');

  if (isCap) {
    // Baseball Cap
    const grad = ctx.createLinearGradient(cx - 50 * scale, cy, cx + 50 * scale, cy);
    grad.addColorStop(0, '#1c1f24');
    grad.addColorStop(1, '#0c0e10');

    // Crown
    ctx.beginPath();
    ctx.ellipse(cx, cy, 48 * scale, 34 * scale, 0, Math.PI, 0, true);
    ctx.fillStyle = grad;
    ctx.fill();

    // Visor Brim
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2 * scale, 58 * scale, 14 * scale, 0, 0, Math.PI);
    ctx.fillStyle = '#14161a';
    ctx.fill();

    // ISARA gold embroidery
    ctx.fillStyle = '#dfa24b';
    ctx.font = `bold ${8 * scale}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ISARA', cx, cy - 10 * scale);
  } else if (isBeret) {
    // French Wool Beret
    const grad = ctx.createRadialGradient(cx, cy - 8 * scale, 5 * scale, cx, cy, 60 * scale);
    grad.addColorStop(0, '#4a151b');
    grad.addColorStop(1, '#1f080b');

    ctx.beginPath();
    ctx.ellipse(cx + 8 * scale, cy - 6 * scale, 58 * scale, 28 * scale, 0.15, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Little stalk on top
    ctx.beginPath();
    ctx.arc(cx + 8 * scale, cy - 32 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#1f080b';
    ctx.fill();
  } else if (isBeanie) {
    // Kids / Winter Beanie
    const grad = ctx.createLinearGradient(cx - 40 * scale, cy, cx + 40 * scale, cy);
    grad.addColorStop(0, '#e5d1b3');
    grad.addColorStop(1, '#c5b090');

    ctx.beginPath();
    ctx.ellipse(cx, cy - 4 * scale, 45 * scale, 38 * scale, 0, Math.PI, 0, true);
    ctx.fillStyle = grad;
    ctx.fill();

    // Cute bear ears
    ctx.beginPath();
    ctx.arc(cx - 32 * scale, cy - 36 * scale, 12 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 32 * scale, cy - 36 * scale, 12 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#b89f7a';
    ctx.fill();
  } else {
    // Panama / Fedora / Sunhat
    const grad = ctx.createLinearGradient(cx - 70 * scale, cy, cx + 70 * scale, cy);
    grad.addColorStop(0, '#EAE1CE');
    grad.addColorStop(0.5, '#D5C7AC');
    grad.addColorStop(1, '#C2B091');

    // Wide brim
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8 * scale, 76 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Crown
    ctx.beginPath();
    ctx.moveTo(cx - 44 * scale, cy + 8 * scale);
    ctx.quadraticCurveTo(cx - 40 * scale, cy - 38 * scale, cx - 24 * scale, cy - 44 * scale);
    ctx.quadraticCurveTo(cx, cy - 38 * scale, cx + 24 * scale, cy - 44 * scale);
    ctx.quadraticCurveTo(cx + 40 * scale, cy - 38 * scale, cx + 44 * scale, cy + 8 * scale);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Black luxury band ribbon
    ctx.beginPath();
    ctx.moveTo(cx - 43 * scale, cy + 2 * scale);
    ctx.quadraticCurveTo(cx, cy + 6 * scale, cx + 43 * scale, cy + 2 * scale);
    ctx.lineTo(cx + 42 * scale, cy - 6 * scale);
    ctx.quadraticCurveTo(cx, cy - 2 * scale, cx - 42 * scale, cy - 6 * scale);
    ctx.closePath();
    ctx.fillStyle = '#1a1816';
    ctx.fill();
  }

  ctx.restore();
}

/**
 * 2. แว่นตา (Eyewear)
 */
function drawEyewear(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 10 * scale);

  const isCatEye = prod.name.includes('Cat-Eye');
  const w = 26 * scale;
  const h = 18 * scale;
  const bridge = 8 * scale;

  // Lenses gradient
  const lensGrad = ctx.createLinearGradient(cx, cy - h, cx, cy + h);
  lensGrad.addColorStop(0, 'rgba(40, 30, 20, 0.95)');
  lensGrad.addColorStop(1, 'rgba(120, 90, 50, 0.65)');

  // Left Rim
  ctx.beginPath();
  if (isCatEye) {
    ctx.moveTo(cx - bridge - w * 2, cy - h * 1.2);
    ctx.lineTo(cx - bridge, cy - h * 0.7);
    ctx.quadraticCurveTo(cx - bridge, cy + h, cx - bridge - w, cy + h);
    ctx.quadraticCurveTo(cx - bridge - w * 2, cy + h * 0.5, cx - bridge - w * 2, cy - h * 1.2);
  } else {
    ctx.ellipse(cx - bridge - w, cy, w, h, 0, 0, Math.PI * 2);
  }
  ctx.fillStyle = lensGrad;
  ctx.fill();
  ctx.lineWidth = 2.5 * scale;
  ctx.strokeStyle = '#dfa24b';
  ctx.stroke();

  // Right Rim
  ctx.beginPath();
  if (isCatEye) {
    ctx.moveTo(cx + bridge + w * 2, cy - h * 1.2);
    ctx.lineTo(cx + bridge, cy - h * 0.7);
    ctx.quadraticCurveTo(cx + bridge, cy + h, cx + bridge + w, cy + h);
    ctx.quadraticCurveTo(cx + bridge + w * 2, cy + h * 0.5, cx + bridge + w * 2, cy - h * 1.2);
  } else {
    ctx.ellipse(cx + bridge + w, cy, w, h, 0, 0, Math.PI * 2);
  }
  ctx.fillStyle = lensGrad;
  ctx.fill();
  ctx.stroke();

  // Bridge
  ctx.beginPath();
  ctx.moveTo(cx - bridge, cy - 2 * scale);
  ctx.quadraticCurveTo(cx, cy - 6 * scale, cx + bridge, cy - 2 * scale);
  ctx.stroke();

  // Specular Reflection glint
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - bridge - w * 1.4, cy - h * 0.6);
  ctx.lineTo(cx - bridge - w * 0.6, cy + h * 0.4);
  ctx.stroke();

  ctx.restore();
}

/**
 * 3. ต่างหู (Earrings)
 */
function drawEarrings(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 8 * scale);

  const leftEarX = cx - 58 * scale;
  const rightEarX = cx + 58 * scale;
  const earY = cy + 4 * scale;

  [leftEarX, rightEarX].forEach((x) => {
    if (prod.name.includes('ห่วง')) {
      // Gold Hoops
      ctx.beginPath();
      ctx.arc(x, earY + 12 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = '#e6c888';
      ctx.stroke();
    } else if (prod.name.includes('มุก')) {
      // South Sea Pearl Drop
      ctx.beginPath();
      ctx.moveTo(x, earY);
      ctx.lineTo(x, earY + 8 * scale);
      ctx.strokeStyle = '#dfa24b';
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, earY + 14 * scale, 6 * scale, 0, Math.PI * 2);
      const pearlGrad = ctx.createRadialGradient(x - 2, earY + 12 * scale, 1, x, earY + 14 * scale, 6 * scale);
      pearlGrad.addColorStop(0, '#ffffff');
      pearlGrad.addColorStop(0.7, '#f7ede1');
      pearlGrad.addColorStop(1, '#d8c2aa');
      ctx.fillStyle = pearlGrad;
      ctx.fill();
    } else {
      // Sparkling Crystal Chandelier
      ctx.beginPath();
      ctx.moveTo(x, earY);
      ctx.lineTo(x - 6 * scale, earY + 18 * scale);
      ctx.lineTo(x, earY + 24 * scale);
      ctx.lineTo(x + 6 * scale, earY + 18 * scale);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#cbb592';
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();
    }
  });

  ctx.restore();
}

/**
 * 4. สร้อยคอ (Necklaces)
 */
function drawNecklace(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 10 * scale);

  const w = 48 * scale;
  const drop = 36 * scale;

  if (prod.name.includes('มุก')) {
    // Pearl Strand
    ctx.lineWidth = 2 * scale;
    ctx.strokeStyle = '#f4eee4';
    const totalPearls = 19;
    for (let i = 0; i <= totalPearls; i++) {
      const t = (i / totalPearls) * Math.PI;
      const px = cx + Math.cos(t) * w;
      const py = cy + Math.sin(t) * drop;
      ctx.beginPath();
      ctx.arc(px, py, 3.5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#f8f4ed';
      ctx.fill();
      ctx.strokeStyle = '#c5b59f';
      ctx.stroke();
    }
  } else if (prod.name.includes('Cuban') || prod.name.includes('โซ่')) {
    // Street Cuban Chain
    ctx.beginPath();
    ctx.ellipse(cx, cy + drop * 0.4, w * 0.9, drop * 0.8, 0, 0, Math.PI);
    ctx.lineWidth = 6 * scale;
    ctx.strokeStyle = '#c8ced4';
    ctx.stroke();
  } else {
    // 18K Gold Chain with ISARA Pendant
    ctx.beginPath();
    ctx.ellipse(cx, cy + drop * 0.4, w, drop * 0.85, 0, 0, Math.PI);
    ctx.lineWidth = 2 * scale;
    ctx.strokeStyle = '#dfa24b';
    ctx.stroke();

    // Central Emblem Pendant
    const pY = cy + drop * 1.25;
    ctx.beginPath();
    ctx.arc(cx, pY, 7 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#dfa24b';
    ctx.fill();

    // Sparkling CZ stone
    ctx.beginPath();
    ctx.arc(cx, pY, 3.5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  ctx.restore();
}

/**
 * 5. กำไล (Bracelets / Bangles)
 */
function drawBracelet(ctx: CanvasRenderingContext2D, wx: number, wy: number, scale: number, alpha: number, prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 8 * scale);

  ctx.beginPath();
  ctx.ellipse(wx, wy, 16 * scale, 7 * scale, 0.3, 0, Math.PI * 2);
  ctx.lineWidth = 5 * scale;

  if (prod.name.includes('หยก')) {
    ctx.strokeStyle = '#2d6a4f';
  } else if (prod.name.includes('เงิน')) {
    ctx.strokeStyle = '#d0d6dc';
  } else {
    ctx.strokeStyle = '#dfa24b';
  }
  ctx.stroke();

  ctx.restore();
}

/**
 * 6. แหวน (Rings)
 */
function drawRing(ctx: CanvasRenderingContext2D, hx: number, hy: number, scale: number, alpha: number, prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 6 * scale);

  ctx.beginPath();
  ctx.ellipse(hx, hy, 7 * scale, 3.5 * scale, 0.2, 0, Math.PI * 2);
  ctx.lineWidth = 3 * scale;
  ctx.strokeStyle = '#dfa24b';
  ctx.stroke();

  // Gemstone
  ctx.beginPath();
  ctx.arc(hx - 2 * scale, hy - 4 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.fillStyle = prod.name.includes('ทับทิม') ? '#b5179e' : '#ffffff';
  ctx.fill();

  ctx.restore();
}

/**
 * 7. ชุดเดรส (Dresses)
 */
function drawDress(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 18 * scale);

  const topY = cy - 20 * scale;
  const bottomY = cy + 180 * scale;
  const w = 115 * scale;

  const grad = ctx.createLinearGradient(cx - w, topY, cx + w, bottomY);
  if (prod.name.includes('ไหมไทย')) {
    grad.addColorStop(0, '#2d1436');
    grad.addColorStop(0.5, '#481d59');
    grad.addColorStop(1, '#1b0a22');
  } else if (prod.name.includes('เจ้าหญิง')) {
    grad.addColorStop(0, '#f9c5d1');
    grad.addColorStop(0.5, '#f48ca5');
    grad.addColorStop(1, '#f9c5d1');
  } else {
    // Luxury Satin Evening Gown
    grad.addColorStop(0, '#102d20');
    grad.addColorStop(0.4, '#1b4a35');
    grad.addColorStop(0.7, '#133927');
    grad.addColorStop(1, '#091c13');
  }

  // Bodice and Flowing Gown silhouette
  ctx.beginPath();
  ctx.moveTo(cx - 36 * scale, topY);
  ctx.quadraticCurveTo(cx, topY + 12 * scale, cx + 36 * scale, topY); // neckline
  ctx.lineTo(cx + 62 * scale, topY + 45 * scale); // right bust
  ctx.quadraticCurveTo(cx + 42 * scale, topY + 90 * scale, cx + 52 * scale, topY + 120 * scale); // waist
  ctx.quadraticCurveTo(cx + w, bottomY - 30 * scale, cx + w * 0.9, bottomY); // flare hem
  ctx.lineTo(cx - w * 0.9, bottomY);
  ctx.quadraticCurveTo(cx - w, bottomY - 30 * scale, cx - 52 * scale, topY + 120 * scale);
  ctx.quadraticCurveTo(cx - 42 * scale, topY + 90 * scale, cx - 62 * scale, topY + 45 * scale);
  ctx.closePath();

  ctx.fillStyle = grad;
  ctx.fill();

  // Satin Sheen Highlights
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - 15 * scale, topY + 30 * scale);
  ctx.quadraticCurveTo(cx - 20 * scale, bottomY - 50 * scale, cx - 40 * scale, bottomY - 10 * scale);
  ctx.stroke();

  ctx.restore();
}

/**
 * 8. เสื้อเชิ้ตออกซ์ฟอร์ด (Oxford Shirt)
 */
function drawOxfordShirt(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, _prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 16 * scale);

  const topY = cy - 25 * scale;
  const w = 120 * scale;
  const h = 135 * scale;

  // Crisp White Fabric
  const grad = ctx.createLinearGradient(cx - w, topY, cx + w, topY + h);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.5, '#F3F4F6');
  grad.addColorStop(1, '#E5E7EB');

  ctx.beginPath();
  ctx.moveTo(cx - 32 * scale, topY);
  ctx.lineTo(cx + 32 * scale, topY);
  ctx.lineTo(cx + w, topY + 35 * scale);
  ctx.lineTo(cx + w * 0.8, topY + 60 * scale);
  ctx.lineTo(cx + 65 * scale, topY + 50 * scale);
  ctx.lineTo(cx + 60 * scale, topY + h);
  ctx.lineTo(cx - 60 * scale, topY + h);
  ctx.lineTo(cx - 65 * scale, topY + 50 * scale);
  ctx.lineTo(cx - w * 0.8, topY + 60 * scale);
  ctx.lineTo(cx - w, topY + 35 * scale);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  clearShadow(ctx);

  // Button placket
  ctx.strokeStyle = 'rgba(180, 190, 200, 0.6)';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx, topY + h);
  ctx.stroke();

  // Pearl buttons
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(cx, topY + i * 22 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#d1d5db';
    ctx.stroke();
  }

  // Collar flaps
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx - 30 * scale, topY);
  ctx.lineTo(cx - 5 * scale, topY + 22 * scale);
  ctx.lineTo(cx, topY + 6 * scale);
  ctx.lineTo(cx + 5 * scale, topY + 22 * scale);
  ctx.lineTo(cx + 30 * scale, topY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#e5e7eb';
  ctx.stroke();

  ctx.restore();
}

/**
 * 8b. เสื้อเบลาส์ชีฟอง (Chiffon Blouse)
 */
function drawChiffonBlouse(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, _prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 14 * scale);

  const topY = cy - 20 * scale;
  const w = 115 * scale;
  const h = 120 * scale;

  const grad = ctx.createLinearGradient(cx - w, topY, cx + w, topY + h);
  grad.addColorStop(0, '#fef9ee');
  grad.addColorStop(0.5, '#faebd0');
  grad.addColorStop(1, '#f1deb8');

  ctx.beginPath();
  ctx.ellipse(cx, cy + 40 * scale, w * 0.7, h * 0.65, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Chiffon bow tie at collar
  ctx.fillStyle = '#e8d2a6';
  ctx.beginPath();
  ctx.ellipse(cx - 16 * scale, topY + 12 * scale, 14 * scale, 8 * scale, -0.4, 0, Math.PI * 2);
  ctx.ellipse(cx + 16 * scale, topY + 12 * scale, 14 * scale, 8 * scale, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 8c. เสื้อโปโล (Polo Shirt)
 */
function drawPoloShirt(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, _prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 14 * scale);

  const topY = cy - 20 * scale;
  const w = 115 * scale;
  const h = 130 * scale;

  const grad = ctx.createLinearGradient(cx - w, topY, cx + w, topY + h);
  grad.addColorStop(0, '#1a3a2a');
  grad.addColorStop(1, '#0e2419');

  ctx.beginPath();
  ctx.moveTo(cx - 28 * scale, topY);
  ctx.lineTo(cx + 28 * scale, topY);
  ctx.lineTo(cx + w, topY + 35 * scale);
  ctx.lineTo(cx + w * 0.8, topY + 65 * scale);
  ctx.lineTo(cx + 60 * scale, topY + 55 * scale);
  ctx.lineTo(cx + 58 * scale, topY + h);
  ctx.lineTo(cx - 58 * scale, topY + h);
  ctx.lineTo(cx - 60 * scale, topY + 55 * scale);
  ctx.lineTo(cx - w * 0.8, topY + 65 * scale);
  ctx.lineTo(cx - w, topY + 35 * scale);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Polo collar
  ctx.fillStyle = '#142d21';
  ctx.beginPath();
  ctx.moveTo(cx - 28 * scale, topY);
  ctx.lineTo(cx, topY + 18 * scale);
  ctx.lineTo(cx + 28 * scale, topY);
  ctx.stroke();

  ctx.restore();
}

/**
 * 8d. สเวตเตอร์แคชเมียร์คอเต่า (Cashmere Turtleneck)
 */
function drawCashmereTurtleneck(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, _prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 16 * scale);

  const topY = cy - 40 * scale;
  const w = 110 * scale;
  const h = 140 * scale;

  const grad = ctx.createLinearGradient(cx - w, topY, cx + w, topY + h);
  grad.addColorStop(0, '#E8DCB8');
  grad.addColorStop(0.5, '#DACBA7');
  grad.addColorStop(1, '#C7B590');

  // High turtleneck collar
  ctx.beginPath();
  ctx.roundRect(cx - 24 * scale, topY, 48 * scale, 28 * scale, 6 * scale);
  ctx.fillStyle = '#C2B088';
  ctx.fill();

  // Main body
  ctx.beginPath();
  ctx.moveTo(cx - 24 * scale, topY + 22 * scale);
  ctx.lineTo(cx + 24 * scale, topY + 22 * scale);
  ctx.lineTo(cx + w, topY + 55 * scale);
  ctx.lineTo(cx + 60 * scale, topY + h);
  ctx.lineTo(cx - 60 * scale, topY + h);
  ctx.lineTo(cx - w, topY + 55 * scale);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.restore();
}

/**
 * 9. เข็มขัด (Belts)
 */
function drawBelt(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 10 * scale);

  const beltY = cy + 4 * scale;
  const w = 82 * scale;
  const beltH = 10 * scale;

  // Leather Strap
  ctx.beginPath();
  ctx.roundRect(cx - w, beltY - beltH * 0.5, w * 2, beltH, 4 * scale);
  ctx.fillStyle = prod.name.includes('น้ำตาล') ? '#4a2810' : '#141416';
  ctx.fill();

  // Gold Buckle
  ctx.beginPath();
  ctx.roundRect(cx - 14 * scale, beltY - beltH * 0.8, 28 * scale, beltH * 1.6, 3 * scale);
  ctx.lineWidth = 3 * scale;
  ctx.strokeStyle = '#dfa24b';
  ctx.stroke();

  // Gold Monogram emblem inside buckle
  ctx.fillStyle = '#dfa24b';
  ctx.font = `bold ${8 * scale}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('IS', cx, beltY + 3 * scale);

  ctx.restore();
}

/**
 * 10. สแล็คทำงาน (Tailored Slacks)
 */
function drawTailoredSlacks(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, _prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 16 * scale);

  const topY = cy;
  const w = 90 * scale;
  const h = 180 * scale;

  const grad = ctx.createLinearGradient(cx - w, topY, cx + w, topY + h);
  grad.addColorStop(0, '#2d3339');
  grad.addColorStop(0.5, '#1e2327');
  grad.addColorStop(1, '#111417');

  ctx.beginPath();
  ctx.moveTo(cx - w * 0.85, topY);
  ctx.lineTo(cx + w * 0.85, topY);
  ctx.lineTo(cx + w * 0.95, topY + 40 * scale);
  ctx.lineTo(cx + 42 * scale, topY + h);
  ctx.lineTo(cx + 10 * scale, topY + h);
  ctx.lineTo(cx, topY + 65 * scale); // Crotch apex
  ctx.lineTo(cx - 10 * scale, topY + h);
  ctx.lineTo(cx - 42 * scale, topY + h);
  ctx.lineTo(cx - w * 0.95, topY + 40 * scale);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Center crease seam line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - 26 * scale, topY + 20 * scale);
  ctx.lineTo(cx - 26 * scale, topY + h - 5 * scale);
  ctx.moveTo(cx + 26 * scale, topY + 20 * scale);
  ctx.lineTo(cx + 26 * scale, topY + h - 5 * scale);
  ctx.stroke();

  ctx.restore();
}

/**
 * 10b. กางเกงคาร์โก้ (Cargo Pants)
 */
function drawCargoPants(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, _prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 16 * scale);

  const topY = cy;
  const w = 98 * scale;
  const h = 175 * scale;

  const grad = ctx.createLinearGradient(cx - w, topY, cx + w, topY + h);
  grad.addColorStop(0, '#313d2a');
  grad.addColorStop(1, '#1f281a');

  ctx.beginPath();
  ctx.moveTo(cx - w * 0.85, topY);
  ctx.lineTo(cx + w * 0.85, topY);
  ctx.lineTo(cx + w, topY + 50 * scale);
  ctx.lineTo(cx + 46 * scale, topY + h);
  ctx.lineTo(cx + 12 * scale, topY + h);
  ctx.lineTo(cx, topY + 65 * scale);
  ctx.lineTo(cx - 12 * scale, topY + h);
  ctx.lineTo(cx - 46 * scale, topY + h);
  ctx.lineTo(cx - w, topY + 50 * scale);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Side cargo pockets
  ctx.fillStyle = '#273321';
  ctx.roundRect(cx - w * 0.95, topY + 80 * scale, 22 * scale, 30 * scale, 4 * scale);
  ctx.roundRect(cx + w * 0.73, topY + 80 * scale, 22 * scale, 30 * scale, 4 * scale);
  ctx.fill();

  ctx.restore();
}

/**
 * 11. กระโปรง (Skirts)
 */
function drawSkirt(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 16 * scale);

  const topY = cy + 2 * scale;
  const w = 82 * scale;
  const h = 110 * scale;

  if (prod.name.includes('พลีท')) {
    // Champagne Pleated Skirt
    const grad = ctx.createLinearGradient(cx - w, topY, cx + w, topY + h);
    grad.addColorStop(0, '#e5d7be');
    grad.addColorStop(0.5, '#f4ece0');
    grad.addColorStop(1, '#d5c4a4');

    ctx.beginPath();
    ctx.moveTo(cx - 50 * scale, topY);
    ctx.lineTo(cx + 50 * scale, topY);
    ctx.lineTo(cx + w * 1.3, topY + h);
    ctx.lineTo(cx - w * 1.3, topY + h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Pleat lines
    ctx.strokeStyle = 'rgba(150, 130, 100, 0.4)';
    ctx.lineWidth = 1.5 * scale;
    for (let x = -w * 1.2; x <= w * 1.2; x += 10 * scale) {
      ctx.beginPath();
      ctx.moveTo(cx + x * 0.4, topY);
      ctx.lineTo(cx + x, topY + h);
      ctx.stroke();
    }
  } else {
    // Denim or A-line skirt
    ctx.beginPath();
    ctx.moveTo(cx - 52 * scale, topY);
    ctx.lineTo(cx + 52 * scale, topY);
    ctx.lineTo(cx + w * 1.1, topY + h);
    ctx.lineTo(cx - w * 1.1, topY + h);
    ctx.closePath();
    ctx.fillStyle = '#2b4156';
    ctx.fill();
  }

  ctx.restore();
}

/**
 * 12. ถุงเท้า (Socks)
 */
function drawSocks(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 8 * scale);

  const leftX = cx - 28 * scale;
  const rightX = cx + 28 * scale;

  [leftX, rightX].forEach((x) => {
    ctx.beginPath();
    ctx.roundRect(x - 12 * scale, cy - 15 * scale, 24 * scale, 32 * scale, 5 * scale);
    ctx.fillStyle = prod.name.includes('ดำ') ? '#1a1a1a' : '#f7f6f2';
    ctx.fill();
    ctx.strokeStyle = '#cbb592';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    if (prod.name.includes('ลูกไม้')) {
      // Lace ruffle on top
      ctx.beginPath();
      ctx.arc(x - 6 * scale, cy - 15 * scale, 4 * scale, 0, Math.PI);
      ctx.arc(x + 6 * scale, cy - 15 * scale, 4 * scale, 0, Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  });

  ctx.restore();
}

/**
 * 13. รองเท้า (Shoes)
 */
function drawShoes(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 12 * scale);

  const leftX = cx - 35 * scale;
  const rightX = cx + 35 * scale;
  const shoeW = 32 * scale;
  const shoeH = 18 * scale;

  if (prod.name.includes('ส้นสูง')) {
    // Stiletto High Heels
    [leftX, rightX].forEach((x, idx) => {
      ctx.beginPath();
      ctx.ellipse(x, cy, shoeW * 0.7, shoeH * 0.6, idx === 0 ? -0.2 : 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#dfcfc0';
      ctx.fill();

      // Sharp heel spike
      ctx.beginPath();
      ctx.moveTo(x - 8 * scale, cy + 4 * scale);
      ctx.lineTo(x - 8 * scale, cy + 22 * scale);
      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = '#dfa24b';
      ctx.stroke();
    });
  } else {
    // Clean Leather Sneakers / Loafers
    [leftX, rightX].forEach((x) => {
      ctx.beginPath();
      ctx.ellipse(x, cy, shoeW, shoeH * 0.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = prod.name.includes('ดำ') ? '#16191d' : '#fcfcfc';
      ctx.fill();

      // White Rubber Sole
      ctx.beginPath();
      ctx.ellipse(x, cy + 8 * scale, shoeW * 1.05, 6 * scale, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#eaeaea';
      ctx.fill();
    });
  }

  ctx.restore();
}

/**
 * 14. ชุดชั้นในท่อนบน (Underwear Tops / Sports Bra / Undershirt)
 */
function drawUnderwearTop(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 14 * scale);

  const topY = cy - 10 * scale;
  const w = 78 * scale;
  const h = 75 * scale;

  ctx.beginPath();
  ctx.moveTo(cx - 30 * scale, topY);
  ctx.quadraticCurveTo(cx, topY + 16 * scale, cx + 30 * scale, topY);
  ctx.lineTo(cx + w, topY + 45 * scale);
  ctx.lineTo(cx + w * 0.8, topY + h);
  ctx.lineTo(cx - w * 0.8, topY + h);
  ctx.lineTo(cx - w, topY + 45 * scale);
  ctx.closePath();

  ctx.fillStyle = prod.name.includes('ลูกไม้') ? '#241a24' : '#1b2621';
  ctx.fill();

  // Elastic underbust band
  ctx.strokeStyle = '#dfa24b';
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.8, topY + h);
  ctx.lineTo(cx + w * 0.8, topY + h);
  ctx.stroke();

  ctx.restore();
}

/**
 * 15. กางเกงชั้นใน (Underwear Bottoms / Boxers / Seamless Briefs)
 */
function drawUnderwearBottom(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha: number, prod: Product) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 14 * scale);

  const topY = cy;
  const w = 82 * scale;
  const h = 65 * scale;

  ctx.beginPath();
  ctx.moveTo(cx - w * 0.8, topY);
  ctx.lineTo(cx + w * 0.8, topY);
  ctx.lineTo(cx + w * 0.9, topY + 25 * scale);
  ctx.lineTo(cx + 20 * scale, topY + h);
  ctx.lineTo(cx - 20 * scale, topY + h);
  ctx.lineTo(cx - w * 0.9, topY + 25 * scale);
  ctx.closePath();

  ctx.fillStyle = prod.name.includes('บ็อกเซอร์') ? '#1e242b' : '#dfcfc2';
  ctx.fill();

  // Waistband
  ctx.strokeStyle = '#dfa24b';
  ctx.lineWidth = 2.5 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.8, topY);
  ctx.lineTo(cx + w * 0.8, topY);
  ctx.stroke();

  ctx.restore();
}

/**
 * Original Core Garment Renderers (Shorts, Puff knit, Crop tee, Olive shirt, Trench, Denim, Blazer, Bag)
 */
function drawLinenShorts(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 16 * scale);

  const w = 110 * scale;
  const h = 105 * scale;
  const topY = cy;

  const grad = ctx.createLinearGradient(cx - w, topY, cx + w, topY + h);
  grad.addColorStop(0, '#E2D4BF');
  grad.addColorStop(0.3, '#D5C4AC');
  grad.addColorStop(0.7, '#C8B59A');
  grad.addColorStop(1, '#B9A384');

  ctx.beginPath();
  ctx.moveTo(cx - w * 0.72, topY);
  ctx.quadraticCurveTo(cx, topY + 4 * scale, cx + w * 0.72, topY);
  ctx.quadraticCurveTo(cx + w * 0.95, topY + h * 0.45, cx + w * 0.9, topY + h);
  ctx.lineTo(cx + w * 0.22, topY + h * 0.96);
  ctx.lineTo(cx, topY + h * 0.65);
  ctx.lineTo(cx - w * 0.22, topY + h * 0.96);
  ctx.lineTo(cx - w * 0.9, topY + h);
  ctx.quadraticCurveTo(cx - w * 0.95, topY + h * 0.45, cx - w * 0.72, topY);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  clearShadow(ctx);

  // High Waistband seam
  ctx.strokeStyle = 'rgba(120, 100, 75, 0.55)';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.7, topY + 14 * scale);
  ctx.quadraticCurveTo(cx, topY + 18 * scale, cx + w * 0.7, topY + 14 * scale);
  ctx.stroke();

  // Button
  ctx.beginPath();
  ctx.arc(cx, topY + 7 * scale, 3.5 * scale, 0, Math.PI * 2);
  ctx.fillStyle = '#4A3B2C';
  ctx.fill();

  ctx.restore();
}

function drawPuffSleeveKnit(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 18 * scale);

  const w = 85 * scale;
  const h = 90 * scale;
  const topY = cy - 25 * scale;

  // Left Puff Sleeve
  ctx.beginPath();
  ctx.ellipse(cx - w * 0.85, topY + 28 * scale, 34 * scale, 42 * scale, -0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#1c1b1a';
  ctx.fill();

  // Right Puff Sleeve
  ctx.beginPath();
  ctx.ellipse(cx + w * 0.85, topY + 28 * scale, 34 * scale, 42 * scale, 0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#1c1b1a';
  ctx.fill();

  // Bodice
  ctx.beginPath();
  ctx.moveTo(cx - 38 * scale, topY);
  ctx.quadraticCurveTo(cx, topY + 14 * scale, cx + 38 * scale, topY);
  ctx.lineTo(cx + w * 0.65, topY + h);
  ctx.lineTo(cx - w * 0.65, topY + h);
  ctx.closePath();
  ctx.fillStyle = '#141414';
  ctx.fill();

  ctx.restore();
}

function drawBlackCropTee(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 14 * scale);

  const w = 78 * scale;
  const h = 80 * scale;
  const topY = cy - 20 * scale;

  ctx.beginPath();
  ctx.moveTo(cx - 30 * scale, topY);
  ctx.quadraticCurveTo(cx, topY + 10 * scale, cx + 30 * scale, topY);
  ctx.lineTo(cx + w, topY + 30 * scale);
  ctx.lineTo(cx + w * 0.75, topY + 55 * scale);
  ctx.lineTo(cx + w * 0.65, topY + h);
  ctx.lineTo(cx - w * 0.65, topY + h);
  ctx.lineTo(cx - w * 0.75, topY + 55 * scale);
  ctx.lineTo(cx - w, topY + 30 * scale);
  ctx.closePath();
  ctx.fillStyle = '#171a1d';
  ctx.fill();

  ctx.restore();
}

function drawOliveShirt(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 16 * scale);

  const topY = cy - 25 * scale;
  const w = 115 * scale;
  const h = 135 * scale;

  const grad = ctx.createLinearGradient(cx - w, topY, cx + w, topY + h);
  grad.addColorStop(0, '#535c43');
  grad.addColorStop(0.5, '#424a35');
  grad.addColorStop(1, '#343a29');

  ctx.beginPath();
  ctx.moveTo(cx - 32 * scale, topY);
  ctx.lineTo(cx + 32 * scale, topY);
  ctx.lineTo(cx + w, topY + 45 * scale);
  ctx.lineTo(cx + w * 0.7, topY + h);
  ctx.lineTo(cx - w * 0.7, topY + h);
  ctx.lineTo(cx - w, topY + 45 * scale);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.restore();
}

function drawTrenchCoat(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 22 * scale);

  const topY = cy - 15 * scale;
  const w = 125 * scale;
  const h = 210 * scale;

  const grad = ctx.createLinearGradient(cx - w, topY, cx + w, topY + h);
  grad.addColorStop(0, '#D4B892');
  grad.addColorStop(0.5, '#BEA076');
  grad.addColorStop(1, '#A88A62');

  ctx.beginPath();
  ctx.moveTo(cx - 35 * scale, topY);
  ctx.lineTo(cx + 35 * scale, topY);
  ctx.lineTo(cx + w, topY + 45 * scale);
  ctx.lineTo(cx + w * 1.1, topY + h);
  ctx.lineTo(cx - w * 1.1, topY + h);
  ctx.lineTo(cx - w, topY + 45 * scale);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.restore();
}

function drawDenimJeans(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 16 * scale);

  const topY = cy;
  const w = 92 * scale;
  const h = 185 * scale;

  const grad = ctx.createLinearGradient(cx - w, topY, cx + w, topY + h);
  grad.addColorStop(0, '#426485');
  grad.addColorStop(0.5, '#2e4863');
  grad.addColorStop(1, '#1e3247');

  ctx.beginPath();
  ctx.moveTo(cx - w * 0.8, topY);
  ctx.lineTo(cx + w * 0.8, topY);
  ctx.lineTo(cx + w, topY + 40 * scale);
  ctx.lineTo(cx + 42 * scale, topY + h);
  ctx.lineTo(cx + 12 * scale, topY + h);
  ctx.lineTo(cx, topY + 65 * scale);
  ctx.lineTo(cx - 12 * scale, topY + h);
  ctx.lineTo(cx - 42 * scale, topY + h);
  ctx.lineTo(cx - w, topY + 40 * scale);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.restore();
}

function drawWoolBlazer(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 18 * scale);

  const topY = cy - 25 * scale;
  const w = 115 * scale;
  const h = 145 * scale;

  ctx.beginPath();
  ctx.moveTo(cx - 36 * scale, topY);
  ctx.lineTo(cx + 36 * scale, topY);
  ctx.lineTo(cx + w, topY + 40 * scale);
  ctx.lineTo(cx + w * 0.8, topY + h);
  ctx.lineTo(cx - w * 0.8, topY + h);
  ctx.lineTo(cx - w, topY + 40 * scale);
  ctx.closePath();
  ctx.fillStyle = '#1c2127';
  ctx.fill();

  ctx.restore();
}

function drawLeatherBag(ctx: CanvasRenderingContext2D, bx: number, by: number, scale: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  applyGarmentShadow(ctx, 14 * scale);

  const bagW = 42 * scale;
  const bagH = 36 * scale;

  ctx.beginPath();
  ctx.roundRect(bx - bagW * 0.5, by - bagH * 0.5, bagW, bagH, 8 * scale);
  ctx.fillStyle = '#261f1a';
  ctx.fill();

  // Gold Lock
  ctx.beginPath();
  ctx.arc(bx, by - 4 * scale, 4 * scale, 0, Math.PI * 2);
  ctx.fillStyle = '#dfa24b';
  ctx.fill();

  ctx.restore();
}
