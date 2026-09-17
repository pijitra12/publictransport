// เส้นทางโปรด — เก็บ {from, to, label, icon, createdAt} ต่อรายการใน localStorage
const SAVE_KEY = "savedRoutes";
const SEARCH_COUNT_KEY = "searchCounts";

function routeKey(from, to) { return `${from}__${to}`; }

function getSavedRoutes() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || []; } catch (e) { return []; }
}

function findSavedRoute(from, to) {
  return getSavedRoutes().find(r => r.from === from && r.to === to) || null;
}

function isRouteSaved(from, to) {
  return !!findSavedRoute(from, to);
}

function saveRoute(from, to, label, iconKey) {
  const list = getSavedRoutes().filter(r => !(r.from === from && r.to === to));
  list.unshift({ from, to, label: label || `${stationNames[from]} → ${stationNames[to]}`, icon: iconKey || "star", createdAt: Date.now() });
  localStorage.setItem(SAVE_KEY, JSON.stringify(list));
}

function removeSavedRoute(from, to) {
  const list = getSavedRoutes().filter(r => !(r.from === from && r.to === to));
  localStorage.setItem(SAVE_KEY, JSON.stringify(list));
}

// จำนวนครั้งที่ค้นหาแต่ละคู่ต้นทาง-ปลายทาง — ใช้เรียง "ใช้บ่อยที่สุด"
function getSearchCounts() {
  try { return JSON.parse(localStorage.getItem(SEARCH_COUNT_KEY)) || {}; } catch (e) { return {}; }
}

function incrementSearchCount(from, to) {
  const counts = getSearchCounts();
  const key = routeKey(from, to);
  counts[key] = (counts[key] || 0) + 1;
  localStorage.setItem(SEARCH_COUNT_KEY, JSON.stringify(counts));
}

function getSearchCount(from, to) {
  return getSearchCounts()[routeKey(from, to)] || 0;
}

function getMostSearchedRoute() {
  const counts = getSearchCounts();
  let best = null;
  Object.entries(counts).forEach(([key, count]) => {
    if (!best || count > best.count) {
      const [from, to] = key.split("__");
      best = { from, to, count };
    }
  });
  return best;
}
