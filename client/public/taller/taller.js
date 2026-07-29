(function () {
  "use strict";

  const APP_DATA_KEY = "mg_data";
  const APP_USER_KEY = "mg_user";
  // Taller must never duplicate the complete app state locally: reports can include
  // photo data and quickly exceed the browser storage quota.
  const FALLBACK_DATA_KEY = "mg_taller_cache_v61_8";
  const LEGACY_FALLBACK_DATA_KEY = "mg_taller_source_v60";
  const SESSION_KEY = "mg_taller_session_v60";
  const VERSION = "v61.8";
  const app = document.getElementById("app");

  const state = {
    view: "pendientes",
    query: "",
    statusFilter: "abiertas",
    selectedKey: "",
    data: null,
    user: null,
    usingFallback: false,
    syncState: "pending",
    syncMessage: "Cambios de taller pendientes de sincronizar.",
    lastSyncAt: ""
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
    const fallback = safeParse(localStorage.getItem(FALLBACK_DATA_KEY), null)
      || safeParse(localStorage.getItem(LEGACY_FALLBACK_DATA_KEY), null);
    state.usingFallback = !(appData && typeof appData === "object");
    state.data = mergeLocalData(appData, fallback);
    normalizeData();
    saveWorkshopCache();
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

  function mergeOrders(primary = [], secondary = []) {
    const orders = new Map();
    [...(primary || []), ...(secondary || [])].forEach((order) => {
      if (!order || !order.id) return;
      const previous = orders.get(String(order.id));
      const previousTime = Date.parse(previous?.updatedAt || previous?.createdAt || "") || 0;
      const currentTime = Date.parse(order.updatedAt || order.createdAt || "") || 0;
      if (!previous || currentTime >= previousTime) orders.set(String(order.id), order);
    });
    return Array.from(orders.values());
  }

  function mergeLocalData(appData, fallback) {
    const base = appData && typeof appData === "object" ? { ...appData } : (fallback && typeof fallback === "object" ? { ...fallback } : emptyData());
    base.workshopOrders = mergeOrders(appData?.workshopOrders, fallback?.workshopOrders);
    base.auditLogs = mergeOrders(appData?.auditLogs, fallback?.auditLogs);
    return base;
  }

  function compactWorkshopJob(job) {
    if (!isRecord(job) || !workshopData(job)) return null;
    return {
      id: job.id || "",
      ticket: job.ticket || "",
      boleta: job.boleta || "",
      client: job.client || "",
      phone: job.phone || "",
      address: job.address || "",
      date: job.date || "",
      technician: job.technician || "",
      vehicle: job.vehicle || "",
      status: job.status || "",
      workshopEntry: job.workshopEntry || null,
      workshopOrderId: job.workshopOrderId || "",
      workshopStatus: job.workshopStatus || "",
      workshopUpdatedAt: job.workshopUpdatedAt || "",
      workshopTechnician: job.workshopTechnician || "",
      workshopSummary: job.workshopSummary || "",
      workshopDeliveredAt: job.workshopDeliveredAt || "",
      updatedAt: job.updatedAt || ""
    };
  }

  function compactWorkshopUser(user) {
    if (!isRecord(user)) return null;
    return {
      id: user.id || "",
      name: user.name || user.nombre || "",
      username: user.username || user.user || "",
      email: user.email || "",
      role: user.role || user.rol || user.tipo || "",
      workshopAccess: user.workshopAccess === true
    };
  }

  function saveWorkshopCache() {
    const compact = {
      users: (state.data.users || []).map(compactWorkshopUser).filter(Boolean),
      jobs: (state.data.jobs || []).map(compactWorkshopJob).filter(Boolean),
      workshopOrders: state.data.workshopOrders || [],
      auditLogs: (state.data.auditLogs || []).filter((item) => String(item?.module || "").toLowerCase().includes("taller")),
      syncQueue: (state.data.syncQueue || []).filter((item) => item?.type === "workshop_update")
    };
    // Removing the former full duplicate first releases storage occupied by photos.
    localStorage.removeItem(LEGACY_FALLBACK_DATA_KEY);
    try {
      localStorage.setItem(FALLBACK_DATA_KEY, JSON.stringify(compact));
    } catch (error) {
      console.warn("No se pudo guardar el respaldo compacto de Taller", error);
    }
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
    // Keep a compact Taller-only copy. The main app owns mg_data and may include photos.
    saveWorkshopCache();
    syncWorkshopToCloud().catch(() => null);
  }

  function supabaseConfig() {
    const config = window.MG_SUPABASE_CONFIG || {};
    const url = String(config.url || "").replace(/\/$/, "");
    const anonKey = String(config.anonKey || "");
    return { url, anonKey, ready: url.startsWith("https://") && anonKey.startsWith("sb_") };
  }

  async function supabaseRequest(path, options = {}) {
    const config = supabaseConfig();
    if (!config.ready) throw new Error("Supabase no configurado");
    const response = await fetch(`${config.url}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(options.headers || {})
      }
    });
    if (!response.ok) throw new Error(await response.text());
    return response.status === 204 ? null : response.json();
  }

  function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function workshopData(job) {
    return isRecord(job) && Boolean(job.workshopOrderId || job.workshopSummary || job.workshopStatus || job.workshopDeliveredAt || job.status === "En taller" || job.workshopEntry);
  }

  function mergeWorkshopJobs(cloudJobs = [], localJobs = []) {
    const jobs = new Map();
    (Array.isArray(cloudJobs) ? cloudJobs : []).filter(isRecord).forEach((job) => {
      const key = reportKey(job);
      if (key) jobs.set(key, job);
    });

    (Array.isArray(localJobs) ? localJobs : []).filter(workshopData).forEach((localJob) => {
      const key = reportKey(localJob);
      if (!key) return;
      const cloudJob = jobs.get(key);
      if (!cloudJob) {
        // Only a report that has real Taller data can be added when it is not yet in the cloud.
        jobs.set(key, localJob);
        return;
      }
      jobs.set(key, {
        ...cloudJob,
        workshopEntry: localJob.workshopEntry || cloudJob.workshopEntry,
        workshopOrderId: localJob.workshopOrderId || cloudJob.workshopOrderId,
        workshopStatus: localJob.workshopStatus || cloudJob.workshopStatus,
        workshopUpdatedAt: localJob.workshopUpdatedAt || cloudJob.workshopUpdatedAt,
        workshopTechnician: localJob.workshopTechnician || cloudJob.workshopTechnician,
        workshopSummary: localJob.workshopSummary || cloudJob.workshopSummary,
        workshopDeliveredAt: localJob.workshopDeliveredAt || cloudJob.workshopDeliveredAt,
        status: localJob.status === "En taller" || localJob.workshopDeliveredAt ? localJob.status : cloudJob.status,
        updatedAt: localJob.updatedAt || cloudJob.updatedAt
      });
    });
    return Array.from(jobs.values());
  }

  function mergeWorkshopAuditLogs(cloudLogs = [], localLogs = []) {
    const isWorkshopLog = (item) => isRecord(item) && (String(item.module || "").toLowerCase().includes("taller") || String(item.action || "").toLowerCase().includes("taller"));
    return mergeOrders(
      (Array.isArray(cloudLogs) ? cloudLogs : []).filter(isRecord),
      (Array.isArray(localLogs) ? localLogs : []).filter(isWorkshopLog)
    );
  }

  function pendingWorkshopChanges() {
    return (state.data?.syncQueue || []).filter((item) => item?.type === "workshop_update").length;
  }

  function syncLabel() {
    const pending = pendingWorkshopChanges();
    if (state.syncState === "syncing") return "Sincronizando Taller...";
    if (state.syncState === "synced") return `Taller sincronizado${state.lastSyncAt ? `: ${formatDateTime(state.lastSyncAt)}` : ""}`;
    if (state.syncState === "error") return `No se pudo sincronizar. ${pending} cambio(s) quedan guardados en este dispositivo.`;
    if (!navigator.onLine) return `Sin internet. ${pending} cambio(s) quedan guardados en este dispositivo.`;
    return pending ? `${pending} cambio(s) de Taller pendientes de sincronizar.` : "Taller listo para sincronizar.";
  }

  async function syncWorkshopToCloud() {
    const pending = pendingWorkshopChanges();
    if (!navigator.onLine) {
      state.syncState = "offline";
      state.syncMessage = "Sin internet";
      return { ok: false, reason: "offline" };
    }
    if (!supabaseConfig().ready) {
      state.syncState = "error";
      state.syncMessage = "Supabase no configurado";
      return { ok: false, reason: "config" };
    }
    state.syncState = "syncing";
    try {
      const rows = await supabaseRequest("app_state?select=data&id=eq.production");
      const cloudData = rows?.[0]?.data || {};
      const merged = {
        ...cloudData,
        workshopOrders: mergeOrders(cloudData.workshopOrders, state.data.workshopOrders),
        jobs: mergeWorkshopJobs(cloudData.jobs, state.data.jobs),
        auditLogs: mergeWorkshopAuditLogs(cloudData.auditLogs, state.data.auditLogs),
        syncQueue: (cloudData.syncQueue || []).filter((item) => item?.type !== "workshop_update")
      };
      const payload = { data: merged, updated_at: nowIso() };
      const updated = await supabaseRequest("app_state?id=eq.production", { method: "PATCH", body: JSON.stringify(payload) });
      if (!Array.isArray(updated) || !updated.length) {
        await supabaseRequest("app_state?on_conflict=id", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=representation" },
          body: JSON.stringify({ id: "production", ...payload })
        });
      }
      // Preserve the merged cloud state locally so the next edit starts from the newest order history.
      state.data = { ...state.data, ...merged };
      state.data.syncQueue = state.data.syncQueue.filter((item) => item?.type !== "workshop_update");
      saveWorkshopCache();
      state.syncState = "synced";
      state.lastSyncAt = nowIso();
      state.syncMessage = pending ? "Cambios enviados a Supabase" : "Datos verificados en Supabase";
      return { ok: true };
    } catch (error) {
      state.syncState = "error";
      state.syncMessage = String(error?.message || "Error de sincronizacion").slice(0, 180);
      console.warn("No se pudo sincronizar Taller con Supabase", error);
      return { ok: false, reason: "error", error };
    }
  }

  async function syncWorkshopNow() {
    const result = await syncWorkshopToCloud();
    render();
    if (result.ok) {
      alert("Taller sincronizado con Supabase. Ya puedes verificarlo desde otro dispositivo.");
    } else if (result.reason === "offline") {
      alert("No hay internet. Los cambios siguen guardados en este dispositivo y se reintentaran al volver la conexion.");
    } else {
      alert(`No se pudo sincronizar Taller. Los cambios no se borraron. Motivo: ${state.syncMessage || "revisa la conexion y vuelve a intentarlo."}`);
    }
  }

  async function loadWorkshopCloud() {
    if (!navigator.onLine || !supabaseConfig().ready) return;
    try {
      const rows = await supabaseRequest("app_state?select=data&id=eq.production");
      const cloudData = rows?.[0]?.data;
      if (!cloudData || typeof cloudData !== "object") return;
      state.data.workshopOrders = mergeOrders(cloudData.workshopOrders, state.data.workshopOrders);
      state.data.jobs = mergeWorkshopJobs(cloudData.jobs, state.data.jobs);
      state.data.auditLogs = mergeWorkshopAuditLogs(cloudData.auditLogs, state.data.auditLogs);
      normalizeData();
      saveWorkshopCache();
      state.syncState = "synced";
      state.lastSyncAt = nowIso();
      state.syncMessage = "Datos de Taller cargados desde Supabase";
    } catch (error) {
      // Local save remains the source of continuity when a connection fails.
      console.warn("No se pudo cargar Taller desde Supabase", error);
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
    if (!isRecord(job)) return "";
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
          <div class="nav-return"><button class="btn secondary" id="backBtn" type="button">Volver a la app</button></div>
          <div class="session-card">
            <strong>${escapeHtml(userLabel())}</strong><br />
            Rol: ${escapeHtml(role() || "sin rol")}<br />
            Datos: ${state.usingFallback ? "respaldo importado" : "app actual"}<br />
            Version: ${VERSION}
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
        <div class="toolbar"><span class="pill" title="${escapeHtml(state.syncMessage)}">${escapeHtml(syncLabel())}</span><button class="btn secondary" id="syncBtn">Sincronizar ahora</button><button class="btn secondary" id="exportBtn">Exportar taller</button></div>
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
    document.getElementById("syncBtn").addEventListener("click", syncWorkshopNow);
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
    job.updatedAt = nowIso();
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
        const importedJobs = Array.isArray(data?.jobs) ? data.jobs : (Array.isArray(data?.workshopJobs) ? data.workshopJobs : []);
        const importedOrders = Array.isArray(data?.workshopOrders) ? data.workshopOrders : [];
        if (!data || (!importedJobs.length && !importedOrders.length)) return alert("El respaldo no contiene datos validos de Taller.");
        state.data.workshopOrders = mergeOrders(state.data.workshopOrders, importedOrders);
        state.data.jobs = mergeWorkshopJobs(state.data.jobs, importedJobs);
        normalizeData();
        saveData("Restaurar respaldo de taller", `${importedOrders.length} orden(es) recuperada(s)`);
        alert("Respaldo recuperado y guardado en Taller.");
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

  async function init() {
    readData();
    readSession();
    await loadWorkshopCloud();
    window.addEventListener("online", () => { syncWorkshopToCloud().then(() => render()).catch(() => null); });
    render();
  }

  init();
})();

