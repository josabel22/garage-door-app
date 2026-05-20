import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">MG Portones</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold">Sistema profesional de gestion operativa</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Base React preparada para conectar con el API Express. Abre el archivo raiz index.html para usar la version
          funcional inmediata mientras se instalan dependencias.
        </p>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
