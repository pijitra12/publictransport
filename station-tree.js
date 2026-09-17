// โครงสร้าง Tree สำหรับตัวเลือกสถานี/ป้าย: ระบบขนส่ง (root) -> ประเภท -> สาย -> สถานี/ป้าย (Leaf)
const stationTree = {
  id: "root",
  name: "ทุกระบบขนส่ง",
  type: "root",
  children: [
    {
      id: "rail",
      name: "รถไฟฟ้า",
      type: "mode",
      children: Object.entries(lines)
        .filter(([, l]) => l.mode === "rail")
        .map(([key, l]) => ({
          id: key,
          name: l.name,
          type: "line",
          color: l.color,
          children: l.stations.map(st => ({ id: st, name: stationNames[st], type: "station", line: key }))
        }))
    },
    {
      id: "bus",
      name: "รถเมล์",
      type: "mode",
      children: Object.entries(lines)
        .filter(([, l]) => l.mode === "bus")
        .map(([key, l]) => ({
          id: key,
          name: l.name,
          type: "line",
          color: l.color,
          children: l.stations.map(st => ({ id: st, name: stationNames[st], type: "station", line: key }))
        }))
    }
  ]
};

// สำหรับแสดง "สายที่ผ่าน" ใต้ชื่อสถานีในรายการเลือก
function linesServing(stationId) {
  return (stationLines[stationId] || []).map(k => lines[k].name);
}
