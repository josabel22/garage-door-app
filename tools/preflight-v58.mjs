import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(decodeURIComponent(new URL('..', import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'));
const clientDir = path.join(root, 'SUBIR-A-GITHUB-ACTUALIZACION-COMPARTIDA', 'client');
const indexPath = path.join(clientDir, 'index.html');
const swPath = path.join(clientDir, 'public', 'sw.js');
const args = process.argv.slice(2);
const backupArgIndex = args.findIndex((arg) => arg === '--backup');
const backupPath = backupArgIndex >= 0 ? args[backupArgIndex + 1] : '';

const checks = [];

function pass(name, detail = '') {
  checks.push({ ok: true, name, detail });
}

function fail(name, detail = '') {
  checks.push({ ok: false, name, detail });
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function assertIncludes(text, value, name) {
  if (text.includes(value)) pass(name);
  else fail(name, `No se encontro: ${value}`);
}

function validateScripts(html) {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  try {
    scripts.forEach((script) => new Function(script));
    pass('JavaScript principal compila', `${scripts.length} bloque(s) script`);
  } catch (error) {
    fail('JavaScript principal compila', error.message);
  }
}

function validateAppFiles() {
  if (!fs.existsSync(indexPath)) {
    fail('Existe client/index.html', indexPath);
    return;
  }
  if (!fs.existsSync(swPath)) {
    fail('Existe client/public/sw.js', swPath);
    return;
  }

  const html = read(indexPath);
  const sw = read(swPath);
  validateScripts(html);

  assertIncludes(html, 'v58.0', 'Version visible v58.0');
  assertIncludes(sw, "mg-portones-v58-0", 'Cache service worker v58.0');

  [
    'function createReport',
    'function submitJobEdit',
    'function deleteJobPhoto',
    'function rememberDeletedPhoto',
    'function mergeDeletedPhotos',
    'function saveCloudDataNow',
    'function downloadBackup',
    'function backupSafeData'
  ].forEach((fn) => assertIncludes(html, fn, `Funcion critica: ${fn}`));

  if (/admin123|tecnico123|cliente123/.test(html)) {
    fail('Login sin credenciales de prueba visibles', 'Aparecen credenciales de prueba en index.html');
  } else {
    pass('Login sin credenciales de prueba visibles');
  }

  if (html.includes('Ya existe otro reporte con esa boleta.') && html.includes('submitJobEdit')) {
    pass('Edicion conserva proteccion de boleta', 'Existe validacion historica; revisar manualmente si se toca submitJobEdit');
  }
}

function validateBackup(file) {
  if (!file) {
    pass('Respaldo JSON opcional', 'No se indico --backup');
    return;
  }
  if (!fs.existsSync(file)) {
    fail('Respaldo JSON existe', file);
    return;
  }
  try {
    const parsed = JSON.parse(read(file));
    const data = parsed.data || parsed;
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];
    const users = Array.isArray(data.users) ? data.users : [];
    const inventory = Array.isArray(data.inventory) ? data.inventory : [];
    const badPhotos = [];
    const tickets = new Map();

    jobs.forEach((job) => {
      const ticket = String(job.ticket || '');
      if (ticket) tickets.set(ticket.toLowerCase(), (tickets.get(ticket.toLowerCase()) || 0) + 1);
      ['before', 'after'].forEach((kind) => {
        const photos = job.photos?.[kind] || [];
        if (!Array.isArray(photos)) badPhotos.push(`${ticket}:${kind}:no-array`);
        photos.forEach((photo, index) => {
          if (!photo || typeof photo !== 'object') badPhotos.push(`${ticket}:${kind}:${index}`);
        });
      });
    });

    const duplicates = [...tickets.entries()].filter(([, count]) => count > 1);
    pass('Respaldo JSON legible', `${jobs.length} reportes, ${users.length} usuarios, ${inventory.length} inventario`);
    if (badPhotos.length) fail('Fotos del respaldo tienen formato valido', badPhotos.slice(0, 5).join(', '));
    else pass('Fotos del respaldo tienen formato valido');
    if (duplicates.length) pass('Boletas duplicadas detectadas', `${duplicates.length}; permitido por historial, no bloquear edicion`);
    else pass('Boletas duplicadas detectadas', 'Sin duplicados');
  } catch (error) {
    fail('Respaldo JSON legible', error.message);
  }
}

validateAppFiles();
validateBackup(backupPath);

const failed = checks.filter((check) => !check.ok);
checks.forEach((check) => {
  const icon = check.ok ? 'OK' : 'ERROR';
  console.log(`${icon} - ${check.name}${check.detail ? `: ${check.detail}` : ''}`);
});

if (failed.length) {
  console.error(`\nPreflight v58 fallo: ${failed.length} problema(s). No subir a GitHub.`);
  process.exit(1);
}

console.log('\nPreflight v58 listo. Puede compilar y subir.');
