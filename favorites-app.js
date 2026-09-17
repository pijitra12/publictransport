let sortMode = "usage"; // usage | recent | alpha
let searchQuery = "";
let openKebabIdx = null;

function computeCardData(saved) {
  const route = findBestRoute(saved.from, saved.to, e => e.time);
  const count = getSearchCount(saved.from, saved.to);
  return { saved, route, count };
}

function getAllCardData() {
  return getSavedRoutes().map(computeCardData).filter(c => c.route);
}

function sortCards(cards) {
  const sorted = [...cards];
  if (sortMode === "usage") sorted.sort((a, b) => b.count - a.count);
  else if (sortMode === "recent") sorted.sort((a, b) => b.saved.createdAt - a.saved.createdAt);
  else if (sortMode === "alpha") sorted.sort((a, b) => a.saved.label.localeCompare(b.saved.label, "th"));
  return sorted;
}

function filterCards(cards) {
  if (!searchQuery.trim()) return cards;
  const q = searchQuery.trim().toLowerCase();
  return cards.filter(c =>
    c.saved.label.toLowerCase().includes(q) ||
    stationNames[c.saved.from].toLowerCase().includes(q) ||
    stationNames[c.saved.to].toLowerCase().includes(q)
  );
}

function renderStatsRow(cards) {
  const total = cards.length;
  let mostUsed = null;
  cards.forEach(c => { if (!mostUsed || c.count > mostUsed.count) mostUsed = c; });
  const directCount = cards.filter(c => c.route.transfers === 0).length;

  return `
    <div class="fav-stats-row">
      <div class="fav-stat-card">
        <div class="icon-wrap" style="background:var(--primary-soft);color:var(--primary)">${svgBookmark("currentColor", false)}</div>
        <div><div class="stat-value">${total}</div><div class="stat-label">เส้นทางโปรด</div></div>
      </div>
      <div class="fav-stat-card">
        <div class="icon-wrap" style="background:var(--accent-soft);color:var(--accent)">${svgTrendingChart("currentColor")}</div>
        <div>
          <div class="stat-value" style="font-size:1rem">${mostUsed ? `${stationNames[mostUsed.saved.from]} → ${stationNames[mostUsed.saved.to]}` : "ยังไม่มีข้อมูล"}</div>
          <div class="stat-label">${mostUsed ? `ใช้บ่อยที่สุด · ค้นหาแล้ว ${mostUsed.count} ครั้ง` : "ใช้บ่อยที่สุด"}</div>
        </div>
      </div>
      <div class="fav-stat-card">
        <div class="icon-wrap" style="background:rgba(46,158,79,0.14);color:var(--bus)">${svgLeaf("currentColor")}</div>
        <div><div class="stat-value">${directCount}</div><div class="stat-label">เส้นทางตรง ไม่ต้องเปลี่ยนสาย</div></div>
      </div>
    </div>
  `;
}

function iconFor(key) {
  const opt = routeIconOptions.find(o => o.key === key) || routeIconOptions[0];
  return opt.icon("currentColor");
}

function renderCard(card, idx) {
  const { saved, route, count } = card;
  const legsHtml = route.legs.map((leg, i) => (i > 0 ? `<span class="leg-sep">→</span>` : "") + legPillSmall(leg)).join("");
  const mapId = `favMap${idx}`;

  const card_ = document.createElement("div");
  card_.className = "fav-route-card";
  card_.innerHTML = `
    <div class="icon-wrap">${iconFor(saved.icon)}</div>
    <div class="fav-route-info">
      <div class="route-label">${saved.label}</div>
      <div class="route-stations">${stationNames[saved.from]} → ${stationNames[saved.to]}</div>
      <div class="leg-row">${legsHtml}</div>
    </div>
    <div class="fav-mini-map" id="${mapId}"></div>
    <div class="fav-stats-inline">
      <span><span class="val">${route.totalTime} นาที</span>เวลาเดินทาง</span>
      <span><span class="val">฿${route.totalFare}</span>ค่าโดยสาร</span>
      <span><span class="val">${route.transfers === 0 ? "เดินทางตรง" : `เปลี่ยน ${route.transfers} ครั้ง`}</span>${count > 0 ? `ค้นหาแล้ว ${count} ครั้ง` : "ยังไม่เคยค้นหา"}</span>
    </div>
    <div class="fav-actions">
      <span class="fav-saved-chip">${svgHeart("currentColor", true)} บันทึกแล้ว</span>
      <button class="kebab-btn" id="kebabBtn${idx}">${svgDotsVertical("#5b6b78")}</button>
      <div class="kebab-menu hidden" id="kebabMenu${idx}">
        <button id="renameBtn${idx}">แก้ไขชื่อ/ไอคอน</button>
        <button class="danger" id="deleteBtn${idx}">ลบออกจากเส้นทางโปรด</button>
      </div>
      <a class="fav-btn-detail" href="results.html?from=${saved.from}&to=${saved.to}">ดูรายละเอียด</a>
      <a class="fav-btn-use" href="ticket.html?from=${saved.from}&to=${saved.to}&opt=recommended">${svgChevron("#ffffff")} ใช้เส้นทางนี้</a>
    </div>
  `;
  return card_;
}

function legPillSmall(leg) {
  const icon = modeIcon[leg.mode]("#ffffff");
  return `<span class="leg-pill" style="background:${leg.color};font-size:0.76rem;padding:3px 9px 3px 4px"><span class="icon-dot" style="width:16px;height:16px">${icon}</span>${leg.lineName.replace(/^รถไฟฟ้า|^รถเมล์/, "")}</span>`;
}

function renderEmptyState() {
  document.getElementById("mainContent").innerHTML = `
    <div class="page-head">
      <div class="kicker">เส้นทางโปรด</div>
      <h1>${svgHeart("#c94f4f", true)} เส้นทางโปรด</h1>
      <p>เส้นทางที่คุณบันทึกไว้ เพื่อค้นหาและเดินทางได้รวดเร็ว</p>
    </div>
    <div class="panel fav-empty">
      <div class="icon-wrap">${svgBookmark("#5b6b78", false)}</div>
      <h3>ยังไม่มีเส้นทางโปรด</h3>
      <p style="color:var(--text-dim)">ไปที่หน้าผลการค้นหา แล้วกด "บันทึกเส้นทาง" เพื่อเพิ่มเส้นทางโปรดเส้นแรกของคุณ</p>
      <a class="next-link" href="index.html">← ไปค้นหาเส้นทาง</a>
    </div>
  `;
}

function closeAllKebabs() {
  document.querySelectorAll(".kebab-menu").forEach(m => m.classList.add("hidden"));
  openKebabIdx = null;
}

function renderList() {
  const all = getAllCardData();
  if (!all.length) { renderEmptyState(); return; }

  const filtered = filterCards(sortCards(all));

  document.getElementById("mainContent").innerHTML = `
    <div class="page-breadcrumb">
      <a href="index.html">${svgHome("#5b6b78")} หน้าแรก</a>
      <span class="sep">/</span>
      <span class="current">เส้นทางโปรด</span>
    </div>
    <div class="page-head">
      <h1>${svgHeart("#c94f4f", true)} เส้นทางโปรด</h1>
      <p>เส้นทางที่คุณบันทึกไว้ เพื่อค้นหาและเดินทางได้รวดเร็ว</p>
    </div>
    ${renderStatsRow(all)}
    <div class="fav-controls-row">
      <select id="sortSelect">
        <option value="usage">เรียงตาม: ใช้บ่อยที่สุด</option>
        <option value="recent">เรียงตาม: บันทึกล่าสุด</option>
        <option value="alpha">เรียงตาม: ชื่อ A-Z</option>
      </select>
      <div class="fav-search-wrap">
        ${svgSearchSmall("#5b6b78")}
        <input type="text" id="searchInput" placeholder="ค้นหาเส้นทางโปรด..." value="${searchQuery}">
      </div>
    </div>
    <div id="cardList"></div>
  `;

  document.getElementById("sortSelect").value = sortMode;
  const list = document.getElementById("cardList");
  filtered.forEach((card, idx) => {
    const el = renderCard(card, idx);
    list.appendChild(el);
    renderStationMap(`favMap${idx}`, card.route, { compact: true });
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    sortMode = e.target.value;
    renderList();
  });
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderList();
  });

  filtered.forEach((card, idx) => {
    document.getElementById(`kebabBtn${idx}`).addEventListener("click", (e) => {
      e.stopPropagation();
      const menu = document.getElementById(`kebabMenu${idx}`);
      const wasOpen = openKebabIdx === idx;
      closeAllKebabs();
      if (!wasOpen) { menu.classList.remove("hidden"); openKebabIdx = idx; }
    });
    document.getElementById(`renameBtn${idx}`).addEventListener("click", () => {
      closeAllKebabs();
      openSaveModal(card.saved.from, card.saved.to, () => renderList());
    });
    document.getElementById(`deleteBtn${idx}`).addEventListener("click", () => {
      closeAllKebabs();
      removeSavedRoute(card.saved.from, card.saved.to);
      renderList();
    });
  });
}

document.addEventListener("click", closeAllKebabs);
document.getElementById("skylineArt").innerHTML = svgSidebarSkyline();
renderList();
