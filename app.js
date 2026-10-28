(() => {
  const MAX_STOPS = 500;
  const STORAGE_KEY = "ma-tournee-stops-v1";
  const $ = id => document.getElementById(id);
  const addressInput = $("addressInput");
  const list = $("stopsList");
  let stops = loadStops();
  let sortAZ = false;
  let toastTimer;

  function loadStops() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value.slice(0, MAX_STOPS).filter(s => s && typeof s.address === "string") : [];
    } catch (_) { return []; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stops)); }
    catch (_) { showToast("Le stockage est plein. Exportez votre tournée."); }
  }
  function showToast(message) {
    const el = $("toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function normalizeAddress(line) {
    return line.replace(/^\uFEFF/, "").trim().replace(/^["']|["']$/g, "").trim();
  }
  function addLines(raw) {
    const lines = raw.split(/\r?\n/).map(line => {
      // CSV support: use first column, handling simple quoted fields
      const first = line.match(/^\s*(?:"([^"]*(?:""[^"]*)*)"|([^,;]+))/);
      return normalizeAddress(first ? (first[1] ?? first[2] ?? "") : line);
    }).filter(Boolean);
    if (!lines.length) { showToast("Saisissez au moins une adresse."); return; }
    const room = MAX_STOPS - stops.length;
    if (room <= 0) { showToast("La limite de 500 arrêts est atteinte."); return; }
    const accepted = lines.slice(0, room);
    accepted.forEach(address => stops.push({id: makeId(), address, done: false}));
    save(); render(); addressInput.value = "";
    showToast(`${accepted.length} adresse(s) ajoutée(s).` + (lines.length > room ? ` ${lines.length-room} ignorée(s) : limite de 500.` : ""));
  }
  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function render() {
    const completed = stops.filter(s => s.done).length;
    $("progressTitle").textContent = `${completed} / ${stops.length} arrêt${stops.length > 1 ? "s" : ""} terminé${completed > 1 ? "s" : ""}`;
    $("progressBar").style.width = stops.length ? `${completed / stops.length * 100}%` : "0%";
    $("countText").textContent = `${stops.length} adresse${stops.length > 1 ? "s" : ""} · ${MAX_STOPS-stops.length} place(s) restante(s)`;
    $("emptyState").hidden = stops.length > 0;
    list.innerHTML = "";
    const visible = [...stops];
    if (sortAZ) visible.sort((a,b) => a.address.localeCompare(b.address, "fr"));
    visible.forEach((stop, index) => {
      const li = document.createElement("li");
      li.className = `stop${stop.done ? " done" : ""}`;
      li.innerHTML = `
        <div class="number">${index + 1}</div>
        <div class="stop-main">
          <div class="address">${escapeText(stop.address)}</div>
          <div class="stop-tools">
            <label class="check"><input type="checkbox" ${stop.done ? "checked" : ""} aria-label="Marquer comme livré"> Livré</label>
            <button class="waze" type="button">Ouvrir Waze ↗</button>
            <button class="maps" type="button">Plans ↗</button>
            <button class="remove" type="button" aria-label="Supprimer cet arrêt">✕</button>
          </div>
        </div>`;
      li.querySelector('input').addEventListener("change", e => {
        const found = stops.find(s => s.id === stop.id); if (found) found.done = e.target.checked;
        save(); render();
      });
      li.querySelector(".waze").addEventListener("click", () => openWaze(stop.address));
      li.querySelector(".maps").addEventListener("click", () => openAppleMaps(stop.address));
      li.querySelector(".remove").addEventListener("click", () => {
        if (confirm(`Supprimer cet arrêt ?\n${stop.address}`)) {
          stops = stops.filter(s => s.id !== stop.id); save(); render();
        }
      });
      list.appendChild(li);
    });
    $("sortButton").textContent = sortAZ ? "Ordre ajouté" : "Trier A–Z";
  }
  function openWaze(address) {
    const encoded = encodeURIComponent(address);
    // Official Waze deep-link format; browser may offer to open the Waze app.
    window.location.href = `https://waze.com/ul?q=${encoded}&navigate=yes`;
  }
  function openAppleMaps(address) {
    window.location.href = `https://maps.apple.com/?daddr=${encodeURIComponent(address)}&dirflg=d`;
  }
  function exportStops() {
    const content = "Adresse,Terminé\n" + stops.map(s => `"${s.address.replace(/"/g,'""')}",${s.done ? "oui" : "non"}`).join("\n");
    const blob = new Blob(["\uFEFF", content], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ma-tournee.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  $("addAddresses").addEventListener("click", () => addLines(addressInput.value));
  $("importButton").addEventListener("click", () => $("fileInput").click());
  $("fileInput").addEventListener("change", async e => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    try { addLines(await file.text()); } catch (_) { showToast("Impossible de lire ce fichier."); }
    e.target.value = "";
  });
  $("exportButton").addEventListener("click", exportStops);
  $("sortButton").addEventListener("click", () => { sortAZ = !sortAZ; render(); });
  $("clearDone").addEventListener("click", () => {
    const n = stops.filter(s => s.done).length;
    if (!n) { showToast("Aucun arrêt terminé."); return; }
    if (confirm(`Supprimer les ${n} arrêt(s) terminés ?`)) { stops = stops.filter(s => !s.done); save(); render(); }
  });
  $("clearAll").addEventListener("click", () => {
    if (!stops.length) { showToast("La liste est déjà vide."); return; }
    if (confirm("Supprimer tous les arrêts ? Pensez à exporter votre tournée avant.")) { stops = []; save(); render(); }
  });
  $("installHelp").addEventListener("click", () => $("installDialog").showModal());
  $("navAdd").addEventListener("click", () => { addressInput.focus(); window.scrollTo({top: addressInput.getBoundingClientRect().top + window.scrollY - 100, behavior:"smooth"}); });
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
  render();
})();
