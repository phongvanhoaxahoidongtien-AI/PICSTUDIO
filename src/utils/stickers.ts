export interface StickerItem {
  id: string;
  name: string;
  category: 'trending' | 'social' | 'ecommerce' | 'reaction' | 'vlog' | 'badge' | 'frame' | 'shape';
  svg: string;
  defaultWidth: number;
  defaultHeight: number;
  tags?: string[];
}

export const OFFLINE_STICKERS: StickerItem[] = [
  // ==========================================
  // 0. TRENDING & SOCIAL MEDIA HIGHLIGHTS (Thịnh hành)
  // ==========================================
  {
    id: 'trend-red-solid-box',
    name: 'Khung vuông nét đỏ liền',
    category: 'trending',
    defaultWidth: 200,
    defaultHeight: 200,
    svg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="184" height="184" rx="16" fill="rgba(239, 68, 68, 0.05)" stroke="#EF4444" stroke-width="8"/>
    </svg>`,
    tags: ['khung', 'vuong', 'do', 'lien', 'border', 'red', 'box'],
  },
  {
    id: 'trend-red-dashed-box',
    name: 'Khung vuông nét đỏ đứt',
    category: 'trending',
    defaultWidth: 200,
    defaultHeight: 200,
    svg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="184" height="184" rx="16" fill="rgba(239, 68, 68, 0.05)" stroke="#EF4444" stroke-width="8" stroke-dasharray="16 12"/>
    </svg>`,
    tags: ['khung', 'vuong', 'do', 'dut', 'dashed', 'red', 'box'],
  },
  {
    id: 'trend-focus-corners-red',
    name: 'Khung góc ngắm đỏ Focus',
    category: 'trending',
    defaultWidth: 220,
    defaultHeight: 220,
    svg: `<svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Corners -->
      <path d="M12 50 V12 H50" stroke="#EF4444" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M170 12 H208 V50" stroke="#EF4444" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M208 170 V208 H170" stroke="#EF4444" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M50 208 H12 V170" stroke="#EF4444" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="110" cy="110" r="6" fill="#EF4444"/>
    </svg>`,
    tags: ['focus', 'camera', 'goc', 'ngam', 'do', 'red'],
  },
  {
    id: 'trend-aesthetic-bubble-heart',
    name: 'Bong bóng thoại Trái tim',
    category: 'trending',
    defaultWidth: 150,
    defaultHeight: 125,
    svg: `<svg viewBox="0 0 150 125" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 20 C10 9 19 0 30 0 H120 C131 0 140 9 140 20 V75 C140 86 131 95 120 95 H60 L35 120 V95 H30 C19 95 10 86 10 75 Z" fill="#F43F5E"/>
      <path d="M75 66 C56 50 42 38 42 27 C42 16 50 8 60 8 C68 8 72 13 75 18 C78 13 82 8 90 8 C100 8 108 16 108 27 C108 38 94 50 75 66 Z" fill="#FFFFFF"/>
    </svg>`,
    tags: ['bubble', 'speech', 'heart', 'tim', 'thoai'],
  },
  {
    id: 'trend-thought-bubble-cloud',
    name: 'Bong bóng suy nghĩ Mây',
    category: 'trending',
    defaultWidth: 170,
    defaultHeight: 130,
    svg: `<svg viewBox="0 0 170 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Main Cloud -->
      <path d="M40 80 C20 80 10 65 15 48 C15 32 30 20 48 22 C55 8 78 5 95 14 C110 2 135 10 140 28 C155 32 165 48 158 65 C155 78 140 82 130 80 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="4"/>
      <!-- Small thought dots -->
      <circle cx="34" cy="98" r="8" fill="#FFFFFF" stroke="#0F172A" stroke-width="4"/>
      <circle cx="22" cy="116" r="5" fill="#FFFFFF" stroke="#0F172A" stroke-width="4"/>
      <text x="88" y="55" fill="#0F172A" font-size="16" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">OMG...</text>
    </svg>`,
    tags: ['bubble', 'thought', 'may', 'suy nghi', 'cloud'],
  },
  {
    id: 'trend-y2k-sparkle-star',
    name: 'Ngôi sao Y2K Aesthetic',
    category: 'trending',
    defaultWidth: 130,
    defaultHeight: 130,
    svg: `<svg viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="y2k-star" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#38BDF8"/>
          <stop offset="50%" stop-color="#818CF8"/>
          <stop offset="100%" stop-color="#F43F5E"/>
        </linearGradient>
      </defs>
      <path d="M65 0 C65 35 35 65 0 65 C35 65 65 95 65 130 C65 95 95 65 130 65 C95 65 65 35 65 0 Z" fill="url(#y2k-star)"/>
      <circle cx="65" cy="65" r="8" fill="#FFFFFF"/>
    </svg>`,
    tags: ['y2k', 'sparkle', 'star', 'sao', 'doodle', 'aesthetic'],
  },
  {
    id: 'trend-doodle-drawn-heart',
    name: 'Trái tim vẽ tay Doodle',
    category: 'trending',
    defaultWidth: 130,
    defaultHeight: 120,
    svg: `<svg viewBox="0 0 130 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M65 110 C50 95 10 65 10 35 C10 12 32 4 50 16 C60 22 65 30 65 30 C65 30 70 22 80 16 C98 4 120 12 120 35 C120 65 80 95 65 110 Z" stroke="#F43F5E" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 35 C30 25 40 18 48 24" stroke="#FDA4AF" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    tags: ['doodle', 'heart', 've tay', 'tim', 'aesthetic'],
  },
  {
    id: 'trend-doodle-sun-cute',
    name: 'Mặt trời Doodle Cute',
    category: 'trending',
    defaultWidth: 140,
    defaultHeight: 140,
    svg: `<svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Rays -->
      <line x1="70" y1="10" x2="70" y2="24" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
      <line x1="70" y1="116" x2="70" y2="130" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
      <line x1="10" y1="70" x2="24" y2="70" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
      <line x1="116" y1="70" x2="130" y2="70" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
      <line x1="28" y1="28" x2="38" y2="38" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
      <line x1="102" y1="102" x2="112" y2="112" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
      <line x1="112" y1="28" x2="102" y2="38" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
      <line x1="38" y1="102" x2="28" y2="112" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
      <!-- Sun circle -->
      <circle cx="70" cy="70" r="38" fill="#FBBF24" stroke="#F59E0B" stroke-width="5"/>
      <!-- Smile face -->
      <circle cx="58" cy="64" r="4" fill="#78350F"/>
      <circle cx="82" cy="64" r="4" fill="#78350F"/>
      <path d="M58 76 Q70 86 82 76" stroke="#78350F" stroke-width="4" stroke-linecap="round"/>
      <!-- Blush -->
      <circle cx="50" cy="72" r="5" fill="#F87171" opacity="0.6"/>
      <circle cx="90" cy="72" r="5" fill="#F87171" opacity="0.6"/>
    </svg>`,
    tags: ['sun', 'doodle', 'cute', 'mat troi', 'aesthetic'],
  },
  {
    id: 'trend-tape-washi-beige',
    name: 'Băng dán Washi Tape Retro',
    category: 'trending',
    defaultWidth: 160,
    defaultHeight: 52,
    svg: `<svg viewBox="0 0 160 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,6 6,0 12,6 18,0 152,0 160,8 152,16 160,24 152,32 160,40 152,48 146,52 14,52 6,46 14,40 6,34 14,28 6,22 14,16 6,10" fill="#FEF3C7" opacity="0.85"/>
      <line x1="20" y1="16" x2="140" y2="16" stroke="#F59E0B" stroke-width="2" stroke-dasharray="6 4" opacity="0.6"/>
      <line x1="20" y1="34" x2="140" y2="34" stroke="#F59E0B" stroke-width="2" stroke-dasharray="6 4" opacity="0.6"/>
    </svg>`,
    tags: ['tape', 'washi', 'bang keo', 'dan', 'vintage', 'retro'],
  },
  {
    id: 'trend-curved-red-arrow-handdrawn',
    name: 'Mũi tên đỏ chỉ tay Doodle',
    category: 'trending',
    defaultWidth: 130,
    defaultHeight: 110,
    svg: `<svg viewBox="0 0 130 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 95 C35 30 75 25 105 50" stroke="#EF4444" stroke-width="9" stroke-linecap="round"/>
      <path d="M105 50 L84 32 M105 50 L108 24" stroke="#EF4444" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    tags: ['arrow', 'mui ten', 'do', 'red', 'doodle', 'chi tay'],
  },

  // ==========================================
  // 1. SOCIAL MEDIA & CREATOR (Mạng xã hội & Nhà sáng tạo)
  // ==========================================
  {
    id: 'social-verified-gold',
    name: 'Tích vàng Official',
    category: 'social',
    defaultWidth: 100,
    defaultHeight: 100,
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 0 L63 8 L78 5 L86 19 L100 25 L98 40 L108 50 L98 60 L100 75 L86 81 L78 95 L63 92 L50 100 L37 92 L22 95 L14 81 L0 75 L2 60 L-8 50 L2 40 L0 25 L14 19 L22 5 L37 8 Z" fill="#EAB308"/>
      <path d="M30 50 L44 64 L72 36" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'social-verified-blue',
    name: 'Tích xanh Meta / X',
    category: 'social',
    defaultWidth: 100,
    defaultHeight: 100,
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 0 L63 8 L78 5 L86 19 L100 25 L98 40 L108 50 L98 60 L100 75 L86 81 L78 95 L63 92 L50 100 L37 92 L22 95 L14 81 L0 75 L2 60 L-8 50 L2 40 L0 25 L14 19 L22 5 L37 8 Z" fill="#0284C7"/>
      <path d="M30 50 L44 64 L72 36" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'social-new-post',
    name: 'Tag New Post',
    category: 'social',
    defaultWidth: 170,
    defaultHeight: 70,
    svg: `<svg viewBox="0 0 170 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="np-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F43F5E"/>
          <stop offset="100%" stop-color="#8B5CF6"/>
        </linearGradient>
      </defs>
      <rect x="4" y="6" width="162" height="58" rx="29" fill="url(#np-grad)" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="28" cy="35" r="10" fill="#FFFFFF"/>
      <polygon points="26,30 33,35 26,40" fill="#F43F5E"/>
      <text x="96" y="42" fill="#FFFFFF" font-size="18" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="1">NEW POST</text>
    </svg>`,
  },
  {
    id: 'social-follow-pill',
    name: 'Nút Follow Me',
    category: 'social',
    defaultWidth: 160,
    defaultHeight: 56,
    svg: `<svg viewBox="0 0 160 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="56" rx="28" fill="#EF4444"/>
      <path d="M34 28 H46 M40 22 V34" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
      <text x="96" y="36" fill="#FFFFFF" font-size="19" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">FOLLOW</text>
    </svg>`,
  },
  {
    id: 'social-subscribe-yt',
    name: 'Subscribe Đỏ',
    category: 'social',
    defaultWidth: 180,
    defaultHeight: 56,
    svg: `<svg viewBox="0 0 180 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="56" rx="14" fill="#CC0000"/>
      <!-- Bell icon -->
      <path d="M32 20 C32 16 36 14 40 14 C44 14 48 16 48 20 V28 L51 32 H29 L32 28 Z" fill="#FFFFFF"/>
      <circle cx="40" cy="36" r="3" fill="#FFFFFF"/>
      <text x="108" y="36" fill="#FFFFFF" font-size="18" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">SUBSCRIBE</text>
    </svg>`,
  },
  {
    id: 'social-link-in-bio',
    name: 'Link in Bio (Instagram)',
    category: 'social',
    defaultWidth: 180,
    defaultHeight: 64,
    svg: `<svg viewBox="0 0 180 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="174" height="58" rx="29" fill="#0F172A" stroke="#38BDF8" stroke-width="3"/>
      <!-- Chain link -->
      <path d="M28 32 C28 27 32 23 37 23 H44 M44 41 H37 C32 41 28 37 28 32 Z" stroke="#38BDF8" stroke-width="4" stroke-linecap="round"/>
      <path d="M52 32 C52 37 48 41 43 41 H36 M36 23 H43 C48 23 52 27 52 32 Z" stroke="#38BDF8" stroke-width="4" stroke-linecap="round"/>
      <text x="108" y="39" fill="#FFFFFF" font-size="16" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">LINK IN BIO</text>
    </svg>`,
  },
  {
    id: 'social-swipe-up',
    name: 'Swipe Up (Vuốt lên)',
    category: 'social',
    defaultWidth: 150,
    defaultHeight: 90,
    svg: `<svg viewBox="0 0 150 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M75 12 L50 34 M75 12 L100 34" stroke="#F43F5E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M75 28 L55 46 M75 28 L95 46" stroke="#FB7185" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="75" y="74" fill="#FFFFFF" font-size="18" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="1">SWIPE UP</text>
    </svg>`,
  },
  {
    id: 'social-live-stream',
    name: 'Live Stream Trực tiếp',
    category: 'social',
    defaultWidth: 130,
    defaultHeight: 52,
    svg: `<svg viewBox="0 0 130 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="130" height="52" rx="12" fill="#E11D48"/>
      <circle cx="28" cy="26" r="8" fill="#FFFFFF"/>
      <circle cx="28" cy="26" r="14" stroke="#FECDD3" stroke-width="2.5" opacity="0.7"/>
      <text x="78" y="34" fill="#FFFFFF" font-size="20" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">LIVE</text>
    </svg>`,
  },
  {
    id: 'social-like-bubble',
    name: 'Like Bubble (Tim Instagram)',
    category: 'social',
    defaultWidth: 120,
    defaultHeight: 110,
    svg: `<svg viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ig-heart" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F58529"/>
          <stop offset="50%" stop-color="#DD2A7B"/>
          <stop offset="100%" stop-color="#8134AF"/>
        </linearGradient>
      </defs>
      <path d="M60 100 C30 76 8 54 8 36 C8 18 20 6 36 6 C47 6 56 14 60 22 C64 14 73 6 84 6 C100 6 112 18 112 36 C112 54 90 76 60 100 Z" fill="url(#ig-heart)"/>
      <ellipse cx="40" cy="26" rx="10" ry="5" transform="rotate(-30 40 26)" fill="#FFFFFF" opacity="0.4"/>
    </svg>`,
  },

  // ==========================================
  // 2. E-COMMERCE & BÁN HÀNG (Sale, Hot, Freeship)
  // ==========================================
  {
    id: 'ecom-sale-50',
    name: 'Sale 50% Bùng nổ',
    category: 'ecommerce',
    defaultWidth: 150,
    defaultHeight: 150,
    svg: `<svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M75 0 L92 18 L116 12 L126 34 L150 42 L146 66 L160 86 L144 104 L146 128 L122 134 L110 154 L88 146 L75 160 L62 146 L40 154 L28 134 L4 128 L6 104 L-10 86 L4 66 L0 42 L24 34 L34 12 L58 18 Z" fill="#EF4444"/>
      <circle cx="75" cy="75" r="54" fill="#B91C1C"/>
      <text x="75" y="64" fill="#FDE047" font-size="20" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">SALE</text>
      <text x="75" y="104" fill="#FFFFFF" font-size="34" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">50%</text>
    </svg>`,
  },
  {
    id: 'ecom-hot-deal',
    name: 'Tag Hot Deal',
    category: 'ecommerce',
    defaultWidth: 170,
    defaultHeight: 64,
    svg: `<svg viewBox="0 0 170 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 8 C0 3.5 3.5 0 8 0 H140 L170 32 L140 64 H8 C3.5 64 0 60.5 0 56 Z" fill="#EA580C"/>
      <circle cx="140" cy="32" r="6" fill="#FFFFFF"/>
      <text x="65" y="42" fill="#FFFFFF" font-size="20" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">HOT DEAL</text>
    </svg>`,
  },
  {
    id: 'ecom-freeship',
    name: 'Freeship Toàn quốc',
    category: 'ecommerce',
    defaultWidth: 180,
    defaultHeight: 60,
    svg: `<svg viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="60" rx="14" fill="#059669"/>
      <!-- Truck icon -->
      <path d="M20 22 H36 V38 H20 Z M36 26 H46 L52 32 V38 H36 Z" fill="#FFFFFF"/>
      <circle cx="28" cy="40" r="4" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="44" cy="40" r="4" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
      <text x="110" y="38" fill="#FFFFFF" font-size="18" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">FREESHIP</text>
    </svg>`,
  },
  {
    id: 'ecom-best-seller',
    name: 'Best Seller Vàng',
    category: 'ecommerce',
    defaultWidth: 150,
    defaultHeight: 150,
    svg: `<svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Ribbon bottom -->
      <polygon points="35,100 20,145 50,130 65,110" fill="#B45309"/>
      <polygon points="115,100 130,145 100,130 85,110" fill="#B45309"/>
      <!-- Badge circle -->
      <circle cx="75" cy="70" r="56" fill="#F59E0B" stroke="#D97706" stroke-width="4"/>
      <circle cx="75" cy="70" r="46" fill="#FEF3C7" stroke="#B45309" stroke-width="2" stroke-dasharray="4 2"/>
      <text x="75" y="58" fill="#78350F" font-size="15" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">BEST</text>
      <text x="75" y="82" fill="#B45309" font-size="20" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">SELLER</text>
      <text x="75" y="98" fill="#78350F" font-size="12" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">★★★★★</text>
    </svg>`,
  },
  {
    id: 'ecom-flash-sale',
    name: 'Tia chớp Flash Sale',
    category: 'ecommerce',
    defaultWidth: 170,
    defaultHeight: 70,
    svg: `<svg viewBox="0 0 170 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="170" height="70" rx="16" fill="#18181B" stroke="#EAB308" stroke-width="3"/>
      <!-- Lightning bolt -->
      <polygon points="26,10 14,38 28,38 20,60 42,28 28,28" fill="#FACC15"/>
      <text x="100" y="32" fill="#FACC15" font-size="14" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">⚡ FLASH</text>
      <text x="100" y="56" fill="#FFFFFF" font-size="22" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">SALE</text>
    </svg>`,
  },
  {
    id: 'ecom-new-arrival',
    name: 'Hàng Mới New Arrival',
    category: 'ecommerce',
    defaultWidth: 160,
    defaultHeight: 56,
    svg: `<svg viewBox="0 0 160 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="56" rx="28" fill="#8B5CF6"/>
      <text x="80" y="35" fill="#FFFFFF" font-size="16" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="1">NEW ARRIVAL</text>
    </svg>`,
  },

  // ==========================================
  // 3. VLOG, TRAVEL & MOOD
  // ==========================================
  {
    id: 'vlog-daily-vlog',
    name: 'Daily Vlog Tag',
    category: 'vlog',
    defaultWidth: 180,
    defaultHeight: 64,
    svg: `<svg viewBox="0 0 180 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="64" rx="32" fill="#0F172A" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="34" cy="32" r="14" fill="#F43F5E"/>
      <polygon points="31,26 40,32 31,38" fill="#FFFFFF"/>
      <text x="106" y="39" fill="#FFFFFF" font-size="18" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">Daily Vlog</text>
    </svg>`,
  },
  {
    id: 'vlog-location-pin',
    name: 'Ghim vị trí Check-in',
    category: 'vlog',
    defaultWidth: 120,
    defaultHeight: 140,
    svg: `<svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 0 C32 0 10 22 10 50 C10 82 60 140 60 140 C60 140 110 82 110 50 C110 22 88 0 60 0 Z" fill="#EF4444"/>
      <circle cx="60" cy="50" r="22" fill="#FFFFFF"/>
      <circle cx="60" cy="50" r="12" fill="#B91C1C"/>
    </svg>`,
  },
  {
    id: 'vlog-ootd-tag',
    name: 'OOTD (Outfit Of The Day)',
    category: 'vlog',
    defaultWidth: 150,
    defaultHeight: 60,
    svg: `<svg viewBox="0 0 150 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="60" rx="30" fill="#FDF2F8" stroke="#DB2777" stroke-width="3"/>
      <text x="75" y="38" fill="#DB2777" font-size="24" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="2">#OOTD</text>
    </svg>`,
  },
  {
    id: 'vlog-aesthetic-coffee',
    name: 'Ly Cà phê Chill',
    category: 'vlog',
    defaultWidth: 120,
    defaultHeight: 120,
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Cup -->
      <path d="M25 40 H85 L78 95 C78 102 72 108 65 108 H45 C38 108 32 102 32 95 Z" fill="#D97706"/>
      <!-- Handle -->
      <path d="M82 50 C96 50 96 78 80 80" stroke="#B45309" stroke-width="6" stroke-linecap="round"/>
      <!-- Steam -->
      <path d="M45 28 C42 20 48 14 45 6" stroke="#92400E" stroke-width="4" stroke-linecap="round"/>
      <path d="M65 28 C62 20 68 14 65 6" stroke="#92400E" stroke-width="4" stroke-linecap="round"/>
      <!-- Heart on cup -->
      <path d="M55 75 C48 68 42 62 42 56 C42 51 45 48 49 48 C52 48 54 50 55 52 C56 50 58 48 61 48 C65 48 68 51 68 56 C68 62 62 68 55 75 Z" fill="#FEF3C7"/>
    </svg>`,
  },
  {
    id: 'vlog-good-vibes',
    name: 'Good Vibes Neon',
    category: 'vlog',
    defaultWidth: 180,
    defaultHeight: 70,
    svg: `<svg viewBox="0 0 180 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="gv-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="180" height="70" rx="20" fill="#090D16" stroke="#06B6D4" stroke-width="2"/>
      <text x="90" y="44" fill="#38BDF8" font-size="20" font-weight="900" font-family="'Caveat', cursive, sans-serif" text-anchor="middle" filter="url(#gv-glow)">✨ Good Vibes ✨</text>
    </svg>`,
  },
  {
    id: 'vlog-music-player',
    name: 'Thanh phát nhạc Chill',
    category: 'vlog',
    defaultWidth: 220,
    defaultHeight: 76,
    svg: `<svg viewBox="0 0 220 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="76" rx="18" fill="#18181B" stroke="#3F3F46" stroke-width="2"/>
      <!-- Soundwave -->
      <rect x="20" y="32" width="4" height="20" rx="2" fill="#10B981"/>
      <rect x="28" y="24" width="4" height="36" rx="2" fill="#10B981"/>
      <rect x="36" y="18" width="4" height="48" rx="2" fill="#10B981"/>
      <rect x="44" y="28" width="4" height="28" rx="2" fill="#10B981"/>
      <!-- Song info -->
      <text x="60" y="34" fill="#FFFFFF" font-size="13" font-weight="bold" font-family="system-ui, sans-serif">My Favorite Track</text>
      <text x="60" y="50" fill="#A1A1AA" font-size="11" font-family="system-ui, sans-serif">02:45 ●━━━━━━ 03:30</text>
    </svg>`,
  },

  // ==========================================
  // 4. REACTION & EMOJIS (Biểu cảm mạng xã hội)
  // ==========================================
  {
    id: 'react-fire-trending',
    name: 'Ngọn lửa Trending',
    category: 'reaction',
    defaultWidth: 110,
    defaultHeight: 140,
    svg: `<svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 0 C60 30 85 45 90 75 C95 105 75 130 50 130 C25 130 5 105 10 75 C15 45 40 30 50 0 Z" fill="#EA580C"/>
      <path d="M50 35 C58 55 75 68 75 90 C75 110 65 125 50 125 C35 125 25 110 25 90 C25 68 42 55 50 35 Z" fill="#FACC15"/>
    </svg>`,
  },
  {
    id: 'react-100-points',
    name: 'Điểm 100 Tuyệt đối',
    category: 'reaction',
    defaultWidth: 120,
    defaultHeight: 90,
    svg: `<svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="60" y="60" fill="#DC2626" font-size="52" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="-2">100</text>
      <line x1="16" y1="74" x2="104" y2="74" stroke="#DC2626" stroke-width="6" stroke-linecap="round"/>
      <line x1="24" y1="84" x2="96" y2="84" stroke="#DC2626" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'react-sparkle-stars',
    name: 'Chùm sao lấp lánh (Sparkle)',
    category: 'reaction',
    defaultWidth: 120,
    defaultHeight: 120,
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L58 36 L89 44 L58 52 L50 83 L42 52 L11 44 L42 36 Z" fill="#FACC15"/>
      <path d="M80 65 L84 76 L95 80 L84 84 L80 95 L76 84 L65 80 L76 76 Z" fill="#FDE047"/>
      <path d="M20 15 L22 23 L30 25 L22 27 L20 35 L18 27 L10 25 L18 23 Z" fill="#FEF08A"/>
    </svg>`,
  },
  {
    id: 'react-heart-eyes',
    name: 'Mặt cười mắt tim',
    category: 'reaction',
    defaultWidth: 120,
    defaultHeight: 120,
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#FBBF24" stroke="#F59E0B" stroke-width="4"/>
      <!-- Heart eyes -->
      <path d="M34 40 C30 32 20 32 20 40 C20 48 34 56 34 56 C34 56 48 48 48 40 C48 32 38 32 34 40 Z" fill="#DC2626"/>
      <path d="M66 40 C62 32 52 32 52 40 C52 48 66 56 66 56 C66 56 80 48 80 40 C80 32 70 32 66 40 Z" fill="#DC2626"/>
      <!-- Big smile -->
      <path d="M30 64 C30 76 70 76 70 64 Z" fill="#78350F"/>
      <path d="M38 64 C38 72 62 72 62 64 Z" fill="#F87171"/>
    </svg>`,
  },
  {
    id: 'react-sunglasses-cool',
    name: 'Kính râm Cool ngầu',
    category: 'reaction',
    defaultWidth: 120,
    defaultHeight: 120,
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#FBBF24" stroke="#F59E0B" stroke-width="4"/>
      <!-- Glasses -->
      <path d="M16 40 Q50 36 84 40 L80 56 C76 64 54 64 52 56 L48 56 C46 64 24 64 20 56 Z" fill="#0F172A"/>
      <line x1="28" y1="44" x2="42" y2="58" stroke="#FFFFFF" stroke-width="3" opacity="0.6"/>
      <line x1="58" y1="44" x2="72" y2="58" stroke="#FFFFFF" stroke-width="3" opacity="0.6"/>
      <!-- Grin -->
      <path d="M36 72 Q50 82 64 72" stroke="#78350F" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'react-crown-gold',
    name: 'Vương miện Queen/King',
    category: 'reaction',
    defaultWidth: 140,
    defaultHeight: 100,
    svg: `<svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 80 L20 25 L45 55 L60 15 L75 55 L100 25 L110 80 Z" fill="#F59E0B" stroke="#D97706" stroke-width="3"/>
      <circle cx="20" cy="20" r="8" fill="#EF4444"/>
      <circle cx="60" cy="10" r="9" fill="#3B82F6"/>
      <circle cx="100" cy="20" r="8" fill="#10B981"/>
      <rect x="15" y="70" width="90" height="12" rx="6" fill="#FBBF24"/>
    </svg>`,
  },

  // ==========================================
  // 5. BADGES & VINTAGE (Huy hiệu cổ điển)
  // ==========================================
  {
    id: 'badge-vintage-original',
    name: 'Huy hiệu Vintage Authentic',
    category: 'badge',
    defaultWidth: 150,
    defaultHeight: 150,
    svg: `<svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="75" cy="75" r="68" fill="#FEF3C7" stroke="#B45309" stroke-width="4" stroke-dasharray="6 4"/>
      <circle cx="75" cy="75" r="56" fill="none" stroke="#D97706" stroke-width="2"/>
      <text x="75" y="60" text-anchor="middle" fill="#78350F" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">★ AUTHENTIC ★</text>
      <text x="75" y="85" text-anchor="middle" fill="#92400E" font-size="22" font-weight="900" font-family="system-ui, sans-serif">ORIGINAL</text>
      <text x="75" y="102" text-anchor="middle" fill="#78350F" font-size="11" font-weight="bold" font-family="system-ui, sans-serif">PHOTO STUDIO</text>
    </svg>`,
  },
  {
    id: 'badge-retro-camera',
    name: 'Máy ảnh Film Cổ',
    category: 'badge',
    defaultWidth: 140,
    defaultHeight: 110,
    svg: `<svg viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="30" width="120" height="70" rx="16" fill="#334155" stroke="#1E293B" stroke-width="4"/>
      <path d="M45 30 L55 15 L85 15 L95 30 Z" fill="#475569"/>
      <circle cx="70" cy="65" r="28" fill="#0F172A" stroke="#64748B" stroke-width="5"/>
      <circle cx="70" cy="65" r="16" fill="#38BDF8" opacity="0.8"/>
      <circle cx="64" cy="58" r="5" fill="#FFFFFF"/>
      <circle cx="110" cy="45" r="6" fill="#EF4444"/>
    </svg>`,
  },
  {
    id: 'badge-top-rated',
    name: 'Top 1 Đánh giá 5 Sao',
    category: 'badge',
    defaultWidth: 160,
    defaultHeight: 60,
    svg: `<svg viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="60" rx="16" fill="#18181B" stroke="#EAB308" stroke-width="2"/>
      <text x="80" y="28" fill="#EAB308" font-size="13" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">TOP RATED</text>
      <text x="80" y="48" fill="#FACC15" font-size="16" font-family="system-ui, sans-serif" text-anchor="middle">★★★★★</text>
    </svg>`,
  },

  // ==========================================
  // 6. FRAMES (Khung ảnh nghệ thuật)
  // ==========================================
  {
    id: 'frame-polaroid',
    name: 'Khung ảnh Polaroid',
    category: 'frame',
    defaultWidth: 320,
    defaultHeight: 380,
    svg: `<svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="380" rx="8" fill="#F8FAFC" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.25))"/>
      <rect x="20" y="20" width="280" height="280" rx="4" fill="none" stroke="#E2E8F0" stroke-width="2"/>
      <line x1="40" y1="335" x2="200" y2="335" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round"/>
      <circle cx="280" cy="335" r="10" fill="#EF4444" opacity="0.4"/>
    </svg>`,
  },
  {
    id: 'frame-gold-border',
    name: 'Khung viền vàng cổ điển',
    category: 'frame',
    defaultWidth: 360,
    defaultHeight: 360,
    svg: `<svg viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="15" width="330" height="330" rx="12" fill="none" stroke="#F59E0B" stroke-width="4"/>
      <rect x="25" y="25" width="310" height="310" rx="8" fill="none" stroke="#D97706" stroke-width="1.5" stroke-dasharray="8 4"/>
      <polygon points="10,10 40,10 40,15 15,15 15,40 10,40" fill="#F59E0B"/>
      <polygon points="350,10 320,10 320,15 345,15 345,40 350,40" fill="#F59E0B"/>
      <polygon points="10,350 40,350 40,345 15,345 15,320 10,320" fill="#F59E0B"/>
      <polygon points="350,350 320,350 320,345 345,345 345,320 350,320" fill="#F59E0B"/>
    </svg>`,
  },
  {
    id: 'frame-film-strip',
    name: 'Khung cuộn film điện ảnh',
    category: 'frame',
    defaultWidth: 380,
    defaultHeight: 300,
    svg: `<svg viewBox="0 0 380 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="380" height="300" fill="#0F172A"/>
      <!-- Sprocket holes top -->
      <rect x="15" y="8" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="55" y="8" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="95" y="8" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="135" y="8" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="175" y="8" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="215" y="8" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="255" y="8" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="295" y="8" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="335" y="8" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <!-- Sprocket holes bottom -->
      <rect x="15" y="278" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="55" y="278" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="95" y="278" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="135" y="278" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="175" y="278" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="215" y="278" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="255" y="278" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="295" y="278" width="20" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="335" y="278" width="20" height="14" rx="3" fill="#FFFFFF"/>
    </svg>`,
  },

  // ==========================================
  // 7. SHAPES, ARROWS & CALLOUTS (Chỉ dẫn, Mũi tên)
  // ==========================================
  {
    id: 'shape-neon-arrow-right',
    name: 'Mũi tên Neon Chỉ Phải',
    category: 'shape',
    defaultWidth: 140,
    defaultHeight: 90,
    svg: `<svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 45 L95 45 M95 45 L65 20 M95 45 L65 70" stroke="#EC4899" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'shape-arrow-curved',
    name: 'Mũi tên uốn lượn vàng',
    category: 'shape',
    defaultWidth: 130,
    defaultHeight: 110,
    svg: `<svg viewBox="0 0 130 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 90 C30 30 70 20 105 40" stroke="#FBBF24" stroke-width="10" stroke-linecap="round"/>
      <path d="M105 40 L85 24 M105 40 L108 14" stroke="#FBBF24" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'shape-speech-bubble',
    name: 'Bong bóng thoại Comic',
    category: 'shape',
    defaultWidth: 160,
    defaultHeight: 120,
    svg: `<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 15 C15 7 22 0 30 0 L130 0 C138 0 145 7 145 15 L145 75 C145 83 138 90 130 90 L60 90 L35 115 L40 90 L30 90 C22 90 15 83 15 75 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="4"/>
    </svg>`,
  },
  {
    id: 'shape-heart-burst',
    name: 'Trái tim nổ tung (Burst)',
    category: 'shape',
    defaultWidth: 130,
    defaultHeight: 130,
    svg: `<svg viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Radiating lines -->
      <line x1="65" y1="10" x2="65" y2="24" stroke="#FB7185" stroke-width="4" stroke-linecap="round"/>
      <line x1="105" y1="25" x2="95" y2="35" stroke="#FB7185" stroke-width="4" stroke-linecap="round"/>
      <line x1="120" y1="65" x2="106" y2="65" stroke="#FB7185" stroke-width="4" stroke-linecap="round"/>
      <line x1="25" y1="25" x2="35" y2="35" stroke="#FB7185" stroke-width="4" stroke-linecap="round"/>
      <line x1="10" y1="65" x2="24" y2="65" stroke="#FB7185" stroke-width="4" stroke-linecap="round"/>
      <!-- Heart -->
      <path d="M65 110 C40 85 20 68 20 50 C20 34 32 22 46 22 C56 22 62 28 65 34 C68 28 74 22 84 22 C98 22 110 34 110 50 C110 68 90 85 65 110 Z" fill="#F43F5E"/>
    </svg>`,
  },
  {
    id: 'shape-highlight-circle',
    name: 'Vòng tròn khoanh đỏ nhấn mạnh',
    category: 'shape',
    defaultWidth: 140,
    defaultHeight: 140,
    svg: `<svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 40 C50 10 120 15 125 65 C130 115 50 135 25 110 C-5 80 15 25 75 20 C110 18 135 45 130 80" stroke="#EF4444" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
  },
];
