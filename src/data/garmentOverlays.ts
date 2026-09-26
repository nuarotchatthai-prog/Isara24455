export interface GarmentOverlayConfig {
  productId: string;
  type: 'top' | 'bottom' | 'outerwear' | 'bag';
  defaultScale: number;
  defaultOffsetX: number; // percentage (-50 to 50)
  defaultOffsetY: number; // percentage (-50 to 50)
  svgPath: string;
  fillColor: string;
  secondaryColor?: string;
  accentColor?: string;
  texturePattern?: string;
  label: string;
}

export const GARMENT_OVERLAYS: Record<string, GarmentOverlayConfig> = {
  // prod-1: กางเกงขาสั้นเอวสูง ผ้าลินิน (Beige linen high-waisted shorts)
  'prod-1': {
    productId: 'prod-1',
    type: 'bottom',
    defaultScale: 1.0,
    defaultOffsetX: 0,
    defaultOffsetY: 12,
    fillColor: '#D8C6A5',
    secondaryColor: '#C4B08C',
    accentColor: '#B09C78',
    label: 'กางเกงขาสั้นเอวสูง ผ้าลินิน',
    svgPath: `
      M 70 10
      C 85 8, 115 8, 130 10
      C 138 20, 142 45, 140 70
      C 125 72, 110 74, 105 55
      C 100 55, 95 72, 80 70
      C 68 45, 62 20, 70 10 Z
    `
  },

  // prod-2: เสื้อครอปไหมพรมแขนพอง (Black knit puff-sleeve crop top)
  'prod-2': {
    productId: 'prod-2',
    type: 'top',
    defaultScale: 1.05,
    defaultOffsetX: 0,
    defaultOffsetY: -8,
    fillColor: '#171717',
    secondaryColor: '#262626',
    accentColor: '#383838',
    label: 'เสื้อครอปไหมพรมแขนพอง',
    svgPath: `
      M 85 10
      C 95 18, 105 18, 115 10
      C 130 5, 145 15, 155 28
      C 162 42, 150 56, 138 52
      C 132 45, 126 40, 124 55
      L 122 75
      L 78 75
      L 76 55
      C 74 40, 68 45, 62 52
      C 50 56, 38 42, 45 28
      C 55 15, 70 5, 85 10 Z
    `
  },

  // prod-3: เสื้อครอปคอกลมสีดำ มินิมอล (Minimal black fitted crop tee)
  'prod-3': {
    productId: 'prod-3',
    type: 'top',
    defaultScale: 0.95,
    defaultOffsetX: 0,
    defaultOffsetY: -9,
    fillColor: '#111111',
    secondaryColor: '#1F1F1F',
    accentColor: '#303030',
    label: 'เสื้อครอปคอกลมสีดำ',
    svgPath: `
      M 82 8
      C 92 16, 108 16, 118 8
      L 136 18
      L 142 36
      L 126 42
      L 122 72
      L 78 72
      L 74 42
      L 58 36
      L 64 18 Z
    `
  },

  // prod-4: เสื้อเชิ้ตแขนสั้น ผ้าคอตตอน สีเขียวโอลีฟ (Olive green casual shirt)
  'prod-4': {
    productId: 'prod-4',
    type: 'top',
    defaultScale: 1.1,
    defaultOffsetX: 0,
    defaultOffsetY: -5,
    fillColor: '#7A8450',
    secondaryColor: '#6B7543',
    accentColor: '#586134',
    label: 'เสื้อเชิ้ตแขนสั้น สีเขียวโอลีฟ',
    svgPath: `
      M 80 5
      L 100 15
      L 120 5
      L 145 18
      L 152 46
      L 132 50
      L 126 90
      L 74 90
      L 68 50
      L 48 46
      L 55 18 Z
    `
  },

  // prod-5: เสื้อโค้ตเทรนช์ คอลเลกชันใหม่ 2024 (Beige luxury trench coat)
  'prod-5': {
    productId: 'prod-5',
    type: 'outerwear',
    defaultScale: 1.25,
    defaultOffsetX: 0,
    defaultOffsetY: 4,
    fillColor: '#CBB28D',
    secondaryColor: '#B89C74',
    accentColor: '#8C724E',
    label: 'เสื้อโค้ตเทรนช์ 2024',
    svgPath: `
      M 80 6
      L 100 18
      L 120 6
      L 155 20
      L 165 75
      L 145 78
      L 140 120
      L 60 120
      L 55 78
      L 35 75
      L 45 20 Z
    `
  },

  // prod-6: กางเกงยีนส์ขากระบอก 501 Original Fit (Classic denim jeans)
  'prod-6': {
    productId: 'prod-6',
    type: 'bottom',
    defaultScale: 1.05,
    defaultOffsetX: 0,
    defaultOffsetY: 28,
    fillColor: '#3B577D',
    secondaryColor: '#2D4464',
    accentColor: '#4A6B99',
    label: 'กางเกงยีนส์ 501 Original',
    svgPath: `
      M 68 10
      C 85 8, 115 8, 132 10
      L 136 50
      L 132 125
      L 106 125
      L 100 48
      L 94 125
      L 68 125
      L 64 50 Z
    `
  },

  // prod-7: สูทเบลเซอร์เทเลอร์เมด วัยสง่า (Navy Italian wool blazer)
  'prod-7': {
    productId: 'prod-7',
    type: 'outerwear',
    defaultScale: 1.18,
    defaultOffsetX: 0,
    defaultOffsetY: -2,
    fillColor: '#1E2B37',
    secondaryColor: '#15202B',
    accentColor: '#2B3D4F',
    label: 'สูทเบลเซอร์วัยสง่า',
    svgPath: `
      M 82 8
      L 100 22
      L 118 8
      L 152 20
      L 160 70
      L 140 72
      L 135 105
      L 65 105
      L 60 72
      L 40 70
      L 48 20 Z
    `
  },

  // prod-9: กระเป๋าสะพายไหล่หนังแท้ (Leather shoulder bag)
  'prod-9': {
    productId: 'prod-9',
    type: 'bag',
    defaultScale: 0.85,
    defaultOffsetX: 28,
    defaultOffsetY: 18,
    fillColor: '#E2D4BF',
    secondaryColor: '#CDBCA3',
    accentColor: '#B09D80',
    label: 'กระเป๋าสะพายไหล่หนังแท้',
    svgPath: `
      M 80 20
      C 80 5, 120 5, 120 20
      L 125 35
      C 135 36, 140 45, 138 65
      C 135 75, 65 75, 62 65
      C 60 45, 65 36, 75 35 Z
    `
  }
};
