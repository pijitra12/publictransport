const costFns = {
  fastest: e => e.time,
  cheapest: e => e.fare,
  recommended: e => e.time * 1.5 + e.fare
};
const badgeLabel = { fastest: "เร็วที่สุด", cheapest: "ประหยัดที่สุด", recommended: "แนะนำ" };
const badgeOrder = ["recommended", "fastest", "cheapest"];

function getParams() {
  const p = new URLSearchParams(window.location.search);
  return { from: p.get("from"), to: p.get("to") };
}

function legSignature(result) {
  return result.legs.map(l => `${l.line}:${l.from}-${l.to}`).join("|");
}

function computeOptions(from, to) {
  const raw = {};
  badgeOrder.forEach(key => { raw[key] = findBestRoute(from, to, costFns[key]); });

  const grouped = {};
  badgeOrder.forEach(key => {
    const r = raw[key];
    if (!r) return;
    const sig = legSignature(r);
    if (!grouped[sig]) grouped[sig] = { result: r, badges: [] };
    grouped[sig].badges.push(key);
  });

  return Object.values(grouped).sort((a, b) => a.result.totalTime - b.result.totalTime);
}

function renderError(message) {
  document.getElementById("mainContent").innerHTML = `
    <div class="page-head">
      <div class="kicker">เลือกเส้นทาง</div>
      <h1>หาเส้นทางไม่เจอ</h1>
      <p>${message}</p>
    </div>
    <a class="next-link" href="index.html">← กลับไปค้นหาใหม่</a>
  `;
}

function renderBreadcrumb(from, to) {
  return `
    <div class="page-breadcrumb">
      <a href="index.html">${svgHome("#5b6b78")} หน้าแรก</a>
      <span class="sep">/</span>
      <a href="index.html">ผลการค้นหา</a>
      <span class="sep">/</span>
      <span class="current">เลือกเส้นทาง</span>
    </div>
  `;
}

function legPill(leg) {
  const icon = modeIcon[leg.mode]("#ffffff");
  return `<span class="leg-pill" style="background:${leg.color}"><span class="icon-dot">${icon}</span>${leg.lineName.replace(/^รถไฟฟ้า|^รถเมล์/, "")} (${leg.numStops} ป้าย)</span>`;
}

function bestBadgeLabel(option) {
  if (option.badges.length === badgeOrder.length) return "แนะนำเส้นทางที่ดีที่สุด (เร็วสุด+ประหยัดสุด)";
  if (option.badges.includes("recommended")) return "แนะนำเส้นทางที่ดีที่สุด";
  return option.badges.map(b => badgeLabel[b]).join(" + ");
}

function renderHeroPanel(option, from, to) {
  const r = option.result;
  const saved = isRouteSaved(from, to);
  const legsHtml = r.legs.map((leg, i) => (i > 0 ? `<span class="leg-sep">→</span>` : "") + legPill(leg)).join("");

  return `
    <div class="route-hero-panel">
      <div class="best-badge">${svgStar("#1e7a4c")} ${bestBadgeLabel(option)}</div>

      <div class="stat-pill-row">
        <div class="stat-pill">${svgClock("#146c94")}<span><span class="pill-label">เวลารวม</span><span class="pill-value">${r.totalTime} นาที</span></span></div>
        <div class="stat-pill">${svgCoin("#d97f2e")}<span><span class="pill-label">ค่าเดินทางโดยประมาณ</span><span class="pill-value">฿${r.totalFare}</span></span></div>
        <div class="stat-pill">${svgTransfer("#5b6b78")}<span><span class="pill-label">การเปลี่ยนสาย</span><span class="pill-value">${r.transfers === 0 ? "ไม่ต้องเปลี่ยนสาย" : `เปลี่ยนสาย ${r.transfers} ครั้ง`}</span></span></div>
        <div class="stat-pill grow"></div>
        <button class="save-btn ${saved ? "saved" : ""}" id="saveBtn">${svgHeart(saved ? "#c94f4f" : "#5b6b78", saved)} ${saved ? "บันทึกแล้ว" : "บันทึกเส้นทาง"}</button>
        <a class="buy-btn" id="buyLink" href="ticket.html?from=${from}&to=${to}&opt=${option.badges[0]}">${svgTicket("#ffffff")} ซื้อตั๋ว / ดูรายละเอียด</a>
      </div>

      <div class="leg-row" style="margin-bottom:16px">${legsHtml}</div>

      <div class="result-detail-grid">
        <div class="map-panel" id="mapPanel">
          <div class="route-map-wrap large" id="resultMap"></div>
        </div>
        <div class="timeline-panel" id="timelineWrap"></div>
      </div>

      <div class="tips-box">
        ${svgLightbulb("#146c94")}
        <div>
          <div class="tips-title">เคล็ดลับการเดินทาง</div>
          <div class="tips-text">${tipTextFor(r)}</div>
        </div>
      </div>
    </div>
  `;
}

function tipTextFor(r) {
  if (r.transfers === 0) return "เส้นทางนี้ไม่ต้องเปลี่ยนสาย นั่งยาวไปจุดหมายได้เลย";
  return "คุณสามารถแตะที่แต่ละช่วงเพื่อดูรายละเอียดเพิ่มเติม เช่น เวลาเดินรถ ค่าโดยสาร และทางออกที่จุดเปลี่ยนสาย";
}

// ---------- Timeline พร้อมเวลานาฬิกาจริง (สะสมจากเวลาเริ่มต้น) ----------
function pad2(n) { return n < 10 ? `0${n}` : `${n}`; }

function timelineRow(time, dotColor, iconSvg, title, sub, durationText, durationTint) {
  return `
    <div class="itinerary-step">
      <div class="step-time mono">${time}</div>
      <div class="rail">
        <div class="dot" style="background:${dotColor}">${iconSvg}</div>
        <div class="connector"></div>
      </div>
      <div class="content">
        <div class="title">${title}</div>
        ${sub ? `<div class="sub">${sub}</div>` : ""}
      </div>
      ${durationText ? `<div class="duration-badge" style="background:${durationTint}22;color:${durationTint}">${durationText}</div>` : ""}
    </div>
  `;
}

function buildTimeline(from, to, route) {
  const now = new Date();
  let mins = now.getHours() * 60 + now.getMinutes();
  const fmt = () => `${pad2(Math.floor(mins / 60) % 24)}:${pad2(mins % 60)}`;

  let html = timelineRow(fmt(), "#146c94", svgPin("#ffffff"), stationNames[from], "จุดเริ่มต้น", null, null);

  route.legs.forEach((leg, i) => {
    if (i > 0) {
      html += timelineRow(fmt(), "#5b6b78", svgWalk("#ffffff"), stationNames[leg.from], "เดิน/รอเปลี่ยนสาย", `เดินประมาณ ${TRANSFER_TIME} นาที`, "#5b6b78");
      mins += TRANSFER_TIME;
    }
    const icon = modeIcon[leg.mode]("#ffffff");
    html += timelineRow(fmt(), leg.color, icon, stationNames[leg.from],
      `${leg.mode === "rail" ? "ขึ้น BTS" : "ขึ้นรถเมล์"} ${leg.lineName} (ไป${stationNames[leg.to]})`,
      `ประมาณ ${leg.time} นาที`, leg.color);
    mins += leg.time;
  });

  html += timelineRow(fmt(), "#c94f4f", svgPin("#ffffff"), stationNames[to], "ถึงจุดหมายปลายทาง", `รวมทั้งหมด ${route.totalTime} นาที`, "#c94f4f");
  return html;
}

// ---------- แผนที่ + ปุ่มควบคุม (เข็มทิศ/ซูม/legend) ----------
function renderMapWithChrome(route) {
  const svg = renderStationMap("resultMap", route, { compact: false });
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

function renderAltRoutes(rest, from, to, onPick) {
  if (!rest.length) return "";
  const rows = rest.map((opt, idx) => {
    const r = opt.result;
    const legsHtml = r.legs.map((leg, i) => (i > 0 ? `<span class="leg-sep">→</span>` : "") + legPill(leg)).join("");
    return `
      <div class="alt-route-row" data-idx="${idx}">
        <span class="chip">${opt.badges.map(b => badgeLabel[b]).join(" + ")}</span>
        <strong>${r.totalTime} นาที</strong>
        <span class="price-from">฿${r.totalFare}</span>
        <span style="color:var(--text-dim);font-size:0.84rem">${r.transfers === 0 ? "ไม่เปลี่ยนสาย" : `เปลี่ยนสาย ${r.transfers} ครั้ง`}</span>
        <div class="leg-row">${legsHtml}</div>
      </div>
    `;
  }).join("");
  return `<div class="alt-routes-section"><h3>เส้นทางอื่นที่แนะนำ</h3>${rows}</div>`;
}

function renderBottomBar(from, to) {
  return `
    <div class="bottom-bar">
      <a class="next-link" href="index.html">← กลับไปค้นหาเส้นทางใหม่</a>
      <button class="share-btn" id="shareBtn">${svgShare("#121c24")} แชร์เส้นทางนี้</button>
    </div>
  `;
}

function highlightCode(from, to, options) {
  const block = document.getElementById("codeBlock");
  const sample = options[0].result;
  const obj = {
    ต้นทาง: stationNames[from],
    ปลายทาง: stationNames[to],
    ตัวอย่างผลลัพธ์: { เวลารวมนาที: sample.totalTime, ค่าโดยสารบาท: sample.totalFare, จำนวนครั้งที่เปลี่ยนสาย: sample.transfers }
  };
  const json = JSON.stringify(obj, null, 2);
  block.innerHTML = json.replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/"([ก-๙a-zA-Z]+)":/g, '<span class="k">"$1"</span>:');
}

let allOptions = [];
let primaryIdx = 0;

function renderAll(from, to) {
  const primary = allOptions[primaryIdx];
  const rest = allOptions.filter((_, i) => i !== primaryIdx);

  document.getElementById("mainContent").innerHTML = `
    ${renderBreadcrumb(from, to)}
    <div class="page-head">
      <h1>${stationNames[from]} → ${stationNames[to]}</h1>
      <p>พบ ${allOptions.length} เส้นทางที่แนะนำ เลือกเส้นทางที่ถูกใจเพื่อดูรายละเอียดการเดินทางแบบทีละขั้นและซื้อตั๋ว</p>
    </div>
    ${renderHeroPanel(primary, from, to)}
    ${renderAltRoutes(rest, from, to)}
    ${renderBottomBar(from, to)}
    <details class="reveal">
      <summary>สำหรับทำรายงาน: หลักการ Weighted Graph ที่ใช้ในหน้านี้</summary>
      <div class="reveal-body">
        <p style="color:var(--text-dim);font-size:0.88rem">
          สถานี+สายที่ให้บริการ คือ Vertex ("state") ช่วงระหว่างป้ายที่ติดกันคือ Edge ที่มีน้ำหนัก 2 แบบ
          (เวลา/ค่าโดยสาร) และมี edge พิเศษสำหรับ "เปลี่ยนสาย" ที่สถานีเดียวกัน หน้านี้รัน <strong>Dijkstra</strong>
          3 รอบด้วยฟังก์ชันน้ำหนักต่างกัน (นาทีล้วน / บาทล้วน / ผสม) จึงได้ผลลัพธ์ต่างกันจริง ไม่ได้ผูกคำตอบไว้
        </p>
        <div class="code-block" id="codeBlock"></div>
      </div>
    </details>
  `;

  document.getElementById("timelineWrap").innerHTML = buildTimeline(from, to, primary.result);
  renderMapWithChrome(primary.result);
  highlightCode(from, to, allOptions);

  const navTicket = document.getElementById("navTicket");
  navTicket.href = `ticket.html?from=${from}&to=${to}&opt=${primary.badges[0]}`;
  navTicket.classList.remove("disabled");

  document.getElementById("saveBtn").addEventListener("click", () => {
    openSaveModal(from, to, () => renderAll(from, to));
  });

  document.getElementById("shareBtn").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    btn.classList.add("copied");
    btn.innerHTML = `${svgShare("#1e7a4c")} คัดลอกลิงก์แล้ว`;
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = `${svgShare("#121c24")} แชร์เส้นทางนี้`;
    }, 1600);
  });

  document.querySelectorAll(".alt-route-row").forEach(row => {
    row.addEventListener("click", () => {
      const idx = Number(row.dataset.idx);
      const actualIdx = allOptions.findIndex(o => o === rest[idx]);
      primaryIdx = actualIdx;
      renderAll(from, to);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderResults(from, to) {
  document.getElementById("routeSummaryFoot").innerHTML = `${stationNames[from]}<br>→ ${stationNames[to]}`;
  incrementSearchCount(from, to);
  allOptions = computeOptions(from, to);
  primaryIdx = 0;

  if (!allOptions.length) {
    renderError(`ยังไม่มีเส้นทางเชื่อมระหว่าง ${stationNames[from]} กับ ${stationNames[to]} ในระบบตัวอย่างนี้`);
    return;
  }
  renderAll(from, to);
}

const { from, to } = getParams();
if (!from || !to || !stationNames[from] || !stationNames[to]) {
  renderError("ไม่พบต้นทางหรือปลายทางที่เลือก กรุณาค้นหาใหม่อีกครั้ง");
} else {
  renderResults(from, to);
}
