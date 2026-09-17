// ไอคอน SVG วาดเอง ไม่ใช้โลโก้จริงของระบบขนส่งใด ๆ
function svgTrain(color) {
  return `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="8" width="28" height="26" rx="6" stroke="${color}" stroke-width="2.6"/>
    <line x1="10" y1="20" x2="38" y2="20" stroke="${color}" stroke-width="2.6"/>
    <circle cx="17" cy="34" r="3" fill="${color}"/>
    <circle cx="31" cy="34" r="3" fill="${color}"/>
    <line x1="16" y1="40" x2="12" y2="44" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>
    <line x1="32" y1="40" x2="36" y2="44" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`;
}

function svgBus(color) {
  return `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="12" width="32" height="20" rx="5" stroke="${color}" stroke-width="2.6"/>
    <line x1="8" y1="22" x2="40" y2="22" stroke="${color}" stroke-width="2.6"/>
    <line x1="16" y1="12" x2="16" y2="22" stroke="${color}" stroke-width="2.2"/>
    <line x1="32" y1="12" x2="32" y2="22" stroke="${color}" stroke-width="2.2"/>
    <circle cx="15" cy="35" r="3.4" fill="${color}"/>
    <circle cx="33" cy="35" r="3.4" fill="${color}"/>
  </svg>`;
}

function svgWalk(color) {
  return `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="10" r="4" fill="${color}"/>
    <path d="M24 16v10l-7 14M24 26l7 10M17 22l7-4 7 4" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;
}

function svgPin(color) {
  return `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 6c-7.2 0-13 5.8-13 13 0 9.7 13 23 13 23s13-13.3 13-23c0-7.2-5.8-13-13-13z" fill="${color}"/>
    <circle cx="24" cy="19" r="5" fill="#ffffff"/>
  </svg>`;
}

function svgSwap(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 4v13M7 17l-3-3M7 17l3-3" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M17 20V7M17 7l-3 3M17 7l3 3" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function svgChevron(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6l6 6-6 6" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function svgTicket(color) {
  return `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 18a4 4 0 0 1 0 8v6a2 2 0 0 0 2 2h32a2 2 0 0 0 2-2v-6a4 4 0 0 1 0-8v-6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v6z" stroke="${color}" stroke-width="2.4" stroke-linejoin="round"/>
    <line x1="28" y1="12" x2="28" y2="36" stroke="${color}" stroke-width="2" stroke-dasharray="3 3"/>
  </svg>`;
}

function svgClock(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="2"/>
    <path d="M12 7v5l3.5 2" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

function svgCoin(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="2"/>
    <text x="12" y="16" font-size="11" text-anchor="middle" fill="${color}" font-family="IBM Plex Sans">฿</text>
  </svg>`;
}

// QR แบบตัวอย่าง (ลวดลายสุ่มแต่คงที่ ไม่ใช่ QR ที่สแกนได้จริง) — ใช้เป็นภาพประกอบตั๋ว
function svgFakeQr(seed) {
  const size = 9;
  let rng = seed;
  const rand = () => { rng = (rng * 9301 + 49297) % 233280; return rng / 233280; };
  let cells = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const isFinder = (x < 2 && y < 2) || (x > size - 3 && y < 2) || (x < 2 && y > size - 3);
      const on = isFinder || rand() > 0.55;
      if (on) cells += `<rect x="${x}" y="${y}" width="1" height="1" fill="#121c24"/>`;
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="160" height="160" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border-radius:8px">${cells}</svg>`;
}

const modeIcon = { rail: svgTrain, bus: svgBus };

// ---------- ภาพประกอบหน้าแรก (วาดเองแบบ flat illustration ไม่ใช้ภาพถ่ายจริง) ----------

// ภาพฮีโร่: เส้นขอบฟ้าเมือง + รางรถไฟฟ้ายกระดับ + รถเมล์บนถนน
function svgHeroArt() {
  return `<svg viewBox="0 0 480 280" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#eaf3fa"/>
        <stop offset="100%" stop-color="#ffffff"/>
      </linearGradient>
    </defs>
    <rect width="480" height="280" fill="url(#skyGrad)"/>
    <circle cx="400" cy="55" r="28" fill="#ffe8cf" opacity="0.8"/>
    <g opacity="0.9">
      <rect x="20" y="150" width="34" height="90" fill="#cdddE6"/>
      <rect x="60" y="120" width="26" height="120" fill="#b9cddb"/>
      <rect x="92" y="165" width="30" height="75" fill="#cdddE6"/>
      <rect x="360" y="140" width="30" height="100" fill="#cdddE6"/>
      <rect x="394" y="110" width="26" height="130" fill="#b9cddb"/>
      <rect x="424" y="160" width="30" height="80" fill="#cdddE6"/>
    </g>
    <rect x="0" y="240" width="480" height="6" fill="#dfe7ec"/>
    <line x1="0" y1="196" x2="480" y2="196" stroke="#146C94" stroke-width="4"/>
    <rect x="40" y="188" width="4" height="16" fill="#146C94"/>
    <rect x="120" y="188" width="4" height="16" fill="#146C94"/>
    <rect x="200" y="188" width="4" height="16" fill="#146C94"/>
    <rect x="280" y="188" width="4" height="16" fill="#146C94"/>
    <rect x="360" y="188" width="4" height="16" fill="#146C94"/>
    <g transform="translate(150,160)">
      <rect x="0" y="0" width="130" height="38" rx="9" fill="#146C94"/>
      <rect x="8" y="7" width="26" height="18" rx="3" fill="#eaf6ff"/>
      <rect x="40" y="7" width="26" height="18" rx="3" fill="#eaf6ff"/>
      <rect x="72" y="7" width="26" height="18" rx="3" fill="#eaf6ff"/>
      <rect x="104" y="7" width="18" height="18" rx="3" fill="#0d5476"/>
      <circle cx="18" cy="34" r="5" fill="#0d3a51"/>
      <circle cx="112" cy="34" r="5" fill="#0d3a51"/>
    </g>
    <g transform="translate(250,208)">
      <rect x="0" y="0" width="86" height="34" rx="7" fill="#D97F2E"/>
      <rect x="8" y="6" width="20" height="14" rx="2" fill="#fff3e8"/>
      <rect x="34" y="6" width="20" height="14" rx="2" fill="#fff3e8"/>
      <rect x="60" y="6" width="16" height="14" rx="2" fill="#b25f1e"/>
      <circle cx="16" cy="30" r="5" fill="#7a3f10"/>
      <circle cx="70" cy="30" r="5" fill="#7a3f10"/>
    </g>
  </svg>`;
}

// ภาพประกอบการ์ดเส้นทางยอดนิยม — ภาพประกอบแบบ flat ไม่ใช้ภาพถ่ายจริง
function svgCardMall() {
  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="gMall" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2f6fed"/><stop offset="100%" stop-color="#146C94"/>
    </linearGradient></defs>
    <rect width="200" height="120" fill="url(#gMall)"/>
    <rect x="55" y="35" width="90" height="60" rx="4" fill="#ffffff" opacity="0.92"/>
    <rect x="65" y="45" width="18" height="22" fill="#2f6fed"/>
    <rect x="91" y="45" width="18" height="22" fill="#2f6fed"/>
    <rect x="117" y="45" width="18" height="22" fill="#2f6fed"/>
    <rect x="80" y="72" width="40" height="23" fill="#146C94"/>
    <rect x="30" y="95" width="140" height="6" fill="#ffffff" opacity="0.6"/>
  </svg>`;
}

function svgCardMarket() {
  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="gMarket" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2e9e4f"/><stop offset="100%" stop-color="#1e7a4c"/>
    </linearGradient></defs>
    <rect width="200" height="120" fill="url(#gMarket)"/>
    <path d="M45 55 L65 30 L85 55 Z" fill="#ffffff" opacity="0.92"/>
    <path d="M85 55 L105 30 L125 55 Z" fill="#eafff0" opacity="0.92"/>
    <path d="M125 55 L145 30 L165 55 Z" fill="#ffffff" opacity="0.92"/>
    <rect x="45" y="55" width="120" height="40" fill="#ffffff" opacity="0.85"/>
    <rect x="60" y="65" width="14" height="20" fill="#2e9e4f"/>
    <rect x="93" y="65" width="14" height="20" fill="#2e9e4f"/>
    <rect x="126" y="65" width="14" height="20" fill="#2e9e4f"/>
  </svg>`;
}

function svgCardMonument() {
  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="gMon" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7a3fd6"/><stop offset="100%" stop-color="#4f2494"/>
    </linearGradient></defs>
    <rect width="200" height="120" fill="url(#gMon)"/>
    <polygon points="100,20 112,80 88,80" fill="#ffffff" opacity="0.92"/>
    <rect x="80" y="80" width="40" height="10" fill="#ffffff" opacity="0.8"/>
    <rect x="60" y="90" width="80" height="8" fill="#ffffff" opacity="0.65"/>
    <circle cx="70" cy="45" r="4" fill="#ffffff" opacity="0.5"/>
    <circle cx="130" cy="55" r="3" fill="#ffffff" opacity="0.5"/>
  </svg>`;
}

function svgCardSkyline() {
  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="gSky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d97f2e"/><stop offset="100%" stop-color="#a85417"/>
    </linearGradient></defs>
    <rect width="200" height="120" fill="url(#gSky)"/>
    <rect x="40" y="55" width="20" height="45" fill="#ffffff" opacity="0.9"/>
    <rect x="65" y="35" width="24" height="65" fill="#ffffff" opacity="0.95"/>
    <rect x="94" y="60" width="18" height="40" fill="#ffffff" opacity="0.85"/>
    <rect x="117" y="45" width="22" height="55" fill="#ffffff" opacity="0.9"/>
    <rect x="144" y="65" width="18" height="35" fill="#ffffff" opacity="0.85"/>
    <rect x="0" y="100" width="200" height="6" fill="#ffffff" opacity="0.5"/>
  </svg>`;
}

const cardArt = { mall: svgCardMall, market: svgCardMarket, monument: svgCardMonument, skyline: svgCardSkyline };

// ภาพประกอบตกแต่งท้าย sidebar (เส้นขอบฟ้าเมืองเรียบ ๆ)
function svgSidebarSkyline() {
  return `<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="55" width="24" height="70" fill="#dbe6ee"/>
    <rect x="38" y="30" width="20" height="95" fill="#c7d6e0"/>
    <rect x="62" y="65" width="22" height="60" fill="#dbe6ee"/>
    <rect x="88" y="40" width="18" height="85" fill="#c7d6e0"/>
    <rect x="110" y="70" width="24" height="55" fill="#dbe6ee"/>
    <rect x="138" y="20" width="20" height="105" fill="#c7d6e0"/>
    <rect x="162" y="60" width="22" height="65" fill="#dbe6ee"/>
    <rect x="0" y="125" width="200" height="5" fill="#c7d6e0"/>
  </svg>`;
}

// ไอคอนเมนูฝั่งซ้าย
function svgNavSearch(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="6.5" stroke="${color}" stroke-width="2"/>
    <line x1="16" y1="16" x2="21" y2="21" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}
function svgNavList(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5" cy="6" r="1.6" fill="${color}"/><line x1="10" y1="6" x2="21" y2="6" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="5" cy="12" r="1.6" fill="${color}"/><line x1="10" y1="12" x2="21" y2="12" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="5" cy="18" r="1.6" fill="${color}"/><line x1="10" y1="18" x2="21" y2="18" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

function svgCalendar(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.5" y="5" width="17" height="15" rx="2.4" stroke="${color}" stroke-width="1.8"/>
    <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" stroke="${color}" stroke-width="1.8"/>
    <line x1="8" y1="3" x2="8" y2="7" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="16" y1="3" x2="16" y2="7" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

function svgStar(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3.5l2.6 5.6 6 0.7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6-4.4-4.1 6-0.7z" fill="${color}" stroke="${color}" stroke-width="1.2" stroke-linejoin="round"/>
  </svg>`;
}

function svgBothModes(color) {
  return `<svg viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="3" width="15" height="16" rx="4" stroke="${color}" stroke-width="1.8"/>
    <line x1="1" y1="11" x2="16" y2="11" stroke="${color}" stroke-width="1.6"/>
    <circle cx="5.5" cy="16.5" r="1.6" fill="${color}"/>
    <circle cx="11.5" cy="16.5" r="1.6" fill="${color}"/>
    <rect x="22" y="6" width="17" height="13" rx="3.4" stroke="${color}" stroke-width="1.8"/>
    <line x1="22" y1="10.5" x2="39" y2="10.5" stroke="${color}" stroke-width="1.6"/>
    <circle cx="26.5" cy="16" r="1.6" fill="${color}"/>
    <circle cx="34.5" cy="16" r="1.6" fill="${color}"/>
  </svg>`;
}

function svgHeart(color, filled) {
  const fill = filled ? color : "none";
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20s-7.5-4.6-10-9.3C0.3 7.4 2 4 5.4 4c2 0 3.4 1 4.6 2.6C11.2 5 12.6 4 14.6 4 18 4 19.7 7.4 18 10.7 19.5 15.4 12 20 12 20z" fill="${fill}" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
  </svg>`;
}

function svgShare(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="5" r="2.6" stroke="${color}" stroke-width="1.8"/>
    <circle cx="6" cy="12" r="2.6" stroke="${color}" stroke-width="1.8"/>
    <circle cx="18" cy="19" r="2.6" stroke="${color}" stroke-width="1.8"/>
    <line x1="8.3" y1="10.7" x2="15.7" y2="6.3" stroke="${color}" stroke-width="1.8"/>
    <line x1="8.3" y1="13.3" x2="15.7" y2="17.7" stroke="${color}" stroke-width="1.8"/>
  </svg>`;
}

function svgCompassNeedle(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9.5" stroke="${color}" stroke-width="1.6"/>
    <path d="M12 6l2.4 5.6L12 14l-2.4-2.4z" fill="${color}"/>
    <text x="12" y="4.5" font-size="5" text-anchor="middle" fill="${color}" font-weight="700">N</text>
  </svg>`;
}

function svgLightbulb(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18h6M10 21h4M8 14a4.5 4.5 0 1 1 8 0c0 1.8-1 2.6-1.6 3.4-.4.5-.6.9-.6 1.6H10.2c0-.7-.2-1.1-.6-1.6C9 16.6 8 15.8 8 14z" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
  </svg>`;
}

function svgTransfer(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8h13l-3-3M20 16H7l3 3" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function svgHome(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 11l8-7 8 7" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
  </svg>`;
}

function svgBriefcase(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="7" width="18" height="12" rx="2" stroke="${color}" stroke-width="1.8"/>
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="${color}" stroke-width="1.8"/>
    <line x1="3" y1="12" x2="21" y2="12" stroke="${color}" stroke-width="1.8"/>
  </svg>`;
}

function svgBuildingIcon(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="3" width="14" height="18" rx="1.4" stroke="${color}" stroke-width="1.8"/>
    <line x1="8.5" y1="7.5" x2="8.5" y2="7.5" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    <line x1="8" y1="7" x2="10" y2="7" stroke="${color}" stroke-width="1.6"/>
    <line x1="14" y1="7" x2="16" y2="7" stroke="${color}" stroke-width="1.6"/>
    <line x1="8" y1="11.5" x2="10" y2="11.5" stroke="${color}" stroke-width="1.6"/>
    <line x1="14" y1="11.5" x2="16" y2="11.5" stroke="${color}" stroke-width="1.6"/>
    <rect x="10" y="15.5" width="4" height="5.5" fill="${color}"/>
  </svg>`;
}

function svgBookmark(color, filled) {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.2L5 21V4.5a1 1 0 0 1 1-1z" fill="${filled ? color : "none"}" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
  </svg>`;
}

function svgDotsVertical(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="5" r="1.8" fill="${color}"/>
    <circle cx="12" cy="12" r="1.8" fill="${color}"/>
    <circle cx="12" cy="19" r="1.8" fill="${color}"/>
  </svg>`;
}

function svgTrendingChart(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="13" width="3.4" height="7" fill="${color}"/>
    <rect x="10.3" y="8" width="3.4" height="12" fill="${color}"/>
    <rect x="16.6" y="4" width="3.4" height="16" fill="${color}"/>
  </svg>`;
}

function svgLeaf(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 19c-1-6 2-13 14-14 1 12-6 15-14 14z" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M6 18c3-4 6-7 12-11" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;
}

function svgSearchSmall(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10.5" cy="10.5" r="6.5" stroke="${color}" stroke-width="1.8"/>
    <line x1="15.5" y1="15.5" x2="20.5" y2="20.5" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

function svgFullscreen(color) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

const routeIconOptions = [
  { key: "star", label: "ทั่วไป", icon: svgStar },
  { key: "home", label: "บ้าน", icon: svgHome },
  { key: "work", label: "ที่ทำงาน", icon: svgBriefcase },
  { key: "building", label: "สถานที่", icon: svgBuildingIcon }
];
