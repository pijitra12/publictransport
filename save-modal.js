// หน้าต่างตั้งชื่อ + เลือกไอคอนตอนบันทึกเส้นทางโปรด — ใช้ร่วมกันได้ทุกหน้า
function openSaveModal(from, to, onSaved) {
  document.querySelectorAll(".save-modal-overlay").forEach(el => el.remove());
  const existing = findSavedRoute(from, to);

  const overlay = document.createElement("div");
  overlay.className = "picker-overlay save-modal-overlay";
  overlay.innerHTML = `
    <div class="picker-modal" style="max-width:420px;max-height:none">
      <div class="picker-header">
        <h3>${existing ? "แก้ไขเส้นทางโปรด" : "บันทึกเป็นเส้นทางโปรด"}</h3>
        <button class="picker-close" id="saveModalClose">&times;</button>
      </div>
      <div style="padding:20px">
        <div class="field">
          <div class="label">ตั้งชื่อเส้นทาง (ไม่บังคับ)</div>
          <input type="text" id="saveLabelInput" class="text-input"
            placeholder="${stationNames[from]} → ${stationNames[to]}"
            value="${existing ? existing.label : ""}">
        </div>
        <div class="field">
          <div class="label">เลือกไอคอน</div>
          <div class="icon-choice-row" id="iconChoiceRow"></div>
        </div>
        <button class="primary" id="saveModalConfirm" style="width:100%;margin-top:8px">
          ${existing ? "บันทึกการแก้ไข" : "บันทึกเส้นทางนี้"}
        </button>
        ${existing ? '<button class="share-btn" id="saveModalDelete" style="width:100%;margin-top:10px;justify-content:center">ลบออกจากเส้นทางโปรด</button>' : ""}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  let selectedIcon = existing ? existing.icon : "star";
  const iconRow = overlay.querySelector("#iconChoiceRow");
  routeIconOptions.forEach(opt => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "icon-choice-btn" + (opt.key === selectedIcon ? " active" : "");
    btn.innerHTML = opt.icon("currentColor");
    btn.title = opt.label;
    btn.addEventListener("click", () => {
      selectedIcon = opt.key;
      iconRow.querySelectorAll(".icon-choice-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
    iconRow.appendChild(btn);
  });

  function close() { overlay.remove(); }
  overlay.querySelector("#saveModalClose").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  overlay.querySelector("#saveModalConfirm").addEventListener("click", () => {
    const label = overlay.querySelector("#saveLabelInput").value.trim();
    saveRoute(from, to, label, selectedIcon);
    close();
    if (onSaved) onSaved();
  });

  const delBtn = overlay.querySelector("#saveModalDelete");
  if (delBtn) {
    delBtn.addEventListener("click", () => {
      removeSavedRoute(from, to);
      close();
      if (onSaved) onSaved();
    });
  }
}
