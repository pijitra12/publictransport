const costFns = {
  fastest: e => e.time,
  cheapest: e => e.fare,
  recommended: e => e.time * 1.5 + e.fare
};
const optLabel = { fastest: "เร็วที่สุด", cheapest: "ประหยัดที่สุด", recommended: "แนะนำ" };

function getParams() {
  const p = new URLSearchParams(window.location.search);
  return { from: p.get("from"), to: p.get("to"), opt: p.get("opt") || "recommended" };
}

function renderError() {
  document.getElementById("mainContent").innerHTML = `
    <div class="page-head">
      <div class="kicker">รายละเอียดการเดินทาง</div>
      <h1>ไม่พบข้อมูลเส้นทาง</h1>
      <p>กรุณาย้อนกลับไปค้นหาและเลือกเส้นทางใหม่อีกครั้ง</p>
    </div>
    <a class="next-link" href="index.html">← ไปค้นหาเส้นทาง</a>
  `;
}

function renderBreadcrumb(from, to) {
  return `
    <div class="page-breadcrumb">
      <a href="index.html">${svgHome("#5b6b78")} หน้าแรก</a>
      <span class="sep">/</span>
      <a href="index.html">ผลการค้นหา</a>
      <span class="sep">/</span>
      <a href="results.html?from=${from}&to=${to}">เลือกเส้นทาง</a>
      <span class="sep">/</span>
      <span class="current">รายละเอียดการเดินทาง</span>
    </div>
  `;
}

function legPill(leg) {
  const icon = modeIcon[leg.mode]("#ffffff");
  return `<span class="leg-pill" style="background:${leg.color}"><span class="icon-dot">${icon}</span>${leg.lineName.replace(/^รถไฟฟ้า|^รถเมล์/, "")} (${leg.numStops} ป้าย)</span>`;
}

function stepHtml(dotColor, iconSvg, title, sub, meta, platformNote) {
  return `
    <div class="itinerary-step">
      <div class="rail">
        <div class="dot" style="background:${dotColor}">${iconSvg}</div>
        <div class="connector"></div>
      </div>
      <div class="content">
        <div class="title">${title}</div>
        ${sub ? `<div class="sub">${sub}</div>` : ""}
        ${platformNote ? `<div class="meta">📍 ${platformNote}</div>` : ""}
      </div>
      ${meta ? `<div class="duration-badge" style="background:${dotColor}22;color:${dotColor}">${meta}</div>` : ""}
    </div>
  `;
}

function buildSteps(from, to, route) {
  let html = "";
  html += stepHtml("#146c94", svgPin("#ffffff"), `จุดเริ่มต้น: ${stationNames[from]}`, null, null);

  route.legs.forEach((leg, i) => {
    if (i > 0) {
      html += stepHtml("#5b6b78", svgWalk("#ffffff"),
        `เปลี่ยนสายที่ ${stationNames[leg.from]}`,
        "เดิน/รอเปลี่ยนสาย",
        `ประมาณ ${TRANSFER_TIME} นาที`);
    }
    const icon = modeIcon[leg.mode]("#ffffff");
    html += stepHtml(leg.color, icon,
      `${leg.mode === "rail" ? "ขึ้นรถไฟฟ้า" : "ขึ้นรถเมล์"} ${leg.lineName}`,
      `${stationNames[leg.from]} → ${stationNames[leg.to]}`,
      `${leg.numStops} ป้าย · ${leg.time} นาที`,
      leg.platform);
  });

  html += stepHtml("#d97f2e", svgPin("#ffffff"), `ถึงปลายทาง: ${stationNames[to]}`, null, null);
  return html;
}

function buildFareTable(route) {
  const rows = route.legs.map(leg =>
    `<tr><td>${leg.lineName} (${stationNames[leg.from]} → ${stationNames[leg.to]})</td><td>฿${leg.fare}</td></tr>`
  ).join("");
  return `<table class="fare-table">${rows}<tr class="total"><td>รวมทั้งหมด</td><td>฿${route.totalFare}</td></tr></table>`;
}

function ticketCode(from, to, opt) {
  const raw = `${from}-${to}-${opt}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  return "TRIP-" + hash.toString(36).toUpperCase().slice(0, 6);
}

function renderMapWithChrome(route) {
  const svg = renderStationMap("ticketMap", route, { compact: false });
  const panel = document.getElementById("mapPanel");
  document.querySelectorAll(".map-chrome-compass, .map-chrome-zoom, .map-chrome-legend").forEach(el => el.remove());

  const compass = document.createElement("div");
  compass.className = "map-chrome-compass";
  compass.innerHTML = svgCompassNeedle("#146c94");
  panel.appendChild(compass);

  const zoom = document.createElement("div");
  zoom.className = "map-chrome-zoom";
  zoom.innerHTML = `<button id="zoomIn">+</button><button id="zoomOut">−</button>`;
  panel.appendChild(zoom);

  const lineColors = {};
  route.legs.forEach(leg => { lineColors[leg.lineName] = leg.color; });
  const legend = document.createElement("div");
  legend.className = "map-chrome-legend";
  legend.innerHTML = Object.entries(lineColors).map(([name, color]) =>
    `<div class="legend-row"><span class="legend-dot" style="background:${color}"></span>${name}</div>`
  ).join("");
  panel.appendChild(legend);

  let scale = 1;
  const zoomBy = (factor) => {
    scale = Math.min(2.2, Math.max(0.55, scale * factor));
    const [x, y, w, h] = MAP_VIEWBOX.split(" ").map(Number);
    const cx = x + w / 2, cy = y + h / 2;
    const nw = w / scale, nh = h / scale;
    svg.setAttribute("viewBox", `${cx - nw / 2} ${cy - nh / 2} ${nw} ${nh}`);
  };
  document.getElementById("zoomIn").addEventListener("click", () => zoomBy(1.2));
  document.getElementById("zoomOut").addEventListener("click", () => zoomBy(1 / 1.2));
}

function tipTextFor(route) {
  if (route.transfers === 0) return "เส้นทางนี้ไม่ต้องเปลี่ยนสาย นั่งยาวไปจุดหมายได้เลย";
  return "คุณสามารถแตะที่แต่ละช่วงเพื่อดูรายละเอียดเพิ่มเติม เช่น เวลาเดินรถ ค่าโดยสาร และทางออกที่จุดเปลี่ยนสาย";
}

function render(from, to, opt) {
  const route = findBestRoute(from, to, costFns[opt]);
  if (!route) { renderError(); return; }

  document.getElementById("backToResults") && (document.getElementById("backToResults").href = `results.html?from=${from}&to=${to}`);
  document.getElementById("routeSummaryFoot").innerHTML = `${stationNames[from]}<br>→ ${stationNames[to]}`;

  const saved = isRouteSaved(from, to);
  const legsHtml = route.legs.map((leg, i) => (i > 0 ? `<span class="leg-sep">→</span>` : "") + legPill(leg)).join("");

  document.getElementById("mainContent").innerHTML = `
    ${renderBreadcrumb(from, to)}
    <div class="page-head-row">
      <div>
        <h1>${stationNames[from]} → ${stationNames[to]}</h1>
        <p style="color:var(--text-dim);font-size:1rem;margin:0">รวม ${route.totalTime} นาที · ฿${route.totalFare} · เปลี่ยนสาย ${route.transfers} ครั้ง — ดูขั้นตอนที่ช่วงด้านล่าง แล้วซื้อตั๋วได้เลย</p>
      </div>
      <div class="header-actions">
        <button class="header-btn ${saved ? "saved" : ""}" id="saveBtn">${svgHeart(saved ? "#c94f4f" : "#5b6b78", saved)} ${saved ? "บันทึกแล้ว" : "บันทึกเส้นทางนี้"}</button>
        <button class="header-btn" id="shareBtn">${svgShare("#121c24")} แชร์</button>
        <a class="buy-btn" id="topBuyBtn" href="#ticketPanel">${svgTicket("#ffffff")} ซื้อตั๋ว / ดูรายละเอียด</a>
      </div>
    </div>

    <div class="leg-row" style="margin-bottom:18px">${legsHtml}</div>

    <div class="panel">
      <div class="result-detail-grid">
        <div>
          <div class="page-breadcrumb" style="justify-content:space-between;margin-bottom:10px">
            <strong style="color:var(--text)">ผังเส้นทาง</strong>
            <button class="header-btn" id="fullscreenBtn" style="padding:6px 10px;font-size:0.78rem">${svgFullscreen("#121c24")} ดูแบบเต็มหน้าจอ</button>
          </div>
          <div class="map-panel" id="mapPanel">
            <div class="route-map-wrap large" id="ticketMap"></div>
          </div>
          <div class="map-caption">ผังตัวอย่าง ไม่ใช่มาตราส่วนภูมิศาสตร์จริง — เส้นสีคือช่วงที่คุณเดินทาง</div>
        </div>
        <div>
          <div class="page-breadcrumb" style="justify-content:space-between;margin-bottom:10px">
            <strong style="color:var(--text)">ขั้นตอนการเดินทาง</strong>
            <button class="header-btn" id="viewOnMapBtn" style="padding:6px 10px;font-size:0.78rem">${svgCompassNeedle("#121c24")} ดูบนแผนที่</button>
          </div>
          <div class="timeline-panel" id="stepsWrap">${buildSteps(from, to, route)}</div>
        </div>
      </div>

      <div class="tips-box">
        ${svgLightbulb("#146c94")}
        <div><div class="tips-title">เคล็ดลับการเดินทาง</div><div class="tips-text">${tipTextFor(route)}</div></div>
      </div>
    </div>

    <div class="panel" style="margin-top:20px" id="ticketPanel">
      <h3>ค่าโดยสารโดยประมาณ</h3>
      ${buildFareTable(route)}
      <button class="primary" id="buyBtn" style="width:100%;margin-top:16px">ซื้อตั๋วเที่ยวนี้</button>
    </div>

    <div class="bottom-bar">
      <a class="next-link" href="results.html?from=${from}&to=${to}">← กลับไปเลือกเส้นทาง</a>
    </div>

    <details class="reveal">
      <summary>สำหรับทำรายงาน: Tree + Weighted Graph ทำงานร่วมกันตรงไหนในหน้านี้</summary>
      <div class="reveal-body">
        <p style="color:var(--text-dim);font-size:0.88rem">
          ต้นทาง/ปลายทางที่เลือกมาจาก Tree ของสถานี (หน้า 1) ส่วนลำดับขั้นตอนและราคาที่เห็นทั้งหมดคำนวณจาก
          เส้นทางที่ได้จาก Dijkstra บน Weighted Graph (หน้า 2) โดยตรง — หน้านี้แค่ "แปลผล" เส้นทางที่คำนวณไว้
          ให้อ่านง่ายแบบเดียวกับแอปนำทางจริง
        </p>
        <div class="code-block" id="codeBlock"></div>
      </div>
    </details>
  `;

  renderMapWithChrome(route);
  highlightCode(route);

  document.getElementById("buyBtn").addEventListener("click", () => showTicket(from, to, opt, route));
  document.getElementById("topBuyBtn").addEventListener("click", (e) => {
    e.preventDefault();
    showTicket(from, to, opt, route);
    document.getElementById("ticketPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.getElementById("saveBtn").addEventListener("click", () => {
    openSaveModal(from, to, () => render(from, to, opt));
  });
  document.getElementById("shareBtn").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    const original = btn.innerHTML;
    btn.innerHTML = `${svgShare("#1e7a4c")} คัดลอกแล้ว`;
    setTimeout(() => { btn.innerHTML = original; }, 1600);
  });
  document.getElementById("viewOnMapBtn").addEventListener("click", () => {
    document.getElementById("mapPanel").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  document.getElementById("fullscreenBtn").addEventListener("click", () => {
    document.getElementById("mapPanel").classList.toggle("map-fullscreen");
  });
}

function showTicket(from, to, opt, route) {
  const code = ticketCode(from, to, opt);
  const seed = [...code].reduce((a, c) => a + c.charCodeAt(0), 0);
  document.getElementById("ticketPanel").innerHTML = `
    <div class="ticket-card">
      <div class="chip accent" style="margin-bottom:10px">ซื้อตั๋วสำเร็จ (ตัวอย่าง)</div>
      <h3 style="margin-bottom:2px">${stationNames[from]} → ${stationNames[to]}</h3>
      <div style="color:var(--text-dim);font-size:0.88rem">${route.legs.map(l => l.lineName).join(" + ")}</div>
      <div class="qr-wrap">${svgFakeQr(seed)}</div>
      <div class="ticket-code">${code}</div>
      <div style="margin-top:14px;font-size:1.3rem;font-weight:600">฿${route.totalFare}</div>
      <p style="color:var(--text-dim);font-size:0.8rem;margin-top:14px">
        นี่คือตั๋วตัวอย่างสำหรับสาธิตเท่านั้น ไม่ใช่ตั๋วเดินทางจริงและ QR นี้สแกนใช้งานไม่ได้
      </p>
    </div>
  `;
}

function highlightCode(route) {
  const block = document.getElementById("codeBlock");
  const obj = route.legs.map(l => ({ สาย: l.lineName, จาก: stationNames[l.from], ไป: stationNames[l.to], นาที: l.time, บาท: l.fare }));
  const json = JSON.stringify(obj, null, 2);
  block.innerHTML = json.replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/"([ก-๙a-zA-Z]+)":/g, '<span class="k">"$1"</span>:');
}

const { from, to, opt } = getParams();
if (!from || !to || !stationNames[from] || !stationNames[to]) {
  renderError();
} else {
  render(from, to, opt);
}
