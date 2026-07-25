(function () {
  "use strict";

  const APP_DATA_KEY = "mg_data";
  const APP_USER_KEY = "mg_user";
  const FALLBACK_DATA_KEY = "mg_taller_source_v60";
  const SESSION_KEY = "mg_taller_session_v60";
  const VERSION = "v60.1";
  const app = document.getElementById("app");

  const state = {
    view: "pendientes",
    query: "",
    statusFilter: "abiertas",
    selectedKey: "",
    data: null,
    user: null,
    usingFallback: false
  };

  const workshopStatuses = [
    "Recibido",
    "En diagnostico",
    "Esperando repuesto",
    "En reparacion",
    "Reparado",
    "No reparable",
    "Entregado"
  ];

  function safeParse(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch (error) { return fallback; }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function formatDateTime(value) {
    if (!value) return "Sin fecha";
    try {
      return new Date(value).toLocaleString();
    } catch (error) {
      return String(value);
    }
  }

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function readData() {
    const appData = safeParse(localStorage.getItem(APP_DATA_KEY), null);
    const fallback = safeParse(localStorage.getItem(FALLBACK_DATA_KEY), null);
    state.usingFallback = !(appData && typeof appData === "object");
    state.data = appData || fallback || emptyData();
    normalizeData();
  }

  function emptyData() {
    return { users: [], jobs: [], workshopOrders: [], auditLogs: [], syncQueue: [] };
  }

  function normalizeData() {
    state.data.users = Array.isArray(state.data.users) ? state.data.users : [];
    state.data.jobs = Array.isArray(state.data.jobs) ? state.data.jobs : [];
    state.data.workshopOrders = Array.isArray(state.data.workshopOrders) ? state.data.workshopOrders : [];
    state.data.auditLogs = Array.isArray(state.data.auditLogs) ? state.data.auditLogs : [];
    state.data.syncQueue = Array.isArray(state.data.syncQueue) ? state.data.syncQueue : [];
  }

  function saveData(action, detail) {
    normalizeData();
    const event = {
      id: uid("workshop-audit"),
      at: nowIso(),
      user: userLabel(),
      action,
      detail: detail || "",
      module: "taller-v60"
    };
    state.data.auditLogs.unshift(event);
    state.data.syncQueue.push({ id: event.id, type: "workshop_update", createdAt: event.at, detail: action });
    if (state.usingFallback) {
      localStorage.setItem(FALLBACK_DATA_KEY, JSON.stringify(state.data));
    } else {
      localStorage.setItem(APP_DATA_KEY, JSON.stringify(state.data));
    }
  }

  function readSession() {
    state.user = safeParse(localStorage.getItem(SESSION_KEY), null) || safeParse(localStorage.getItem(APP_USER_KEY), null) || null;
  }

  function users() {
    return state.data.users || [];
  }

  function workshopUsers() {
    return users().filter((user) => {
      return hasWorkshopAccess(user);
    });
  }

  function userLabel(user) {
    const current = user || state.user || {};
    return current.name || current.nombre || current.username || current.user || current.email || "Sin usuario";
  }

  function role() {
    return normalize(state.user && (state.user.role || state.user.rol || state.user.tipo));
  }

  function canManage() {
    return hasWorkshopAccess(state.user);
  }

  function hasWorkshopAccess(user) {
    const current = user || {};
    const currentRole = normalize(current && (current.role || current.rol || current.tipo));
    if (["admin", "administrador", "gerencia", "supervisor"].includes(currentRole)) return true;
    return ["technician", "tecnico", "taller"].includes(currentRole) && current.workshopAccess === true;
  }

  function backToApp() {
    window.location.href = "../index.html";
  }

  function reportKey(job) {
    return String(job.id || job.ticket || job.boleta || "");
  }

  function ticket(job) {
    return String(job.ticket || job.boleta || job.id || "Sin boleta");
  }

  function hasWorkshopEntry(job) {
    const entry = job && job.workshopEntry;
    if (!entry || typeof entry !== "object") return false;
    return ["equipment", "brand", "model", "serial", "condition", "date", "reason"].some((key) => String(entry[key] || "").trim());
  }

  function workshopJobs() {
    return (state.data.jobs || []).filter((job) => job && (job.status === "En taller" || hasWorkshopEntry(job)));
  }

  function orderForJob(job) {
    const key = reportKey(job);
    return state.data.workshopOrders.find((order) => String(order.jobKey) === key || String(order.ticket) === ticket(job)) || null;
  }

  function ensureOrder(job) {
    const existing = orderForJob(job);
    if (existing) return existing;
    const entry = job.workshopEntry || {};
    const order = {
      id: uid("workshop"),
      jobKey: reportKey(job),
      ticket: ticket(job),
      client: job.client || "",
      phone: job.phone || "",
      address: job.address || "",
      reportDate: job.date || "",
      reportTechnician: job.technician || "",
      vehicle: job.vehicle || "",
      equipment: entry.equipment || "",
      brand: entry.brand || "",
      model: entry.model || "",
      serial: entry.serial || "",
      condition: entry.condition || "",
      entryDate: entry.date || job.date || today(),
      reason: entry.reason || "",
      status: "Recibido",
      workshopTechnician: "",
      diagnosis: "",
      tests: "",
      requiredParts: "",
      usedParts: "",
      repairActions: "",
      result: "",
      finalDecision: "",
      estimatedReadyDate: "",
      deliveryDate: "",
      notes: "",
      createdAt: nowIso(),
      createdBy: userLabel(),
      updatedAt: nowIso(),
      history: [{ at: nowIso(), user: userLabel(), action: "Orden creada desde reporte", detail: ticket(job) }]
    };
    state.data.workshopOrders.unshift(order);
    saveData("Crear orden de taller", `Boleta ${order.ticket}`);
    return order;
  }

  function visibleItems() {
    const q = normalize(state.query);
    return workshopJobs()
      .map((job) => ({ job, order: orderForJob(job) }))
      .filter(({ job, order }) => {
        const status = order?.status || "Sin abrir";
        if (state.statusFilter === "abiertas" && ["Entregado"].includes(status)) return false;
        if (state.statusFilter !== "todos" && state.statusFilter !== "abiertas" && status !== state.statusFilter) return false;
        if (!q) return true;
        const text = normalize([ticket(job), job.client, job.technician, job.vehicle, job.address, job.status, job.workshopEntry?.brand, job.workshopEntry?.model, job.workshopEntry?.serial, job.workshopEntry?.reason, status].join(" "));
        return text.includes(q);
      })
      .sort((a, b) => String(b.order?.updatedAt || b.job.workshopEntry?.date || b.job.date || "").localeCompare(String(a.order?.updatedAt || a.job.workshopEntry?.date || a.job.date || "")));
  }

  function selectedPair() {
    const rows = visibleItems();
    if (!rows.length) return null;
    if (state.selectedKey) {
      const found = rows.find(({ job }) => reportKey(job) === state.selectedKey || ticket(job) === state.selectedKey);
      if (found) return found;
    }
    return rows[0];
  }

  function renderLogin(message) {
    app.innerHTML = `
      <div class="login">
        <section class="login-hero">
          <img class="brand-mark" src="../mg-logo.jpg" alt="MG Portones" onerror="this.style.display='none'" />
          <h1>Taller MG Portones</h1>
          <p>Modulo separado para ejecutar equipos retirados desde reportes sin romper el flujo normal de trabajo.</p>
          <p>Permite diagnostico, pruebas, repuestos, resultado e historial de taller.</p>
        </section>
        <section class="login-panel">
          <form class="login-card" id="loginForm">
            <h2>Entrar a taller</h2>
            ${message ? `<div class="notice">${escapeHtml(message)}</div>` : ""}
            <label>Usuario<input name="username" autocomplete="username" required /></label>
            <label>Contrasena<input name="password" type="password" autocomplete="current-password" required /></label>
            <button class="btn" type="submit">Entrar</button>
            <button class="btn secondary" type="button" id="importBackupLogin">Importar respaldo para prueba</button>
          </form>
        </section>
      </div>`;
    document.getElementById("loginForm").addEventListener("submit", login);
    document.getElementById("importBackupLogin").addEventListener("click", importBackup);
  }

  function login(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = normalize(form.get("username"));
    const password = String(form.get("password") || "");
    const found = users().find((user) => normalize(user.username || user.user || user.email || user.name) === username);
    if (!found || String(found.password || found.contrasena || "") !== password) {
      renderLogin("Credenciales invalidas o respaldo sin usuarios. Puedes importar un respaldo solo para prueba.");
      return;
    }
    state.user = found;
    localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    render();
  }

  function shell(content) {
    const nav = [["pendientes", "Ordenes"], ["historial", "Historial"], ["respaldo", "Respaldo"]];
    app.innerHTML = `
      <div class="app-shell">
        <aside class="sidebar">
          <div class="brand">
            <img class="brand-mark" src="../mg-logo.jpg" alt="MG" onerror="this.style.display='none'" />
            <div><h1>MG Portones</h1><p>Modulo Taller</p></div>
          </div>
          <nav class="nav">${nav.map(([key, label]) => `<button class="${state.view === key ? "active" : ""}" data-view="${key}">${label}</button>`).join("")}</nav>
          <div class="session-card">
            <strong>${escapeHtml(userLabel())}</strong><br />
            Rol: ${escapeHtml(role() || "sin rol")}<br />
            Datos: ${state.usingFallback ? "respaldo importado" : "app actual"}<br />
            Version: ${VERSION}
            <button class="btn secondary" id="backBtn" type="button" style="margin-top:10px;width:100%">Volver a la app</button>
            <button class="btn secondary" id="logoutBtn" type="button" style="margin-top:10px;width:100%">Cambiar usuario</button>
          </div>
        </aside>
        <main class="main">${content}</main>
      </div>`;
    document.querySelectorAll("[data-view]").forEach((btn) => btn.addEventListener("click", () => { state.view = btn.getAttribute("data-view"); render(); }));
    document.getElementById("backBtn").addEventListener("click", backToApp);
    document.getElementById("logoutBtn").addEventListener("click", () => { localStorage.removeItem(SESSION_KEY); state.user = null; renderLogin(); });
  }

  function render() {
    if (!state.user) return renderLogin();
    if (!canManage()) return shell(`<div class="notice">Tu usuario no tiene rol permitido para taller.</div>`);
    if (state.view === "historial") return renderHistory();
    if (state.view === "respaldo") return renderBackup();
    return renderOrders();
  }

  function renderOrders() {
    const rows = visibleItems();
    const pair = selectedPair();
    const openCount = rows.filter(({ order }) => (order?.status || "Sin abrir") !== "Entregado").length;
    const receivedCount = rows.filter(({ order }) => (order?.status || "Sin abrir") === "Recibido" || !order).length;
    const waitingCount = rows.filter(({ order }) => order?.status === "Esperando repuesto").length;
    const repairedCount = rows.filter(({ order }) => order?.status === "Reparado").length;
    const content = `
      <div class="topbar">
        <div><h2>Ordenes de taller</h2><p>Equipos retirados desde reportes con estado En taller.</p></div>
        <div class="toolbar"><button class="btn secondary" id="exportBtn">Exportar taller</button></div>
      </div>
      <div class="notice"><strong>Flujo seguro:</strong> el modulo lee los reportes y guarda seguimiento en <code>workshopOrders</code>. No borra ni cambia fotos/PDF.</div><br />
      <div class="grid-3">
        <div class="metric"><span>Abiertas</span><strong>${openCount}</strong></div>
        <div class="metric"><span>Recibidas/sin abrir</span><strong>${receivedCount}</strong></div>
        <div class="metric"><span>Esperando repuesto</span><strong>${waitingCount}</strong></div>
      </div>
      <div class="grid-3">
        <div class="metric"><span>Reparadas</span><strong>${repairedCount}</strong></div>
        <div class="metric"><span>Ordenes creadas</span><strong>${(state.data.workshopOrders || []).length}</strong></div>
        <div class="metric"><span>Sin orden abierta</span><strong>${rows.filter(({ order }) => !order).length}</strong></div>
      </div>
      <div class="grid">
        <section class="panel">
          <div class="panel-header"><h3>Entradas detectadas</h3><span class="pill">${rows.length}</span></div>
          <div class="panel-body">
            <div class="form-grid">
              <label class="full">Buscar<input id="searchInput" value="${escapeHtml(state.query)}" placeholder="Boleta, cliente, marca, modelo, serie" /></label>
              <label class="full">Estado<select id="statusFilter">${statusOptions()}</select></label>
            </div><br />
            ${rows.length ? rows.map(orderCard).join("") : `<div class="empty">No hay equipos en taller con este filtro.</div>`}
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><h3>Ficha de taller</h3>${pair ? statusPill(pair.order?.status || "Sin abrir") : ""}</div>
          <div class="panel-body">${pair ? detailPanel(pair.job, pair.order) : `<div class="empty">Selecciona una entrada para trabajarla.</div>`}</div>
        </section>
      </div>`;
    shell(content);
    document.getElementById("searchInput").addEventListener("input", (event) => { state.query = event.target.value; renderOrders(); });
    document.getElementById("statusFilter").addEventListener("change", (event) => { state.statusFilter = event.target.value; renderOrders(); });
    document.getElementById("exportBtn").addEventListener("click", exportWorkshop);
    document.querySelectorAll("[data-select-job]").forEach((btn) => btn.addEventListener("click", () => { state.selectedKey = btn.getAttribute("data-select-job"); renderOrders(); }));
    document.querySelectorAll("[data-open-order]").forEach((btn) => btn.addEventListener("click", () => { const job = jobByKey(btn.getAttribute("data-open-order")); if (job) { ensureOrder(job); state.selectedKey = reportKey(job); renderOrders(); } }));
    const form = document.getElementById("workshopForm");
    if (form) {
      form.addEventListener("submit", saveOrderForm);
      form.querySelectorAll("[data-set-status]").forEach((btn) => btn.addEventListener("click", () => {
        const statusInput = form.querySelector('[name="status"]');
        const noteInput = form.querySelector('[name="quickNote"]');
        if (!statusInput) return;
        statusInput.value = btn.getAttribute("data-set-status") || statusInput.value;
        if (noteInput && !noteInput.value.trim()) {
          noteInput.value = `Cambio rapido a ${statusInput.value}`;
        }
      }));
    }
  }

  function jobByKey(key) {
    return workshopJobs().find((job) => reportKey(job) === key || ticket(job) === key) || null;
  }

  function statusOptions() {
    const items = [["abiertas", "Abiertas"], ["todos", "Todos"], ["Sin abrir", "Sin abrir"], ...workshopStatuses.map((s) => [s, s])];
    return items.map(([value, label]) => `<option value="${escapeHtml(value)}" ${state.statusFilter === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  }

  function statusPill(status) {
    const cls = status === "Entregado" || status === "Reparado" ? "green" : status === "No reparable" ? "red" : status === "Esperando repuesto" ? "amber" : "";
    return `<span class="pill ${cls}">${escapeHtml(status || "Sin abrir")}</span>`;
  }

  function orderCard({ job, order }) {
    const entry = job.workshopEntry || {};
    const key = reportKey(job);
    const isActive = key && key === state.selectedKey;
    return `<article class="card ${isActive ? "active" : ""}">
      <h4>${escapeHtml(ticket(job))} - ${escapeHtml(job.client || "Sin cliente")}</h4>
      <div class="meta">${statusPill(order?.status || "Sin abrir")}<span class="pill">${escapeHtml(entry.equipment || "Equipo")}</span><span class="pill">${escapeHtml(entry.brand || "Sin marca")}</span><span class="pill">${escapeHtml(job.vehicle || "Sin movil")}</span></div>
      <p>${escapeHtml(entry.reason || job.description || "Sin motivo registrado")}</p>
      <div class="toolbar"><button class="btn secondary" data-select-job="${escapeHtml(key)}">Ver</button>${order ? "" : `<button class="btn" data-open-order="${escapeHtml(key)}">Crear orden</button>`}</div>
    </article>`;
  }

  function detailPanel(job, order) {
    const entry = job.workshopEntry || {};
    if (!order) {
      return `<div class="case-detail">
        <h3>${escapeHtml(ticket(job))}</h3>
        ${kv("Cliente", job.client)}${kv("Direccion", job.address)}${kv("Tecnico reporte", job.technician)}${kv("Equipo", entry.equipment)}${kv("Marca/modelo", `${entry.brand || ""} ${entry.model || ""}`)}${kv("Serie", entry.serial)}${kv("Estado retiro", entry.condition)}${kv("Motivo", entry.reason)}
        <button class="btn" data-open-order="${escapeHtml(reportKey(job))}">Crear orden de taller</button>
      </div>`;
    }
    const workshopTechnicianOptions = workshopUsers().map((user) => {
      const label = `${userLabel(user)}${user.username ? ` - ${user.username}` : ""}`;
      return `<option value="${escapeHtml(label)}"></option>`;
    }).join("");
    const shortcuts = workshopStatuses.map((status) => `<button class="btn secondary status-shortcut ${order.status === status ? "active" : ""}" type="button" data-set-status="${escapeHtml(status)}">${escapeHtml(status)}</button>`).join("");
    return `<form id="workshopForm" class="form-grid">
      <input type="hidden" name="orderId" value="${escapeHtml(order.id)}" />
      <div class="full">${kv("Boleta", order.ticket)}${kv("Cliente", order.client)}${kv("Equipo", `${order.equipment || ""} ${order.brand || ""} ${order.model || ""}`)}${kv("Serie", order.serial)}${kv("Motivo entrada", order.reason)}${kv("Tecnico reporte", order.reportTechnician || "No registrado")}${kv("Movil", order.vehicle || "No registrada")}</div>
      <div class="full">
        <strong>Atajos de flujo</strong>
        <div class="toolbar status-shortcuts">${shortcuts}</div>
      </div>
      <label>Estado taller<select name="status">${workshopStatuses.map((s) => `<option ${order.status === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}</select></label>
      <label>Tecnico de taller<input name="workshopTechnician" list="workshopTechnicians" value="${escapeHtml(order.workshopTechnician || userLabel())}" /></label>
      <datalist id="workshopTechnicians">${workshopTechnicianOptions}</datalist>
      <label class="full">Diagnostico<textarea name="diagnosis" placeholder="Que fallo se encontro">${escapeHtml(order.diagnosis)}</textarea></label>
      <label class="full">Pruebas realizadas<textarea name="tests" placeholder="Mediciones, pruebas electricas, banco, controles, sensores">${escapeHtml(order.tests)}</textarea></label>
      <label class="full">Repuestos necesarios<textarea name="requiredParts" placeholder="Repuestos o materiales requeridos">${escapeHtml(order.requiredParts)}</textarea></label>
      <label class="full">Repuestos usados<textarea name="usedParts" placeholder="Que repuestos si se usaron realmente">${escapeHtml(order.usedParts || "")}</textarea></label>
      <label class="full">Trabajo realizado<textarea name="repairActions" placeholder="Que se reparo o ajusto">${escapeHtml(order.repairActions)}</textarea></label>
      <label class="full">Resultado<textarea name="result" placeholder="Resultado final o recomendacion">${escapeHtml(order.result)}</textarea></label>
      <label>Decision final<input name="finalDecision" value="${escapeHtml(order.finalDecision || "")}" placeholder="Ej: Reparado y listo, No reparable, Pendiente de repuesto" /></label>
      <label>Fecha estimada lista<input type="date" name="estimatedReadyDate" value="${escapeHtml(order.estimatedReadyDate || "")}" /></label>
      <label>Fecha entrega<input type="date" name="deliveryDate" value="${escapeHtml(order.deliveryDate || "")}" /></label>
      <label>Nota rapida<input name="quickNote" placeholder="Agregar nota a bitacora" /></label>
      <label class="full">Notas internas<textarea name="notes">${escapeHtml(order.notes)}</textarea></label>
      <div class="full toolbar"><button class="btn" type="submit">Guardar seguimiento</button></div>
      <div class="full"><h3>Historial de esta orden</h3>${historyHtml(order.history || [])}</div>
    </form>`;
  }

  function kv(label, value) {
    return `<div class="kv"><strong>${escapeHtml(label)}</strong><div>${escapeHtml(value || "No registrado")}</div></div>`;
  }

  function buildUpdateDetail(beforeStatus, order, quickNote) {
    if (quickNote) return quickNote;
    if (beforeStatus !== order.status) return `Estado: ${beforeStatus} -> ${order.status}`;
    if (order.finalDecision) return `Decision: ${order.finalDecision}`;
    return "Seguimiento actualizado";
  }

  function syncJobFromOrder(order) {
    const job = jobByKey(order.jobKey || order.ticket);
    if (!job) return;
    job.workshopOrderId = order.id;
    job.workshopStatus = order.status;
    job.workshopUpdatedAt = order.updatedAt;
    job.workshopTechnician = order.workshopTechnician || "";
    job.workshopSummary = {
      diagnosis: order.diagnosis || "",
      tests: order.tests || "",
      requiredParts: order.requiredParts || "",
      usedParts: order.usedParts || "",
      repairActions: order.repairActions || "",
      result: order.result || "",
      finalDecision: order.finalDecision || "",
      estimatedReadyDate: order.estimatedReadyDate || "",
      deliveryDate: order.deliveryDate || "",
      notes: order.notes || ""
    };
    if (order.status === "Entregado") {
      job.status = "Finalizado";
      job.workshopDeliveredAt = order.deliveryDate || today();
    } else if (job.status !== "En taller") {
      job.status = "En taller";
    }
  }

  function saveOrderForm(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const order = state.data.workshopOrders.find((item) => item.id === form.get("orderId"));
    if (!order) return alert("Orden no encontrada.");
    const beforeStatus = order.status;
    order.status = String(form.get("status") || order.status);
    order.workshopTechnician = String(form.get("workshopTechnician") || "").trim();
    order.diagnosis = String(form.get("diagnosis") || "").trim();
    order.tests = String(form.get("tests") || "").trim();
    order.requiredParts = String(form.get("requiredParts") || "").trim();
    order.usedParts = String(form.get("usedParts") || "").trim();
    order.repairActions = String(form.get("repairActions") || "").trim();
    order.result = String(form.get("result") || "").trim();
    order.finalDecision = String(form.get("finalDecision") || "").trim();
    order.estimatedReadyDate = String(form.get("estimatedReadyDate") || "").trim();
    order.deliveryDate = String(form.get("deliveryDate") || "").trim();
    order.notes = String(form.get("notes") || "").trim();
    order.updatedAt = nowIso();
    order.updatedBy = userLabel();
    order.history = Array.isArray(order.history) ? order.history : [];
    const quickNote = String(form.get("quickNote") || "").trim();
    const detail = buildUpdateDetail(beforeStatus, order, quickNote);
    order.history.unshift({ at: nowIso(), user: userLabel(), action: "Seguimiento de taller", detail });
    syncJobFromOrder(order);
    saveData("Actualizar orden de taller", `${order.ticket}: ${detail}`);
    alert("Seguimiento de taller guardado.");
    renderOrders();
  }

  function renderHistory() {
    const orders = [...(state.data.workshopOrders || [])].sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")));
    const content = `<div class="topbar"><div><h2>Historial de taller</h2><p>Ordenes creadas y movimientos registrados por taller.</p></div></div><section class="panel"><div class="panel-header"><h3>Ordenes</h3><span class="pill">${orders.length}</span></div><div class="panel-body">${orders.length ? orders.map((order) => `<article class="card"><h4>${escapeHtml(order.ticket)} - ${escapeHtml(order.client)}</h4><div class="meta">${statusPill(order.status)}<span class="pill">${escapeHtml(order.brand || "Sin marca")}</span><span class="pill">${escapeHtml(order.workshopTechnician || "Sin tecnico taller")}</span></div>${kv("Diagnostico", order.diagnosis)}${kv("Resultado", order.result)}<h4>Bitacora</h4>${historyHtml(order.history || [])}</article>`).join("") : `<div class="empty">No hay historial de taller todavia.</div>`}</div></section>`;
    shell(content);
  }

  function historyHtml(history) {
    if (!history.length) return `<div class="empty">Sin movimientos.</div>`;
    return `<div class="history">${history.map((item) => `<div class="history-item"><strong>${escapeHtml(item.action || "Movimiento")}</strong><br><small>${escapeHtml(formatDateTime(item.at))} - ${escapeHtml(item.user || "")}</small><br>${escapeHtml(item.detail || "")}</div>`).join("")}</div>`;
  }

  function renderBackup() {
    const content = `<div class="topbar"><div><h2>Respaldo Taller</h2><p>Importa un respaldo para prueba o exporta el seguimiento de taller.</p></div></div><div class="grid"><section class="panel"><div class="panel-header"><h3>Importar respaldo</h3></div><div class="panel-body"><p>Solo si estas probando fuera de la app principal. Si la app ya cargo datos, no hace falta.</p><button class="btn" id="importBtn">Importar JSON</button></div></section><section class="panel"><div class="panel-header"><h3>Exportar</h3></div><div class="panel-body"><p>Descarga ordenes de taller, reportes detectados y caja negra relacionada.</p><button class="btn" id="exportBtn">Descargar taller</button></div></section></div>`;
    shell(content);
    document.getElementById("importBtn").addEventListener("click", importBackup);
    document.getElementById("exportBtn").addEventListener("click", exportWorkshop);
  }

  function importBackup() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const payload = JSON.parse(text);
        const data = payload.data || payload;
        if (!data || !Array.isArray(data.jobs)) return alert("El respaldo no contiene reportes validos.");
        data.workshopOrders = Array.isArray(data.workshopOrders) ? data.workshopOrders : [];
        localStorage.setItem(FALLBACK_DATA_KEY, JSON.stringify(data));
        state.data = data;
        state.usingFallback = true;
        normalizeData();
        alert("Respaldo cargado para taller.");
        render();
      } catch (error) {
        alert("No se pudo leer el respaldo: " + error.message);
      }
    });
    input.click();
  }

  function exportWorkshop() {
    const payload = {
      exportedAt: nowIso(),
      module: "MG Portones Taller",
      version: VERSION,
      workshopOrders: state.data.workshopOrders || [],
      workshopJobs: workshopJobs(),
      audit: (state.data.auditLogs || []).filter((item) => String(item.module || "").includes("taller") || String(item.action || "").toLowerCase().includes("taller"))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `taller-mg-portones-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function init() {
    readData();
    readSession();
    render();
  }

  init();
})();

