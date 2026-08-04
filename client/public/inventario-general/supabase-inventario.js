(function () {
  "use strict";

  const BUCKET = "mg-general-inventory-photos";
  const config = () => window.MG_GENERAL_INVENTORY_SUPABASE || {};
  const ready = () => Boolean(config().url && config().anonKey);

  async function request(path, options) {
    if (!ready()) throw new Error("Falta configurar Supabase para Inventario General.");
    const response = await fetch(`${config().url.replace(/\/$/, "")}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: config().anonKey,
        Authorization: `Bearer ${config().anonKey}`,
        "Content-Type": "application/json",
        ...(options?.headers || {})
      }
    });
    if (!response.ok) throw new Error((await response.text()) || `Supabase respondio ${response.status}`);
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  function productToRow(product) {
    return {
      id: product.id,
      name: product.name,
      code: product.code || null,
      category: product.category || null,
      quantity: Number(product.qty || 0),
      minimum_stock: Number(product.min || 0),
      maximum_stock: Number(product.max || 0),
      location: product.location || "Sin ubicacion",
      supplier: product.supplier || null,
      item_condition: product.condition || null,
      notes: product.notes || null,
      photo_url: product.photo && !product.photo.startsWith("data:") ? product.photo : null,
      deleted_at: null,
      updated_at: new Date().toISOString()
    };
  }

  function rowToProduct(row) {
    return {
      id: row.id,
      name: row.name || "Sin nombre",
      code: row.code || "",
      category: row.category || "",
      qty: Number(row.quantity || 0),
      min: Number(row.minimum_stock || 0),
      max: Number(row.maximum_stock || 0),
      location: row.location || "",
      supplier: row.supplier || "",
      condition: row.item_condition || "Nuevo",
      notes: row.notes || "",
      photo: row.photo_url || ""
    };
  }

  async function uploadPhoto(file, productId) {
    if (!ready() || !file?.size) return "";
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) throw new Error("La foto debe ser JPG, PNG o WEBP.");
    // Las fotos de celulares actuales suelen superar 5 MB; 15 MB conserva margen sin permitir archivos excesivos.
    if (file.size > 15 * 1024 * 1024) throw new Error("La foto supera el limite de 15 MB.");
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const objectPath = `${productId}/${Date.now()}.${extension}`;
    const response = await fetch(`${config().url.replace(/\/$/, "")}/storage/v1/object/${BUCKET}/${objectPath}`, {
      method: "POST",
      headers: {
        apikey: config().anonKey,
        Authorization: `Bearer ${config().anonKey}`,
        "Content-Type": file.type,
        "x-upsert": "true"
      },
      body: file
    });
    if (!response.ok) throw new Error((await response.text()) || "No se pudo subir la foto a Supabase.");
    return `${config().url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${objectPath}`;
  }

  async function load() {
    const [products, archivedProducts, movements] = await Promise.all([
      request("mg_general_inventory_products?deleted_at=is.null&select=*&order=updated_at.desc"),
      request("mg_general_inventory_products?deleted_at=not.is.null&select=*&order=deleted_at.desc"),
      request("mg_general_inventory_movements?select=*&order=occurred_at.desc")
    ]);
    return {
      products: (products || []).map(rowToProduct),
      archivedProducts: (archivedProducts || []).map((row) => ({ ...rowToProduct(row), archivedAt: row.deleted_at })),
      movements: (movements || []).map((row) => ({
        id: row.id,
        productId: row.product_id,
        productName: row.product_name,
        type: row.movement_type,
        qty: Number(row.quantity || 0),
        reason: row.reason || "",
        responsible: row.responsible || "",
        at: row.occurred_at
      }))
    };
  }

  async function sync(products, movements) {
    if (products.length) await request("mg_general_inventory_products?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(products.map(productToRow))
    });
    if (movements.length) await request("mg_general_inventory_movements?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(movements.map((movement) => ({
        id: movement.id,
        product_id: movement.productId,
        product_name: movement.productName,
        movement_type: movement.type,
        quantity: Number(movement.qty || 0),
        reason: movement.reason || null,
        responsible: movement.responsible || null,
        occurred_at: movement.at
      })))
    });
  }

  async function archiveProducts(productIds) {
    for (const productId of productIds || []) {
      await request(`mg_general_inventory_products?id=eq.${encodeURIComponent(productId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      });
    }
  }

  window.MG_GENERAL_INVENTORY_CLOUD = { ready, load, sync, uploadPhoto, archiveProducts };
})();
