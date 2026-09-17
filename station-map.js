// ผังเส้นทางแบบ schematic (ไม่ใช่พิกัดภูมิศาสตร์จริง) — ใช้ตำแหน่งเดียวกันทุกที่ที่เรียกใช้
const stationPositions = {
  chatuchak: { x: 300, y: 26 },
  mochit: { x: 300, y: 96 },
  aree: { x: 300, y: 166 },
  sanampao: { x: 300, y: 236 },
  anusawari: { x: 300, y: 306 },
  ratchathewi: { x: 410, y: 336 },
  pratunam: { x: 440, y: 378 },
  siam: { x: 300, y: 418 },
  ratchadamri: { x: 388, y: 468 },
  saladaeng: { x: 476, y: 508 },
  chongnonsi: { x: 566, y: 548 }
};

const MAP_VIEWBOX = "0 0 640 580";

function mapEl(tag, attrs) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  return node;
}

// เส้นพื้นหลังทั้งระบบ (ทุกสาย จางๆ) — ให้เห็นบริบทว่าเส้นทางที่ไฮไลต์อยู่ตรงไหนของทั้งระบบ
function drawBaseNetwork(svg, showLabels) {
  Object.values(lines).forEach(line => {
    for (let i = 0; i < line.stations.length - 1; i++) {
      const a = stationPositions[line.stations[i]];
      const b = stationPositions[line.stations[i + 1]];
      svg.appendChild(mapEl("line", {
        x1: a.x, y1: a.y, x2: b.x, y2: b.y,
        stroke: "#c5d0d6", "stroke-width": 5, "stroke-linecap": "round"
      }));
    }
  });

  Object.keys(stationPositions).forEach(id => {
    const p = stationPositions[id];
    svg.appendChild(mapEl("circle", { cx: p.x, cy: p.y, r: 6, fill: "#ffffff", stroke: "#b7c1c8", "stroke-width": 2.4 }));
    if (showLabels) {
      const label = mapEl("text", { x: p.x + (p.x > 320 ? 12 : -12), y: p.y + 4 });
      label.setAttribute("text-anchor", p.x > 320 ? "start" : "end");
      label.setAttribute("font-size", "12");
      label.setAttribute("fill", "#5b6b78");
      label.textContent = stationNames[id];
      svg.appendChild(label);
    }
  });
}

// วาดเส้นทางที่เลือกทับด้านบน พร้อมไฮไลต์จุดขึ้น/ลง/เปลี่ยนสาย
function drawHighlight(svg, route, showLabels) {
  route.legs.forEach(leg => {
    for (let i = 0; i < leg.stops.length - 1; i++) {
      const a = stationPositions[leg.stops[i]];
      const b = stationPositions[leg.stops[i + 1]];
      svg.appendChild(mapEl("line", {
        x1: a.x, y1: a.y, x2: b.x, y2: b.y,
        stroke: leg.color, "stroke-width": 6, "stroke-linecap": "round"
      }));
    }
  });

  route.legs.forEach((leg, li) => {
    leg.stops.forEach((stId, i) => {
      const isBoundary = i === 0 || i === leg.stops.length - 1;
      if (!isBoundary) return;
      const p = stationPositions[stId];
      const isFirstOfTrip = li === 0 && i === 0;
      const isLastOfTrip = li === route.legs.length - 1 && i === leg.stops.length - 1;
      const isTransfer = !isFirstOfTrip && !isLastOfTrip;
      const r = (isFirstOfTrip || isLastOfTrip) ? 10 : 8;
      svg.appendChild(mapEl("circle", { cx: p.x, cy: p.y, r, fill: leg.color, stroke: "#ffffff", "stroke-width": 2.4 }));

      if (showLabels && (isFirstOfTrip || isLastOfTrip || isTransfer)) {
        const onRight = p.x > 320;
        const label = mapEl("text", { x: p.x + (onRight ? 16 : -16), y: p.y + 5 });
        label.setAttribute("text-anchor", onRight ? "start" : "end");
        label.setAttribute("font-size", "13");
        label.setAttribute("font-weight", "600");
        label.setAttribute("fill", "#121c24");
        label.textContent = stationNames[stId];
        svg.appendChild(label);

        const roleText = isFirstOfTrip ? "เริ่มต้น" : isLastOfTrip ? "ปลายทาง" : "เปลี่ยนสาย";
        const roleColor = isFirstOfTrip ? "#2e9e4f" : isLastOfTrip ? "#c94f4f" : "#d97f2e";
        const chipW = roleText.length * 11 + 16;
        const chipX = onRight ? p.x + 16 : p.x - 16 - chipW;
        const chip = mapEl("rect", { x: chipX, y: p.y + 11, width: chipW, height: 18, rx: 9, fill: roleColor });
        svg.appendChild(chip);
        const chipLabel = mapEl("text", { x: chipX + chipW / 2, y: p.y + 24 });
        chipLabel.setAttribute("text-anchor", "middle");
        chipLabel.setAttribute("font-size", "10.5");
        chipLabel.setAttribute("font-weight", "600");
        chipLabel.setAttribute("fill", "#ffffff");
        chipLabel.textContent = roleText;
        svg.appendChild(chipLabel);
      }
    });
  });
}

// คำนวณ viewBox แบบ "ซูมเข้า" เฉพาะบริเวณที่เส้นทางนี้ผ่าน ใช้กับแผนที่ย่อในการ์ด
// กันปัญหาเส้นทางสั้น ๆ (เช่น 2 ป้าย) ถูกวาดในกรอบทั้งระบบแล้วเหลือพื้นที่ว่างเยอะเกินไป
function computeRouteViewBox(route, padding) {
  const stopIds = [];
  route.legs.forEach(leg => stopIds.push(...leg.stops));
  const pts = stopIds.map(id => stationPositions[id]);
  let minX = Math.min(...pts.map(p => p.x));
  let maxX = Math.max(...pts.map(p => p.x));
  let minY = Math.min(...pts.map(p => p.y));
  let maxY = Math.max(...pts.map(p => p.y));

  const MIN_SPAN = 170; // กันไม่ให้ viewBox แคบเกินไปจนดูซูมเยอะผิดสัดส่วน
  if (maxX - minX < MIN_SPAN) {
    const d = (MIN_SPAN - (maxX - minX)) / 2;
    minX -= d; maxX += d;
  }
  if (maxY - minY < MIN_SPAN) {
    const d = (MIN_SPAN - (maxY - minY)) / 2;
    minY -= d; maxY += d;
  }
  minX -= padding; minY -= padding;
  return `${minX} ${minY} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;
}

// สร้าง svg ผังเส้นทางในกล่องที่ระบุ id แล้วไฮไลต์เส้นทางที่ให้มา (ถ้ามี)
function renderStationMap(containerId, route, opts) {
  const options = opts || {};
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const viewBox = (options.compact && route) ? computeRouteViewBox(route, 45) : MAP_VIEWBOX;
  const svg = mapEl("svg", { viewBox, xmlns: "http://www.w3.org/2000/svg" });
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.display = "block";
  drawBaseNetwork(svg, !options.compact);
  if (route) drawHighlight(svg, route, !options.compact);
  container.appendChild(svg);
  return svg;
}
