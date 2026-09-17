let selection = { origin: null, dest: null };
let pickerTarget = null;
let pickerPath = [stationTree];
let modeFilter = null; // null = ทุกระบบ, "rail", "bus"

const popularRoutes = [
  { from: "siam", to: "mochit", art: "mall" },
  { from: "chatuchak", to: "siam", art: "market" },
  { from: "anusawari", to: "siam", art: "monument" },
  { from: "chongnonsi", to: "siam", art: "skyline" }
];

const modeColorFor = (node) => node.type === "line" ? node.color : (node.type === "station" ? lines[node.line].color : "#5b6b78");

function iconForNode(node) {
  if (node.type === "root") return svgPin("#5b6b78");
  if (node.type === "mode") return node.id === "rail" ? svgTrain("#146c94") : svgBus("#146c94");
  if (node.type === "line") return (lines[node.id].mode === "rail" ? svgTrain(node.color) : svgBus(node.color));
  return svgPin(modeColorFor(node));
}

function openPicker(target) {
  pickerTarget = target;
  if (modeFilter === "rail" || modeFilter === "bus") {
    const modeNode = stationTree.children.find(c => c.id === modeFilter);
    pickerPath = modeNode ? [stationTree, modeNode] : [stationTree];
  } else {
    pickerPath = [stationTree];
  }
  document.getElementById("pickerTitle").textContent = target === "origin" ? "เลือกสถานีต้นทาง" : "เลือกสถานีปลายทาง";
  document.getElementById("pickerOverlay").classList.remove("hidden");
  renderPicker();
}

function closePicker() {
  document.getElementById("pickerOverlay").classList.add("hidden");
}

function renderPickerBreadcrumb() {
  const bc = document.getElementById("pickerBreadcrumb");
  bc.innerHTML = "";
  pickerPath.forEach((node, i) => {
    if (i > 0) {
      const sep = document.createElement("span");
      sep.className = "sep";
      sep.textContent = "/";
      bc.appendChild(sep);
    }
    const btn = document.createElement("button");
    btn.textContent = node.name;
    if (i === pickerPath.length - 1) btn.className = "current";
    else btn.addEventListener("click", () => { pickerPath = pickerPath.slice(0, i + 1); renderPicker(); });
    bc.appendChild(btn);
  });
}

function renderPickerList() {
  const list = document.getElementById("pickerList");
  list.innerHTML = "";
  const node = pickerPath[pickerPath.length - 1];
  (node.children || []).forEach(child => {
    const item = document.createElement("div");
    item.className = "picker-item";
    const bg = child.type === "station" ? "transparent" : "var(--bg-panel-raised)";
    const sub = child.type === "station" ? linesServing(child.id).join(" · ") : (child.children ? `${child.children.length} รายการ` : "");
    item.innerHTML = `
      <div class="icon-wrap" style="background:${bg}">${iconForNode(child)}</div>
      <div>
        <div class="item-name">${child.name}</div>
        ${sub ? `<div class="item-sub">${sub}</div>` : ""}
      </div>
      ${child.type !== "station" ? `<span class="chevron">${svgChevron("#5b6b78")}</span>` : ""}
    `;
    item.addEventListener("click", () => {
      if (child.type === "station") {
        selection[pickerTarget] = child.id;
        updateFieldDisplay(pickerTarget);
        closePicker();
        updateSearchBtn();
      } else {
        pickerPath = [...pickerPath, child];
        renderPicker();
      }
    });
    list.appendChild(item);
  });
}

function renderPicker() {
  renderPickerBreadcrumb();
  renderPickerList();
}

function updateFieldDisplay(target) {
  const el = document.getElementById(target === "origin" ? "originValue" : "destValue");
  const id = selection[target];
  if (id) {
    el.textContent = stationNames[id];
    el.classList.remove("placeholder");
  } else {
    el.textContent = target === "origin" ? "เลือกสถานีหรือป้ายต้นทาง" : "เลือกสถานีหรือป้ายปลายทาง";
    el.classList.add("placeholder");
  }
}

function updateSearchBtn() {
  const btn = document.getElementById("searchBtn");
  btn.disabled = !(selection.origin && selection.dest && selection.origin !== selection.dest);
}

function swapSelection() {
  [selection.origin, selection.dest] = [selection.dest, selection.origin];
  updateFieldDisplay("origin");
  updateFieldDisplay("dest");
  updateSearchBtn();
}

function renderSuggestions() {
  const suggestions = [
    ["anusawari", "siam"],
    ["chatuchak", "siam"],
    ["mochit", "chongnonsi"]
  ];
  const wrap = document.getElementById("suggestionChips");
  wrap.innerHTML = "";
  suggestions.forEach(([from, to]) => {
    const chip = document.createElement("div");
    chip.className = "suggestion-chip";
    chip.textContent = `${stationNames[from]} → ${stationNames[to]}`;
    chip.addEventListener("click", () => {
      selection.origin = from;
      selection.dest = to;
      updateFieldDisplay("origin");
      updateFieldDisplay("dest");
      updateSearchBtn();
    });
    wrap.appendChild(chip);
  });
}

function highlightCode() {
  const block = document.getElementById("codeBlock");
  const json = JSON.stringify(stationTree, null, 2);
  const escaped = json.replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/"([a-zA-Z]+)":/g, '<span class="k">"$1"</span>:');
  block.innerHTML = escaped;
}

function setupModeTabs() {
  const tabIcons = { all: svgBothModes, rail: svgTrain, bus: svgBus, popular: svgStar };
  const tabs = document.querySelectorAll(".mode-tab");
  tabs.forEach(tab => {
    const mode = tab.dataset.mode;
    tab.querySelector(".tab-icon").innerHTML = tabIcons[mode]("currentColor");
    tab.addEventListener("click", () => {
      if (mode === "popular") {
        document.getElementById("popularSection").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      modeFilter = mode === "all" ? null : mode;
    });
  });
}

function renderPopular() {
  const grid = document.getElementById("popularGrid");
  grid.innerHTML = "";
  popularRoutes.forEach(r => {
    const fastest = findBestRoute(r.from, r.to, e => e.time);
    const cheapest = findBestRoute(r.from, r.to, e => e.fare);
    if (!fastest || !cheapest) return;
    const modesUsed = [...new Set(fastest.legs.map(l => l.mode))];
    const modeColor = { rail: "#2f6fed", bus: "#2e9e4f" };
    const modeDots = modesUsed.map(m =>
      `<span class="icon-dot" style="background:${modeColor[m]}">${modeIcon[m]("#ffffff")}</span>`
    ).join("");

    const card = document.createElement("div");
    card.className = "popular-card";
    card.innerHTML = `
      <div class="art">${cardArt[r.art]()}</div>
      <div class="info">
        <div class="route-name">${stationNames[r.from]} → ${stationNames[r.to]}</div>
        <div class="meta-row">${modeDots}<span>~${fastest.totalTime} นาที</span><span>·</span><span class="price-from">เริ่มต้น ${cheapest.totalFare} บาท</span></div>
      </div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `results.html?from=${r.from}&to=${r.to}`;
    });
    grid.appendChild(card);
  });
}

function renderDate() {
  const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const d = new Date();
  document.getElementById("dateValue").textContent = `วันนี้ · ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

document.getElementById("swapBtn").innerHTML = svgSwap("#146c94");
document.getElementById("skylineArt").innerHTML = svgSidebarSkyline();
document.getElementById("heroArt").innerHTML = svgHeroArt();
document.getElementById("dateIcon").innerHTML = svgCalendar("#5b6b78");
document.getElementById("clockIcon").innerHTML = svgClock("#5b6b78");
document.getElementById("originField").addEventListener("click", () => openPicker("origin"));
document.getElementById("destField").addEventListener("click", () => openPicker("dest"));
document.getElementById("pickerClose").addEventListener("click", closePicker);
document.getElementById("pickerOverlay").addEventListener("click", (e) => { if (e.target.id === "pickerOverlay") closePicker(); });
document.getElementById("swapBtn").addEventListener("click", swapSelection);
document.getElementById("searchBtn").addEventListener("click", () => {
  window.location.href = `results.html?from=${selection.origin}&to=${selection.dest}`;
});

setupModeTabs();
renderPopular();
renderDate();
renderSuggestions();
highlightCode();
