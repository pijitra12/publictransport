// ระบบขนส่งจำลองเพื่อการสาธิต (ไม่ใช่ข้อมูลราคา/เส้นทางจริงของระบบขนส่งใด ๆ)
// แต่ละสถานี/ป้าย อาจอยู่ได้หลายสาย เก็บเป็น "state" แยกตามสาย เพื่อให้คิดเวลาเปลี่ยนสายได้ถูกต้อง
const stationNames = {
  mochit: "หมอชิต",
  aree: "อารีย์",
  sanampao: "สนามเป้า",
  anusawari: "อนุสาวรีย์ชัยสมรภูมิ",
  siam: "สยาม",
  ratchadamri: "ราชดำริ",
  saladaeng: "ศาลาแดง",
  chongnonsi: "ช่องนนทรี",
  ratchathewi: "ราชเทวี",
  pratunam: "ประตูน้ำ",
  chatuchak: "ตลาดนัดจตุจักร"
};

const lines = {
  sukhumvit: { name: "รถไฟฟ้าสายสุขุมวิท", mode: "rail", color: "#2f6fed", platform: "ชานชาลา 1", stations: ["mochit", "aree", "sanampao", "anusawari", "siam"] },
  silom: { name: "รถไฟฟ้าสายสีลม", mode: "rail", color: "#7a3fd6", platform: "ชานชาลา 3", stations: ["siam", "ratchadamri", "saladaeng", "chongnonsi"] },
  bus511: { name: "รถเมล์สาย 511", mode: "bus", color: "#2e9e4f", platform: null, stations: ["anusawari", "ratchathewi", "pratunam", "siam"] },
  bus3: { name: "รถเมล์สาย 3", mode: "bus", color: "#d9762e", platform: null, stations: ["chatuchak", "mochit"] }
};

// น้ำหนักต่อ "ช่วง" (ระหว่างป้าย/สถานีที่ติดกัน) แยกตามประเภทพาหนะ — เวลาเป็นนาที ค่าโดยสารเป็นบาท (ตัวอย่าง)
// ตั้งใจให้รถไฟฟ้าเร็วกว่าแต่แพงกว่า และรถเมล์ช้ากว่าแต่ถูกกว่า เพื่อให้เห็น trade-off จริงระหว่างเร็วสุด/ประหยัดสุด
const modeWeight = {
  rail: { time: 3, fare: 12 },
  bus: { time: 5, fare: 3 }
};

// เวลาที่ต้องใช้เดิน/รอเปลี่ยนสายที่สถานีเดียวกัน
const TRANSFER_TIME = 5;

function stateId(station, line) { return `${station}__${line}`; }
function parseState(state) {
  const idx = state.indexOf("__");
  return { station: state.slice(0, idx), line: state.slice(idx + 2) };
}

// สร้างกราฟถ่วงน้ำหนักแบบ "state" (สถานี+สาย) — วิธีมาตรฐานในการคิดเวลาเปลี่ยนสายให้ถูกต้อง
function buildStateGraph() {
  const graph = {};
  const stationLines = {}; // station -> [line keys ที่ผ่านสถานีนี้]

  function ensureNode(state) { if (!graph[state]) graph[state] = []; }

  Object.entries(lines).forEach(([lineKey, line]) => {
    line.stations.forEach(st => {
      if (!stationLines[st]) stationLines[st] = [];
      stationLines[st].push(lineKey);
    });
    for (let i = 0; i < line.stations.length - 1; i++) {
      const a = stateId(line.stations[i], lineKey);
      const b = stateId(line.stations[i + 1], lineKey);
      ensureNode(a); ensureNode(b);
      const w = modeWeight[line.mode];
      graph[a].push({ to: b, time: w.time, fare: w.fare, line: lineKey, type: "ride" });
      graph[b].push({ to: a, time: w.time, fare: w.fare, line: lineKey, type: "ride" });
    }
  });

  // เพิ่ม transfer edge ระหว่างทุกคู่สายที่ผ่านสถานีเดียวกัน
  Object.entries(stationLines).forEach(([station, lineKeys]) => {
    for (let i = 0; i < lineKeys.length; i++) {
      for (let j = 0; j < lineKeys.length; j++) {
        if (i === j) continue;
        const a = stateId(station, lineKeys[i]);
        const b = stateId(station, lineKeys[j]);
        graph[a].push({ to: b, time: TRANSFER_TIME, fare: 0, line: null, type: "transfer" });
      }
    }
  });

  return { graph, stationLines };
}

const { graph: stateGraph, stationLines } = buildStateGraph();

// Dijkstra หลายจุดเริ่ม/หลายจุดหมาย บนกราฟ state — costFn กำหนดว่าจะ optimize ด้วยอะไร (เวลา/ค่าโดยสาร/ผสม)
function findBestRoute(originStation, destStation, costFn) {
  const sources = (stationLines[originStation] || []).map(l => stateId(originStation, l));
  const targets = new Set((stationLines[destStation] || []).map(l => stateId(destStation, l)));
  if (!sources.length || !targets.size) return null;

  const dist = {};
  const prev = {};
  const prevEdge = {};
  const visited = new Set();
  Object.keys(stateGraph).forEach(s => { dist[s] = Infinity; });
  sources.forEach(s => { dist[s] = 0; });

  const queue = new Set(Object.keys(stateGraph));

  while (queue.size) {
    let u = null;
    queue.forEach(s => { if (u === null || dist[s] < dist[u]) u = s; });
    if (dist[u] === Infinity) break;
    queue.delete(u);
    visited.add(u);
    if (targets.has(u)) break;

    (stateGraph[u] || []).forEach(edge => {
      if (visited.has(edge.to)) return;
      const alt = dist[u] + costFn(edge);
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = u;
        prevEdge[edge.to] = edge;
      }
    });
  }

  let best = null;
  targets.forEach(t => {
    if (dist[t] < Infinity && (best === null || dist[t] < dist[best])) best = t;
  });
  if (best === null) return null;

  const statePath = [best];
  const edgePath = [];
  let cur = best;
  while (prev[cur] !== undefined) {
    edgePath.unshift(prevEdge[cur]);
    cur = prev[cur];
    statePath.unshift(cur);
  }

  return buildItinerary(statePath, edgePath);
}

// แปลง state path ดิบ ให้เป็นรายการ "ขาเดินทาง" ที่มนุษย์อ่านรู้เรื่อง (รวมช่วงที่ขึ้นสายเดียวกันต่อเนื่อง)
function buildItinerary(statePath, edgePath) {
  const legs = [];
  let totalTime = 0, totalFare = 0, transfers = 0;

  let i = 0;
  while (i < edgePath.length) {
    const edge = edgePath[i];
    if (edge.type === "transfer") {
      transfers++;
      totalTime += edge.time;
      i++;
      continue;
    }
    // รวมช่วง ride ต่อเนื่องที่อยู่สายเดียวกัน
    const lineKey = edge.line;
    const fromStation = parseState(statePath[i]).station;
    let j = i;
    let rideTime = 0, rideFare = 0;
    const stops = [fromStation];
    while (j < edgePath.length && edgePath[j].type === "ride" && edgePath[j].line === lineKey) {
      rideTime += edgePath[j].time;
      rideFare += edgePath[j].fare;
      stops.push(parseState(statePath[j + 1]).station);
      j++;
    }
    legs.push({
      type: "ride",
      line: lineKey,
      mode: lines[lineKey].mode,
      lineName: lines[lineKey].name,
      color: lines[lineKey].color,
      platform: lines[lineKey].platform,
      stops,
      from: stops[0],
      to: stops[stops.length - 1],
      numStops: stops.length - 1,
      time: rideTime,
      fare: rideFare
    });
    totalTime += rideTime;
    totalFare += rideFare;
    i = j;
  }

  return { legs, totalTime, totalFare, transfers };
}
