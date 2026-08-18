(function () {
  "use strict";

  const STORAGE_KEY = "mg_general_inventory_demo_v1";
  const APP_USER_KEY = "mg_user";
  const app = document.getElementById("app");
  const state = { query: "", location: "", visibleLimit: 24, products: [], archivedProducts: [], movements: [], vehicles: [], users: [], currentUserId: "admin", sharedUser: null, modal: null, cloudStatus: "Preparando copia local..." };
  let sharedRefreshDeferred = false;

  const seed = {
    products: [
      { id: "inv-1", name: "Control remoto universal", code: "CR-UNI-01", category: "Controles", qty: 18, min: 8, max: 35, location: "Bodega central / Estante A / Caja 2", supplier: "Proveedor local", condition: "Nuevo", notes: "Compatible con la mayoria de receptores.", photo: "" },
      { id: "inv-2", name: "Sensor fotoelectrico", code: "SEN-FOT-02", category: "Seguridad", qty: 5, min: 7, max: 20, location: "Bodega central / Estante B / Caja 1", supplier: "Distribuidor tecnico", condition: "Nuevo", notes: "Revisar par antes de salida.", photo: "" },
      { id: "inv-3", name: "Capacitor 15 uF", code: "CAP-15UF", category: "Electrico", qty: 24, min: 10, max: 40, location: "Bodega central / Gaveta C-04", supplier: "Electro repuestos", condition: "Nuevo", notes: "Uso para motores residenciales.", photo: "" }
    ],
    movements: [],
    users: [
      { id: "admin", name: "Administrador General", role: "Administrador", inventoryAccess: true },
      { id: "bodega", name: "Encargado de bodega", role: "Operador", inventoryAccess: false },
      { id: "tecnico-1", name: "Tecnico MOV-07", role: "Tecnico", inventoryAccess: false },
      { id: "tecnico-2", name: "Tecnico MOV-08", role: "Tecnico", inventoryAccess: false }
    ]
  };

  function id(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
  function esc(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function number(value) { return Math.max(0, Number(value || 0)); }
  function safeParse(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; } }
  function normalize(value) { return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }
  function readSharedSession() { state.sharedUser = safeParse(localStorage.getItem(APP_USER_KEY), null); }
  function currentUser() { return state.sharedUser || state.users.find((user) => user.id === state.currentUserId) || state.users[0]; }
  function isAdmin() {
    const role = normalize(currentUser()?.role || currentUser()?.rol || currentUser()?.tipo);
    return ["admin", "administrador", "gerencia", "supervisor"].includes(role);
  }
  function canUseInventory() {
    const user = currentUser();
    if (isAdmin()) return true;
    return state.sharedUser ? user?.inventoryGeneralAccess === true : Boolean(user?.inventoryAccess);
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      state.products = Array.isArray(saved?.products) ? saved.products : seed.products;
      state.archivedProducts = Array.isArray(saved?.archivedProducts) ? saved.archivedProducts : [];
      state.movements = Array.isArray(saved?.movements) ? saved.movements : seed.movements;
      state.users = Array.isArray(saved?.users) && saved.users.length ? saved.users : seed.users;
      state.currentUserId = state.users.some((user) => user.id === saved?.currentUserId) ? saved.currentUserId : "admin";
    } catch (_) {
      state.products = seed.products;
      state.archivedProducts = [];
      state.movements = [];
      state.users = seed.users;
    }
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify({ products: state.products, archivedProducts: state.archivedProducts, movements: state.movements, users: state.users, currentUserId: state.currentUserId })); }
  function cloud() { return window.MG_GENERAL_INVENTORY_CLOUD; }
  function hasActiveGeneralForm() { return Boolean(state.modal); }
  function resumeSharedUserRefresh() {
    if (!sharedRefreshDeferred || hasActiveGeneralForm()) return;
    sharedRefreshDeferred = false;
    refreshSharedUser();
  }
  async function refreshSharedUser() {
    if (!state.sharedUser || !cloud()?.loadAppUser) return;
    if (hasActiveGeneralForm()) { sharedRefreshDeferred = true; return; }
    try {
      const current = await cloud().loadAppUser(state.sharedUser);
      if (hasActiveGeneralForm()) { sharedRefreshDeferred = true; return; }
      if (!current || current.active === false) {
        state.sharedUser = null;
        localStorage.removeItem(APP_USER_KEY);
      } else {
        state.sharedUser = current;
        localStorage.setItem(APP_USER_KEY, JSON.stringify(current));
      }
      render();
    } catch (_) {
      // Sin conexion se conserva la ultima sesion local hasta poder actualizarla.
    }
  }
  async function syncCloud(showMessage) {
    if (!cloud()?.ready()) { state.cloudStatus = "Supabase no configurado. La copia queda local."; render(); return false; }
    try {
      state.cloudStatus = "Sincronizando inventario y movimientos...";
      render();
      await cloud().sync(state.products, state.movements);
      if (state.archivedProducts.length && cloud().archiveProducts) {
        await cloud().archiveProducts(state.archivedProducts.map((product) => product.id));
      }
      state.cloudStatus = `Supabase sincronizado: ${new Date().toLocaleTimeString()}`;
      render();
      if (showMessage) alert("Inventario general sincronizado con Supabase.");
      return true;
    } catch (error) {
      state.cloudStatus = "No se pudo sincronizar. La copia local sigue protegida.";
      render();
      if (showMessage) alert(`No se pudo sincronizar con Supabase. ${error.message || ""}`);
      return false;
    }
  }
  function available(product) { return number(product.qty); }
  function low(product) { return available(product) <= number(product.min); }
  function matchingProducts() {
    const q = state.query.toLowerCase().trim();
    return state.products.filter((product) => (!state.location || product.location === state.location) && (!q || [product.name, product.code, product.category, product.location, product.supplier].join(" ").toLowerCase().includes(q))).sort((a, b) => Number(low(b)) - Number(low(a)) || a.name.localeCompare(b.name));
  }
  function locations() { return [...new Set(state.products.map((product) => product.location).filter(Boolean))].sort(); }
  function render() {
    const user = currentUser();
    if (!canUseInventory()) {
      app.innerHTML = `<div class="shell"><header class="top"><div><h1>Inventario general MG Portones</h1><p>Control de bodega, repuestos y existencias.</p></div>${sessionMarkup()}</header><section class="panel blocked"><h2>Acceso no autorizado</h2><p>${esc(user?.name)} no tiene permiso para usar Inventario General.</p><p>Un administrador debe activar su acceso desde Usuarios en MG Portones.</p></section></div>`;
      bind();
      return;
    }
    const lowCount = state.products.filter(low).length;
    const units = state.products.reduce((sum, product) => sum + available(product), 0);
    app.innerHTML = `<div class="shell">
      <header class="top"><div><h1>Inventario general MG Portones</h1><p>Control de bodega, repuestos y existencias.</p></div>${sessionMarkup()}</header>
      <div class="notice"><strong>Inventario general:</strong> puede trasladar existencias a una movil; el traslado descuenta la bodega y suma el producto a la unidad elegida.<span class="cloud-status">${esc(state.cloudStatus)}</span></div>
      <section class="summary"><article class="metric"><span>Productos registrados</span><strong>${state.products.length}</strong></article><article class="metric"><span>Unidades disponibles</span><strong>${units}</strong></article><article class="metric"><span>Stock bajo</span><strong>${lowCount}</strong></article><article class="metric"><span>Movimientos hoy</span><strong>${state.movements.filter((movement) => String(movement.at || "").slice(0, 10) === new Date().toISOString().slice(0, 10)).length}</strong></article></section>
      <section class="layout"><section class="panel"><div class="panel-header"><h2>Existencias</h2><div class="header-actions"><button class="secondary" id="sync">Sincronizar Supabase</button><button class="secondary" id="export">Descargar respaldo</button>${isAdmin() ? `<button class="secondary" id="trash">Papelera (${state.archivedProducts.length})</button>` : ""}<button class="primary" id="newProduct">Agregar producto</button></div></div><div class="panel-body"><div class="filters"><label>Buscar producto<input id="query" value="${esc(state.query)}" placeholder="Nombre, codigo, categoria, proveedor o ubicacion" /></label><label>Ubicacion<select id="location"><option value="">Todas las ubicaciones</option>${locations().map((item) => `<option ${item === state.location ? "selected" : ""}>${esc(item)}</option>`).join("")}</select></label></div><div id="products">${productsMarkup()}</div></div></section>
      <aside class="panel"><div class="panel-header"><h2>Ultimos movimientos</h2></div><div class="panel-body">${state.movements.length ? state.movements.slice(0, 10).map((movement) => `<div class="movement"><strong>${esc(movement.productName)}: ${movement.type === "entrada" ? "+" : movement.type === "salida" ? "-" : "="}${movement.qty}</strong><span>${esc(movement.reason || "Sin detalle")} · ${new Date(movement.at).toLocaleString()}</span></div>`).join("") : '<div class="empty">Todavia no hay movimientos.</div>'}</div></aside></section>
      ${state.modal ? modalMarkup() : ""}
    </div>`;
    bind();
  }
  function productsMarkup() {
    const products = matchingProducts();
    if (!products.length) return '<div class="empty">No hay productos que coincidan con la busqueda.</div>';
    const visible = products.slice(0, state.visibleLimit);
    const remaining = products.length - visible.length;
    return `${visible.map(productCard).join("")}${remaining > 0 ? `<div class="load-more"><button class="secondary" id="showMoreProducts">Mostrar ${Math.min(24, remaining)} productos mas</button><span>${visible.length} de ${products.length} productos</span></div>` : ""}`;
  }
  function sessionMarkup() {
    const user = currentUser();
    if (state.sharedUser) {
      return `<div class="session"><div class="session-user"><strong>Sesion MG Portones</strong><span>${esc(user?.name || user?.username || user?.usuario || "Usuario")} - ${esc(user?.role || user?.rol || "Usuario")}</span></div><button class="secondary" id="returnApp">Volver a MG Portones</button></div>`;
    }
    return `<div class="session"><label>Sesion de demostracion<select id="sessionUser">${state.users.map((item) => `<option value="${esc(item.id)}" ${item.id === user?.id ? "selected" : ""}>${esc(item.name)} - ${esc(item.role)}</option>`).join("")}</select></label>${isAdmin() ? '<button class="secondary" id="permissions">Permisos</button>' : ""}<button class="secondary" id="returnApp">Volver a MG Portones</button></div>`;
  }
  function productCard(product) {
    return `<article class="product"><div>${product.photo ? `<img class="thumb" src="${product.photo}" alt="${esc(product.name)}" loading="lazy" decoding="async" />` : '<div class="thumb">Sin foto</div>'}</div><div><h3>${esc(product.name)} ${low(product) ? '<span class="tag low">Stock bajo</span>' : ""}</h3><div class="meta"><span class="tag">${esc(product.code || "Sin codigo")}</span><span>${available(product)} unidades</span><span>Minimo: ${number(product.min)}</span><span>${esc(product.location || "Sin ubicacion")}</span></div><p>${esc(product.category || "Sin categoria")} · ${esc(product.condition || "Sin estado")} · ${esc(product.supplier || "Sin proveedor")}</p></div><div class="actions"><button class="secondary" data-edit="${product.id}">Editar</button><button class="primary" data-move="${product.id}">Movimiento</button>${isAdmin() ? `<button class="danger" data-delete="${product.id}">Eliminar</button>` : ""}</div></article>`;
  }
  function modalMarkup() {
    if (state.modal.type === "permissions") return permissionsMarkup();
    if (state.modal.type === "trash") return trashMarkup();
    const product = state.products.find((item) => item.id === state.modal.id) || {};
    if (state.modal.type === "move") return `<div class="modal"><form class="dialog" id="movementForm"><div class="dialog-top"><h2>Movimiento: ${esc(product.name)}</h2><button class="secondary" type="button" data-close>Cerrar</button></div><div class="dialog-body"><input type="hidden" name="id" value="${esc(product.id)}" /><div class="form-grid"><label>Tipo<select name="type"><option value="entrada">Entrada a bodega</option><option value="salida">Salida de bodega</option><option value="ajuste">Ajuste de inventario</option><option value="traslado">Traslado a movil</option></select></label><label>Cantidad<input name="qty" type="number" min="1" required /></label><label>Movil destino<select name="vehicle"><option value="">Seleccione una movil</option>${state.vehicles.map((vehicle) => `<option value="${esc(vehicle.code)}">${esc(vehicle.code)}${vehicle.name ? ` - ${esc(vehicle.name)}` : ""}</option>`).join("")}</select></label><label class="full">Motivo / referencia<input name="reason" required placeholder="Factura, boleta, reposicion, conteo..." /></label><label class="full">Responsable<input name="responsible" value="${esc(currentUser()?.name)}" /></label></div><p class="help">La movil destino se usa solamente al elegir Traslado a movil.</p><div class="dialog-actions"><button class="primary">Guardar movimiento</button></div></div></form></div>`;
    return `<div class="modal"><form class="dialog" id="productForm"><div class="dialog-top"><h2>${product.id ? "Editar producto" : "Agregar producto"}</h2><button class="secondary" type="button" data-close>Cerrar</button></div><div class="dialog-body"><input type="hidden" name="id" value="${esc(product.id || "")}" /><div class="form-grid"><label>Nombre del producto<input name="name" required value="${esc(product.name)}" /></label><label>Codigo / SKU<input name="code" value="${esc(product.code)}" placeholder="Ej. CR-UNI-01" /></label><label>Categoria<input name="category" value="${esc(product.category)}" placeholder="Controles, motores, electrico..." /></label><label>Estado<select name="condition"><option ${product.condition === "Nuevo" ? "selected" : ""}>Nuevo</option><option ${product.condition === "Usado" ? "selected" : ""}>Usado</option><option ${product.condition === "Para revisar" ? "selected" : ""}>Para revisar</option></select></label><label>Cantidad actual<input name="qty" type="number" min="0" required value="${number(product.qty)}" /></label><label>Stock minimo<input name="min" type="number" min="0" value="${number(product.min)}" /></label><label>Stock maximo<input name="max" type="number" min="0" value="${number(product.max)}" /></label><label>Proveedor<input name="supplier" value="${esc(product.supplier)}" /></label><label class="full">Ubicacion exacta<input name="location" required value="${esc(product.location)}" placeholder="Bodega / Estante / Gaveta / Caja" /></label><label class="full">Foto del producto<input name="photo" type="file" accept="image/*" /></label><label class="full">Notas<textarea name="notes" placeholder="Compatibilidad, numero de serie, lote o advertencias">${esc(product.notes)}</textarea></label></div><div class="dialog-actions"><button class="primary">Guardar producto</button></div></div></form></div>`;
  }
  function permissionsMarkup() {
    return `<div class="modal"><form class="dialog" id="permissionsForm"><div class="dialog-top"><h2>Permisos de Inventario General</h2><button class="secondary" type="button" data-close>Cerrar</button></div><div class="dialog-body"><p class="help">El administrador mantiene acceso permanente. Active solamente a las personas que deban gestionar la bodega.</p><div class="permission-list">${state.users.map((user) => `<label class="permission"><span><strong>${esc(user.name)}</strong><small>${esc(user.role)}</small></span><input type="checkbox" name="access" value="${esc(user.id)}" ${user.inventoryAccess || user.role === "Administrador" ? "checked" : ""} ${user.role === "Administrador" ? "disabled" : ""} /></label>`).join("")}</div><div class="dialog-actions"><button class="primary">Guardar permisos</button></div></div></form></div>`;
  }
  function trashMarkup() {
    const products = state.archivedProducts;
    return `<div class="modal"><section class="dialog"><div class="dialog-top"><h2>Papelera de productos</h2><button class="secondary" type="button" data-close>Cerrar</button></div><div class="dialog-body"><p class="help">Los productos archivados no aparecen en existencias ni se eliminan permanentemente. Sus movimientos se conservan.</p>${products.length ? `<div class="permission-list">${products.map((product) => `<div class="permission"><span><strong>${esc(product.name)}</strong><small>${esc(product.code || "Sin codigo")} · Archivado ${new Date(product.archivedAt || Date.now()).toLocaleString()}</small></span><button class="secondary" data-restore="${esc(product.id)}">Restaurar</button></div>`).join("")}</div>` : '<div class="empty">La papelera esta vacia.</div>'}</div></section></div>`;
  }
  function bind() {
    document.getElementById("sessionUser")?.addEventListener("change", (event) => { state.currentUserId = event.target.value; save(); render(); });
    document.getElementById("returnApp")?.addEventListener("click", () => { window.location.href = "../index.html"; });
    document.getElementById("permissions")?.addEventListener("click", () => { state.modal = { type: "permissions" }; render(); });
    document.getElementById("trash")?.addEventListener("click", () => { state.modal = { type: "trash" }; render(); });
    document.getElementById("newProduct")?.addEventListener("click", () => { state.modal = { type: "product", id: "" }; render(); });
    document.getElementById("query")?.addEventListener("input", (event) => {
      state.query = event.target.value;
      state.visibleLimit = 24;
      const products = document.getElementById("products");
      if (products) products.innerHTML = productsMarkup();
      bindProductActions();
    });
    document.getElementById("location")?.addEventListener("change", (event) => { state.location = event.target.value; state.visibleLimit = 24; render(); });
    document.getElementById("showMoreProducts")?.addEventListener("click", () => { state.visibleLimit += 24; const products = document.getElementById("products"); if (products) products.innerHTML = productsMarkup(); bindProductActions(); });
    document.getElementById("export")?.addEventListener("click", exportData);
    document.getElementById("sync")?.addEventListener("click", () => syncCloud(true));
    bindProductActions();
    document.querySelectorAll("[data-restore]").forEach((button) => button.addEventListener("click", () => restoreProduct(button.dataset.restore)));
    document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => { state.modal = null; render(); resumeSharedUserRefresh(); }));
    document.getElementById("productForm")?.addEventListener("submit", saveProduct);
    document.getElementById("movementForm")?.addEventListener("submit", saveMovement);
    document.getElementById("permissionsForm")?.addEventListener("submit", savePermissions);
  }
  function bindProductActions() {
    document.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => { state.modal = { type: "product", id: button.dataset.edit }; render(); }));
    document.querySelectorAll("[data-move]").forEach((button) => button.addEventListener("click", () => { state.modal = { type: "move", id: button.dataset.move }; render(); }));
    document.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", () => archiveProduct(button.dataset.delete)));
  }
  async function saveProduct(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const idValue = form.get("id") || id("product");
    const code = String(form.get("code") || "").trim();
    if (code && state.products.some((product) => product.code.toLowerCase() === code.toLowerCase() && product.id !== idValue)) return alert("Ya existe otro producto con ese codigo / SKU.");
    const current = state.products.find((product) => product.id === idValue) || {};
    let photo = current.photo || "";
    const file = form.get("photo");
    if (file && file.size) {
      try {
        photo = cloud()?.ready() ? await cloud().uploadPhoto(file, idValue) : await readImage(file);
      } catch (error) {
        photo = await readImage(file);
        state.cloudStatus = "Foto guardada localmente; se reintentara al sincronizar.";
        alert(`La foto se guardo como copia local. Supabase respondio: ${error.message || "error"}`);
      }
    }
    const product = { ...current, id: idValue, name: String(form.get("name") || "").trim(), code, category: String(form.get("category") || "").trim(), condition: String(form.get("condition") || "Nuevo"), qty: number(form.get("qty")), min: number(form.get("min")), max: number(form.get("max")), supplier: String(form.get("supplier") || "").trim(), location: String(form.get("location") || "").trim(), notes: String(form.get("notes") || "").trim(), photo };
    const index = state.products.findIndex((item) => item.id === product.id);
    if (index >= 0) state.products[index] = product; else state.products.unshift(product);
    save(); state.modal = null; render(); resumeSharedUserRefresh(); syncCloud(false);
  }
  async function saveMovement(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const product = state.products.find((item) => item.id === form.get("id"));
    if (!product) return;
    const qty = number(form.get("qty"));
    const type = String(form.get("type"));
    if ((type === "salida" || type === "traslado") && qty > product.qty) return alert("No hay suficiente existencia para esa salida o traslado.");
    const reason = String(form.get("reason") || "").trim();
    const responsible = String(form.get("responsible") || currentUser()?.name || "").trim();
    const movementId = id("move");
    if (type === "traslado") {
      const vehicle = String(form.get("vehicle") || "").trim();
      if (!vehicle) return alert("Seleccione la movil que recibira el producto.");
      if (!cloud()?.ready() || !cloud()?.transferToVehicle) return alert("El traslado requiere conexion a Supabase.");
      try {
        await cloud().transferToVehicle({ transferId: movementId, product, quantity: qty, vehicle, reason, responsible });
        product.qty -= qty;
        state.movements.unshift({ id: movementId, productId: product.id, productName: product.name, type, qty, reason: `Traslado a ${vehicle}: ${reason}`, responsible, at: new Date().toISOString() });
        save(); state.modal = null; render(); resumeSharedUserRefresh(); await syncCloud(false); return;
      } catch (error) { return alert(`No se pudo trasladar a la movil. ${error.message || "Revise la conexion."}`); }
    }
    product.qty = type === "entrada" ? product.qty + qty : type === "salida" ? product.qty - qty : qty;
    state.movements.unshift({ id: movementId, productId: product.id, productName: product.name, type, qty, reason, responsible, at: new Date().toISOString() });
    save(); state.modal = null; render(); resumeSharedUserRefresh(); syncCloud(false);
  }
  function savePermissions(event) {
    event.preventDefault();
    if (!isAdmin()) return;
    const granted = new Set(new FormData(event.currentTarget).getAll("access"));
    state.users = state.users.map((user) => ({ ...user, inventoryAccess: user.role === "Administrador" || granted.has(user.id) }));
    save(); state.modal = null; render(); resumeSharedUserRefresh();
  }
  function archiveProduct(productId) {
    if (!isAdmin()) return alert("Solo un administrador puede archivar productos.");
    const product = state.products.find((item) => item.id === productId);
    if (!product) return;
    if (!confirm(`Archivar ${product.name}? Se podra restaurar desde la papelera.`)) return;
    state.products = state.products.filter((item) => item.id !== productId);
    state.archivedProducts.unshift({ ...product, archivedAt: new Date().toISOString() });
    save(); render(); syncCloud(false);
  }
  function restoreProduct(productId) {
    if (!isAdmin()) return;
    const product = state.archivedProducts.find((item) => item.id === productId);
    if (!product) return;
    const { archivedAt, ...restored } = product;
    state.archivedProducts = state.archivedProducts.filter((item) => item.id !== productId);
    state.products.unshift(restored);
    save(); state.modal = { type: "trash" }; render(); syncCloud(false);
  }
  function readImage(file) { return new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || "")); reader.readAsDataURL(file); }); }
  function exportData() {
    const payload = { exportedAt: new Date().toISOString(), module: "Inventario General MG Portones - Demo", products: state.products, archivedProducts: state.archivedProducts, movements: state.movements, users: state.users, currentUserId: state.currentUserId };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventario-general-demo-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
  async function start() {
    load();
    readSharedSession();
    render();
    void refreshSharedUser();
    if (!cloud()?.ready()) return;
    try {
      state.cloudStatus = "Cargando productos desde Supabase...";
      render();
      const [products, vehicles] = await Promise.all([
        cloud().loadProducts ? cloud().loadProducts() : cloud().load().then((remote) => remote.products),
        cloud().loadVehicles ? cloud().loadVehicles() : Promise.resolve([])
      ]);
      if (products.length) {
        state.products = products;
        state.vehicles = vehicles;
        save();
        state.cloudStatus = `Productos cargados: ${new Date().toLocaleTimeString()}`;
        render();
      } else {
        await syncCloud(false);
      }
      if (cloud().loadSecondary) {
        void cloud().loadSecondary().then((secondary) => {
          state.archivedProducts = Array.isArray(secondary.archivedProducts) ? secondary.archivedProducts : state.archivedProducts;
          state.movements = Array.isArray(secondary.movements) ? secondary.movements : state.movements;
          save();
          state.cloudStatus = `Inventario actualizado: ${new Date().toLocaleTimeString()}`;
          render();
        }).catch(() => {});
      }
    } catch (_) {
      state.cloudStatus = "Supabase aun no esta preparado. Trabajando con copia local.";
    }
    render();
  }
  window.addEventListener("focus", refreshSharedUser);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") refreshSharedUser(); });
  window.setInterval(refreshSharedUser, 30000);
  start();
})();
