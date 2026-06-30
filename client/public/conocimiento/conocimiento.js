(function () {
  "use strict";

  const STORE_KEY = "mg_knowledge_v59";
  const SOURCE_KEY = "mg_knowledge_source_v59";
  const SESSION_KEY = "mg_knowledge_session_v59";
  const MG_DATA_KEY = "mg_data";
  const MG_USER_KEY = "mg_user";
  const VERSION = "v59.3-conocimiento-manuales";
  const technicalManuals = Array.isArray(window.MG_TECHNICAL_MANUALS) ? window.MG_TECHNICAL_MANUALS : [];

  const app = document.getElementById("app");
  const state = {
    view: "buscar",
    query: "",
    statusFilter: "published",
    manualQuery: "",
    manualBrand: "",
    selectedId: null,
    user: null,
    source: null,
    knowledge: {
      schema: "mg-knowledge-v1",
      version: VERSION,
      cases: [],
      permissions: {},
      audit: []
    }
  };

  const riskLabels = { bajo: "Bajo", medio: "Medio", alto: "Alto", critico: "Critico" };
  const statusLabels = {
    draft: "Borrador",
    pending_review: "Pendiente revision",
    validated: "Validado",
    published: "Publicado",
    rejected: "Rechazado"
  };

  function safeParse(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch (error) { return fallback; }
  }

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function readSource() {
    const productionData = safeParse(localStorage.getItem(MG_DATA_KEY), null);
    const importedData = safeParse(localStorage.getItem(SOURCE_KEY), null);
    const source = productionData && typeof productionData === "object" ? productionData : importedData;
    state.source = source || { users: [], jobs: [], clients: [], vehicles: [] };
  }

  function readSession() {
    const moduleUser = safeParse(localStorage.getItem(SESSION_KEY), null);
    const appUser = safeParse(localStorage.getItem(MG_USER_KEY), null);
    state.user = moduleUser || appUser || null;
  }

  function readKnowledge() {
    const stored = safeParse(localStorage.getItem(STORE_KEY), null);
    if (stored && Array.isArray(stored.cases)) {
      state.knowledge = {
        schema: stored.schema || "mg-knowledge-v1",
        version: stored.version || VERSION,
        cases: stored.cases || [],
        permissions: stored.permissions || {},
        audit: stored.audit || []
      };
    }
  }

  function saveKnowledge(action, detail) {
    if (action) {
      state.knowledge.audit = state.knowledge.audit || [];
      state.knowledge.audit.unshift({
        id: uid("audit"),
        at: new Date().toISOString(),
        user: userLabel(),
        action,
        detail: detail || ""
      });
      state.knowledge.audit = state.knowledge.audit.slice(0, 300);
    }
    localStorage.setItem(STORE_KEY, JSON.stringify(state.knowledge));
  }

  async function loadSeedIfEmpty() {
    if (state.knowledge.cases.length) return;
    const urls = ["./casos-ejemplo.json", "/conocimiento/casos-ejemplo.json"];
    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) continue;
        const payload = await response.json();
        if (payload && Array.isArray(payload.cases)) {
          state.knowledge.cases = payload.cases.map((item) => ({
            ...item,
            id: item.id || uid("case"),
            status: item.status || "published",
            createdAt: item.createdAt || new Date().toISOString()
          }));
          saveKnowledge("seed_loaded", "Casos iniciales cargados");
          return;
        }
      } catch (error) {}
    }
  }

  function users() { return Array.isArray(state.source.users) ? state.source.users : []; }
  function currentRole() { return normalize(state.user && (state.user.role || state.user.rol || state.user.tipo)); }
  function userId(user) { return String((user && (user.id || user.username || user.user || user.email || user.name)) || ""); }
  function userLabel(user) {
    const current = user || state.user || {};
    return current.name || current.nombre || current.username || current.user || current.email || "Sin usuario";
  }
  function isAdmin() {
    const role = currentRole();
    return role === "admin" || role === "administrador" || role === "gerencia" || role === "supervisor";
  }
  function canContribute() {
    if (isAdmin()) return true;
    const id = userId(state.user);
    return Boolean(id && state.knowledge.permissions && state.knowledge.permissions[id] && state.knowledge.permissions[id].canContributeKnowledge);
  }

  function visibleCases() {
    const query = normalize(state.query);
    return state.knowledge.cases
      .filter((item) => {
        if (!isAdmin() && item.status !== "published") return false;
        if (state.statusFilter !== "all" && item.status !== state.statusFilter) return false;
        if (!query) return true;
        const haystack = normalize([
          item.title, item.brand, item.model, item.equipmentType, item.symptoms,
          item.measurements, item.diagnosis, item.solution, item.avoid, item.tags
        ].join(" "));
        return haystack.includes(query);
      })
      .sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")));
  }

  function caseById(id) { return state.knowledge.cases.find((item) => item.id === id) || null; }

  function renderLogin(message) {
    app.innerHTML = `
      <div class="login">
        <section class="login-hero">
          <img class="brand-mark" src="../mg-logo.jpg" alt="MG Portones" onerror="this.style.display='none'" />
          <h1>Conocimiento tecnico validado</h1>
          <p>Modulo aislado para documentar fallas, diagnosticos, mediciones y soluciones revisadas por personal autorizado.</p>
          <p>Este piloto no modifica reportes, fotos, clientes ni inventario de la app principal.</p>
        </section>
        <section class="login-panel">
          <form class="login-card" id="loginForm">
            <h2>Entrar al modulo</h2>
            ${message ? `<div class="notice">${escapeHtml(message)}</div>` : ""}
            <label>Usuario<input name="username" autocomplete="username" required /></label>
            <label>Contrasena<input name="password" type="password" autocomplete="current-password" required /></label>
            <button class="btn" type="submit">Entrar</button>
            <button class="btn secondary" type="button" id="importBackupLogin">Importar respaldo para prueba</button>
          </form>
        </section>
      </div>`;
    document.getElementById("loginForm").addEventListener("submit", onLogin);
    document.getElementById("importBackupLogin").addEventListener("click", importBackup);
  }

  function onLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = normalize(form.get("username"));
    const password = String(form.get("password") || "");
    const found = users().find((item) => normalize(item.username || item.user || item.email || item.name) === username);
    if (!found || String(found.password || found.contrasena || "") !== password) {
      renderLogin("Credenciales invalidas o respaldo sin usuarios. Puedes importar un respaldo solo para esta prueba.");
      return;
    }
    state.user = found;
    localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    saveKnowledge("login", `Ingreso al modulo: ${userLabel(found)}`);
    render();
  }

  function shell(content) {
    const nav = [
      ["buscar", "Buscar casos"],
      ["nuevo", "Nuevo caso"],
      ["revision", "Revision"],
      ["permisos", "Permisos"],
      ["respaldo", "Respaldo"]
    ].filter(([key]) => key !== "nuevo" || canContribute())
     .filter(([key]) => key !== "revision" || isAdmin())
     .filter(([key]) => key !== "permisos" || isAdmin());
    app.innerHTML = `
      <div class="app-shell">
        <aside class="sidebar">
          <div class="brand">
            <img class="brand-mark" src="../mg-logo.jpg" alt="MG" onerror="this.style.display='none'" />
            <div><h1>MG Portones</h1><p>Conocimiento tecnico</p></div>
          </div>
          <nav class="nav">${nav.map(([key, label]) => `<button class="${state.view === key ? "active" : ""}" data-view="${key}">${label}</button>`).join("")}</nav>
          <div class="session-card">
            <strong>${escapeHtml(userLabel())}</strong><br />Rol: ${escapeHtml(currentRole() || "sin rol")}<br />Version: ${VERSION}<br />
            <button class="btn secondary" id="logoutBtn" type="button" style="margin-top:10px;width:100%">Cambiar usuario</button>
          </div>
        </aside>
        <main class="main">${content}</main>
      </div>`;
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => { state.view = button.getAttribute("data-view"); render(); });
    });
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem(SESSION_KEY); state.user = null; renderLogin();
    });
  }

  function render() {
    if (!state.user) return renderLogin();
    if (state.view === "nuevo") return renderNewCase();
    if (state.view === "revision") return renderReview();
    if (state.view === "permisos") return renderPermissions();
    if (state.view === "respaldo") return renderBackup();
    return renderSearch();
  }

  function renderSearch() {
    const cases = visibleCases();
    const selected = state.selectedId ? caseById(state.selectedId) : cases[0];
    const brands = [...new Set(technicalManuals.map((manual) => manual.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const content = `
      <div class="topbar">
        <div><h2>Base de conocimiento</h2><p>Casos tecnicos revisados para llegar mas rapido a diagnosticos seguros.</p></div>
        <div class="toolbar">${canContribute() ? `<button class="btn" id="newCaseBtn">Nuevo caso</button>` : ""}<button class="btn secondary" id="exportBtn">Exportar</button></div>
      </div>
      <div class="notice"><strong>Modulo separado:</strong> esta pagina usa almacenamiento independiente y no altera reportes, fotos ni clientes de produccion.</div><br />
      <div class="grid">
        <section class="panel">
          <div class="panel-header"><h3>Busqueda tecnica</h3><span class="pill">${cases.length} visibles</span></div>
          <div class="panel-body">
            <div class="form-grid">
              <label class="full">Buscar por marca, modelo, sintoma o diagnostico<input id="searchInput" value="${escapeHtml(state.query)}" placeholder="Ej: Beninca, humedad, aislamiento, no cierra" /></label>
              <label>Estado<select id="statusFilter">${statusOption("published")}${isAdmin() ? statusOption("all") + statusOption("pending_review") + statusOption("validated") + statusOption("rejected") + statusOption("draft") : ""}</select></label>
            </div><br />
            <div class="case-list">${cases.length ? cases.map(caseCard).join("") : `<div class="empty">No hay casos con ese filtro.</div>`}</div>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><h3>Detalle tecnico</h3>${selected ? statusPill(selected.status) : ""}</div>
          <div class="panel-body">${selected ? detailHtml(selected) : `<div class="empty">Selecciona un caso para ver el detalle.</div>`}</div>
        </section>
      </div>
      <br />
      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Biblioteca de manuales</h3>
            <p style="margin:4px 0 0; color:var(--muted);">Aqui queda el acceso directo a los manuales PDF que respaldan el diagnostico.</p>
          </div>
          <span class="pill">${technicalManuals.length} manuales</span>
        </div>
        <div class="panel-body">
          <div class="form-grid">
            <label class="full">Buscar manual
              <input id="manualSearchInput" value="${escapeHtml(state.manualQuery)}" placeholder="Ej: Beninca, encoder, fotocelula, corredizo" />
            </label>
            <label>Marca
              <select id="manualBrandFilter">
                <option value="">Todas las marcas</option>
                ${brands.map((brand) => `<option value="${escapeHtml(brand)}" ${state.manualBrand === brand ? "selected" : ""}>${escapeHtml(brand)}</option>`).join("")}
              </select>
            </label>
          </div>
          <br />
          <div id="manualLibrary" class="grid-3">${manualLibraryMarkup(visibleManuals())}</div>
        </div>
      </section>`;
    shell(content);
    document.getElementById("searchInput").addEventListener("input", (event) => { state.query = event.target.value; renderSearch(); });
    document.getElementById("statusFilter").addEventListener("change", (event) => { state.statusFilter = event.target.value; renderSearch(); });
    document.getElementById("manualSearchInput").addEventListener("input", (event) => {
      state.manualQuery = event.target.value;
      renderSearch();
    });
    document.getElementById("manualBrandFilter").addEventListener("change", (event) => {
      state.manualBrand = event.target.value;
      renderSearch();
    });
    const newCaseBtn = document.getElementById("newCaseBtn");
    if (newCaseBtn) newCaseBtn.addEventListener("click", () => { state.view = "nuevo"; render(); });
    document.querySelectorAll("[data-open-case]").forEach((button) => button.addEventListener("click", () => { state.selectedId = button.getAttribute("data-open-case"); renderSearch(); }));
    document.getElementById("exportBtn").addEventListener("click", exportKnowledge);
  }

  function statusOption(status) {
    return `<option value="${status}" ${state.statusFilter === status ? "selected" : ""}>${escapeHtml(status === "all" ? "Todos" : statusLabels[status] || status)}</option>`;
  }
  function statusPill(status) {
    const cls = status === "published" || status === "validated" ? "green" : status === "rejected" ? "red" : "amber";
    return `<span class="pill ${cls}">${escapeHtml(statusLabels[status] || status)}</span>`;
  }
  function riskPill(risk) {
    const cls = risk === "critico" || risk === "alto" ? "red" : risk === "medio" ? "amber" : "green";
    return `<span class="pill ${cls}">Riesgo ${escapeHtml(riskLabels[risk] || risk || "sin clasificar")}</span>`;
  }
  function caseCard(item) {
    return `<article class="card"><h4>${escapeHtml(item.title)}</h4><div class="meta"><span class="pill">${escapeHtml(item.brand || "Sin marca")}</span><span class="pill">${escapeHtml(item.model || "Sin modelo")}</span>${riskPill(item.riskLevel)}${statusPill(item.status)}</div><p>${escapeHtml(item.symptoms || "Sin sintomas registrados")}</p><button class="btn secondary" data-open-case="${escapeHtml(item.id)}">Ver detalle</button></article>`;
  }
  function detailHtml(item) {
    return `<div class="case-detail"><h3>${escapeHtml(item.title)}</h3>${kv("Marca / modelo", `${item.brand || ""} ${item.model || ""}`)}${kv("Equipo", item.equipmentType)}${kv("Sintomas", item.symptoms)}${kv("Mediciones", item.measurements)}${kv("Diagnostico", item.diagnosis)}${kv("Solucion recomendada", item.solution)}${kv("Evitar", item.avoid)}${kv("Confianza", item.confidenceLevel)}${kv("Creado por", item.createdBy)}${kv("Revisado por", item.reviewedBy)}${kv("Notas de revision", item.reviewNotes)}</div>`;
  }
  function kv(label, value) { return `<div class="kv"><strong>${escapeHtml(label)}</strong><div>${escapeHtml(value || "No registrado")}</div></div>`; }

  function visibleManuals() {
    const query = normalize(state.manualQuery);
    return technicalManuals
      .filter((manual) => !state.manualBrand || manual.brand === state.manualBrand)
      .filter((manual) => {
        if (!query) return true;
        const haystack = normalize([
          manual.brand,
          manual.model,
          manual.application,
          ...(manual.specs || []),
          ...(manual.startup || []),
          ...(manual.safety || []),
          ...((manual.diagnostics || []).flat ? manual.diagnostics.flat() : [])
        ].join(" "));
        return haystack.includes(query);
      })
      .sort((a, b) => `${a.brand || ""} ${a.model || ""}`.localeCompare(`${b.brand || ""} ${b.model || ""}`));
  }

  function manualLibraryMarkup(items) {
    if (!items.length) return `<div class="empty full">No se encontraron manuales con ese filtro.</div>`;
    return items.map((manual) => `
      <article class="card">
        <div class="meta">
          <span class="pill">${escapeHtml(manual.brand || "Sin marca")}</span>
          <span class="pill">${escapeHtml(manual.model || "Sin modelo")}</span>
        </div>
        <h4>${escapeHtml(`${manual.brand || ""} ${manual.model || ""}`.trim() || "Manual tecnico")}</h4>
        <p>${escapeHtml(manual.application || "Sin descripcion")}</p>
        <div class="toolbar">
          <a class="btn secondary" href="${escapeHtml(manual.pdfUrl || "#")}" target="_blank" rel="noopener">Ver PDF</a>
          <a class="btn secondary" href="${escapeHtml(manual.pdfUrl || "#")}" download>Descargar PDF</a>
        </div>
        <div class="kv"><strong>Datos clave</strong><div>${escapeHtml((manual.specs || []).slice(0, 3).join(" | ") || "No registrados")}</div></div>
        <div class="kv"><strong>Seguridad</strong><div>${escapeHtml((manual.safety || []).slice(0, 2).join(" | ") || "No registrada")}</div></div>
      </article>
    `).join("");
  }

  function renderNewCase(editingCase) {
    const item = editingCase || {};
    const content = `<div class="topbar"><div><h2>${item.id ? "Editar caso" : "Nuevo caso tecnico"}</h2><p>Solo usuarios habilitados pueden proponer informacion tecnica.</p></div></div><section class="panel"><div class="panel-header"><h3>Ficha tecnica validable</h3><span class="pill amber">No afecta reportes</span></div><div class="panel-body"><form id="caseForm" class="form-grid"><input type="hidden" name="id" value="${escapeHtml(item.id || "")}" />${input("title", "Titulo del caso", item.title, true, "Ej: Motor inundado con baja aislacion")}${input("brand", "Marca", item.brand, false, "Beninca, BFT, LiftMaster")}${input("model", "Modelo", item.model, false, "Subterraneo, Heady, Brainy24")}${input("equipmentType", "Tipo de equipo", item.equipmentType, false, "Motor, tarjeta, receptor, fotocelda")}${select("riskLevel", "Nivel de riesgo", item.riskLevel || "medio", [["bajo","Bajo"],["medio","Medio"],["alto","Alto"],["critico","Critico"]])}${select("confidenceLevel", "Nivel de confianza", item.confidenceLevel || "media", [["baja","Baja"],["media","Media"],["alta","Alta"]])}${textarea("symptoms", "Sintomas observados", item.symptoms, true)}${textarea("measurements", "Mediciones / pruebas realizadas", item.measurements, false)}${textarea("diagnosis", "Diagnostico", item.diagnosis, true)}${textarea("solution", "Solucion recomendada", item.solution, true)}${textarea("avoid", "Que evitar", item.avoid, false)}${textarea("reviewNotes", "Notas para revision", item.reviewNotes, false)}<div class="full toolbar"><button class="btn" type="submit">Guardar caso</button><button class="btn secondary" type="button" id="cancelCaseBtn">Cancelar</button></div></form></div></section>`;
    shell(content);
    document.getElementById("caseForm").addEventListener("submit", saveCaseFromForm);
    document.getElementById("cancelCaseBtn").addEventListener("click", () => { state.view = "buscar"; render(); });
  }
  function input(name, label, value, required, placeholder) { return `<label>${escapeHtml(label)}<input name="${name}" value="${escapeHtml(value || "")}" placeholder="${escapeHtml(placeholder || "")}" ${required ? "required" : ""} /></label>`; }
  function select(name, label, value, options) { return `<label>${escapeHtml(label)}<select name="${name}">${options.map(([key, text]) => `<option value="${key}" ${key === value ? "selected" : ""}>${text}</option>`).join("")}</select></label>`; }
  function textarea(name, label, value, required) { return `<label class="full">${escapeHtml(label)}<textarea name="${name}" ${required ? "required" : ""}>${escapeHtml(value || "")}</textarea></label>`; }

  function saveCaseFromForm(event) {
    event.preventDefault();
    if (!canContribute()) { alert("No tienes permiso para proponer casos tecnicos."); return; }
    const form = new FormData(event.currentTarget);
    const id = String(form.get("id") || "");
    const existing = id ? caseById(id) : null;
    const payload = {
      id: id || uid("case"),
      title: String(form.get("title") || "").trim(),
      brand: String(form.get("brand") || "").trim(),
      model: String(form.get("model") || "").trim(),
      equipmentType: String(form.get("equipmentType") || "").trim(),
      riskLevel: String(form.get("riskLevel") || "medio"),
      confidenceLevel: String(form.get("confidenceLevel") || "media"),
      symptoms: String(form.get("symptoms") || "").trim(),
      measurements: String(form.get("measurements") || "").trim(),
      diagnosis: String(form.get("diagnosis") || "").trim(),
      solution: String(form.get("solution") || "").trim(),
      avoid: String(form.get("avoid") || "").trim(),
      reviewNotes: String(form.get("reviewNotes") || "").trim(),
      status: isAdmin() ? "validated" : "pending_review",
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      createdBy: existing ? existing.createdBy : userLabel(),
      updatedAt: new Date().toISOString(),
      updatedBy: userLabel()
    };
    if (!payload.title || !payload.symptoms || !payload.diagnosis || !payload.solution) { alert("Completa titulo, sintomas, diagnostico y solucion."); return; }
    if (existing) { Object.assign(existing, payload); saveKnowledge("case_updated", payload.title); }
    else { state.knowledge.cases.unshift(payload); saveKnowledge("case_created", payload.title); }
    state.selectedId = payload.id; state.view = "buscar"; state.statusFilter = isAdmin() ? "all" : "published"; render();
  }

  function renderReview() {
    const rows = state.knowledge.cases.filter((item) => ["pending_review", "validated", "rejected"].includes(item.status)).sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")));
    const content = `<div class="topbar"><div><h2>Revision tecnica</h2><p>Gerencia o tecnico autorizado decide que informacion queda publicada.</p></div></div><section class="panel"><div class="panel-header"><h3>Cola de revision</h3><span class="pill">${rows.length} casos</span></div><div class="panel-body table-wrap">${rows.length ? `<table><thead><tr><th>Caso</th><th>Marca</th><th>Estado</th><th>Autor</th><th>Acciones</th></tr></thead><tbody>${rows.map(reviewRow).join("")}</tbody></table>` : `<div class="empty">No hay casos pendientes.</div>`}</div></section>`;
    shell(content);
    document.querySelectorAll("[data-review]").forEach((button) => button.addEventListener("click", reviewAction));
    document.querySelectorAll("[data-edit-case]").forEach((button) => button.addEventListener("click", () => renderNewCase(caseById(button.getAttribute("data-edit-case")))));
  }
  function reviewRow(item) {
    return `<tr><td><strong>${escapeHtml(item.title)}</strong><br />${escapeHtml(item.diagnosis || "")}</td><td>${escapeHtml(item.brand || "")}<br />${escapeHtml(item.model || "")}</td><td>${statusPill(item.status)}</td><td>${escapeHtml(item.createdBy || "")}</td><td class="toolbar"><button class="btn secondary" data-edit-case="${escapeHtml(item.id)}">Editar</button><button class="btn" data-review="publish" data-id="${escapeHtml(item.id)}">Publicar</button><button class="btn secondary" data-review="validate" data-id="${escapeHtml(item.id)}">Validar</button><button class="btn danger" data-review="reject" data-id="${escapeHtml(item.id)}">Rechazar</button></td></tr>`;
  }
  function reviewAction(event) {
    const button = event.currentTarget; const item = caseById(button.getAttribute("data-id")); if (!item) return;
    const action = button.getAttribute("data-review");
    if (action === "publish") item.status = "published";
    if (action === "validate") item.status = "validated";
    if (action === "reject") item.status = "rejected";
    item.reviewedBy = userLabel(); item.reviewedAt = new Date().toISOString(); item.updatedAt = item.reviewedAt;
    saveKnowledge("case_reviewed", `${item.title} -> ${item.status}`); renderReview();
  }

  function renderPermissions() {
    const rows = users().sort((a, b) => userLabel(a).localeCompare(userLabel(b)));
    const content = `<div class="topbar"><div><h2>Permisos de aporte</h2><p>Solo administracion habilita quien puede alimentar la base de conocimiento.</p></div></div><section class="panel"><div class="panel-header"><h3>Usuarios</h3><span class="pill">${rows.length} encontrados</span></div><div class="panel-body table-wrap">${rows.length ? `<table><thead><tr><th>Usuario</th><th>Rol</th><th>Puede aportar</th></tr></thead><tbody>${rows.map(permissionRow).join("")}</tbody></table>` : `<div class="empty">No hay usuarios cargados. Importa un respaldo si estas en prueba local.</div>`}</div></section>`;
    shell(content);
    document.querySelectorAll("[data-permission-user]").forEach((input) => input.addEventListener("change", togglePermission));
  }
  function permissionRow(user) {
    const id = userId(user); const enabled = Boolean(state.knowledge.permissions[id] && state.knowledge.permissions[id].canContributeKnowledge);
    return `<tr><td><strong>${escapeHtml(userLabel(user))}</strong><br />${escapeHtml(user.username || user.email || id)}</td><td>${escapeHtml(user.role || user.rol || user.tipo || "")}</td><td><label><input type="checkbox" data-permission-user="${escapeHtml(id)}" ${enabled ? "checked" : ""} /> Habilitado</label></td></tr>`;
  }
  function togglePermission(event) {
    const id = event.currentTarget.getAttribute("data-permission-user");
    state.knowledge.permissions[id] = state.knowledge.permissions[id] || {};
    state.knowledge.permissions[id].canContributeKnowledge = event.currentTarget.checked;
    state.knowledge.permissions[id].updatedAt = new Date().toISOString();
    state.knowledge.permissions[id].updatedBy = userLabel();
    saveKnowledge("permission_changed", `${id}: ${event.currentTarget.checked ? "habilitado" : "deshabilitado"}`);
    renderPermissions();
  }

  function renderBackup() {
    const content = `<div class="topbar"><div><h2>Respaldo y caja negra</h2><p>Exporta conocimiento, permisos y bitacora del modulo.</p></div></div><div class="grid"><section class="panel"><div class="panel-header"><h3>Importar respaldo de la app</h3></div><div class="panel-body"><p>Se usa solo para leer usuarios/clientes/reportes durante la prueba. No sobrescribe <strong>mg_data</strong>.</p><button class="btn" id="importBackupBtn">Importar JSON</button></div></section><section class="panel"><div class="panel-header"><h3>Exportar conocimiento</h3></div><div class="panel-body"><p>Descarga casos, permisos y auditoria del modulo V59.</p><button class="btn" id="exportBackupBtn">Descargar conocimiento</button></div></section></div><br /><section class="panel"><div class="panel-header"><h3>Ultimos eventos</h3><span class="pill">${(state.knowledge.audit || []).length}</span></div><div class="panel-body table-wrap">${(state.knowledge.audit || []).length ? `<table><thead><tr><th>Fecha</th><th>Usuario</th><th>Accion</th><th>Detalle</th></tr></thead><tbody>${state.knowledge.audit.slice(0, 80).map(auditRow).join("")}</tbody></table>` : `<div class="empty">Sin eventos todavia.</div>`}</div></section>`;
    shell(content);
    document.getElementById("importBackupBtn").addEventListener("click", importBackup);
    document.getElementById("exportBackupBtn").addEventListener("click", exportKnowledge);
  }
  function auditRow(row) { return `<tr><td>${escapeHtml(new Date(row.at).toLocaleString())}</td><td>${escapeHtml(row.user)}</td><td>${escapeHtml(row.action)}</td><td>${escapeHtml(row.detail)}</td></tr>`; }

  function importBackup() {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "application/json,.json";
    input.addEventListener("change", async () => {
      const file = input.files && input.files[0]; if (!file) return;
      try {
        const text = await file.text(); const payload = JSON.parse(text); const data = payload.data || payload;
        if (!data || !Array.isArray(data.users)) { alert("El respaldo no contiene usuarios validos."); return; }
        localStorage.setItem(SOURCE_KEY, JSON.stringify(data)); state.source = data;
        saveKnowledge("source_imported", file.name); alert("Respaldo cargado solo para el modulo de conocimiento."); render();
      } catch (error) { alert("No se pudo leer el respaldo: " + error.message); }
    });
    input.click();
  }

  function exportKnowledge() {
    const payload = { exportedAt: new Date().toISOString(), module: "MG Portones - Conocimiento Tecnico", version: VERSION, knowledge: state.knowledge };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = `conocimiento-mg-portones-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  async function init() { readSource(); readSession(); readKnowledge(); await loadSeedIfEmpty(); render(); }
  init();
})();
