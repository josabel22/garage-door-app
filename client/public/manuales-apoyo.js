window.MG_TECHNICAL_MANUALS = [
  {
    brand: 'Beninca',
    model: 'HEADY',
    application: 'Central para uno o dos motores AC',
    pdfUrl: './manuales/beninca-heady.pdf',
    specs: ['115/230 Vac', 'Hasta 500 W por motor', 'Programacion con PG, + y -'],
    startup: ['Confirmar tension y puentes NC antes de energizar', 'Comprobar sentido de M1 y M2', 'Ajustar TM1/TM2, desfase, par y frenado', 'Probar fotocelulas, STOP y apertura completa'],
    diagnostics: [['ERR1', 'Revisar fotocelula, obstaculo, alimentacion y cableado'], ['No maniobra', 'Revisar entradas NC, fusibles, tension y motores']],
    safety: ['Cortar alimentacion antes de tocar borneras', 'Fotografiar cableado y parametros antes de modificar']
  },
  {
    brand: 'Beninca',
    model: 'BRAINY 24',
    application: 'Central 24 Vdc con encoder y finales',
    pdfUrl: './manuales/beninca-brainy-24.pdf',
    specs: ['Uno o dos motores', 'Hasta 5 A por motor', 'AUTOSET NOLS, LSW o ENC'],
    startup: ['Confirmar tipo de automatismo', 'Elegir modo AUTOSET correcto', 'Despejar recorrido y ejecutar AUTOSET', 'Probar antiaplastamiento y seguridades'],
    diagnostics: [['Amp1 / Amp2', 'Obstaculo o antiaplastamiento del motor indicado'], ['ENC1 / ENC2', 'Revisar encoder, cableado u obstaculo'], ['Err3', 'Fallo de potencia; requiere asistencia'], ['thrm', 'Proteccion termica del motor']],
    safety: ['No forzar AUTOSET con hojas trabadas', 'Verificar encoder antes de aumentar fuerza']
  },
  {
    brand: 'Ditec',
    model: 'VIVAH',
    application: 'Central 24 V por DIP, jumpers y trimmers',
    pdfUrl: './manuales/ditec-vivah.pdf',
    specs: ['Entrada 230 Vac', 'Salida 24 V, hasta 12 A por motor', 'F1 2 A y F2 2.5 A'],
    startup: ['Fotografiar DIP y trimmers', 'Puentear NC no usadas solo para prueba controlada', 'Seleccionar S1-S4 segun instalacion', 'Ajustar TC, R1 y TR', 'Probar fotocelulas'],
    diagnostics: [['Sin alimentacion', 'Revisar red, corto de accesorios y F1'], ['No cierra automatico', 'Revisar TC y contacto 1-2'], ['Cerradura o destello', 'Revisar F2']],
    safety: ['Restaurar seguridades despues de pruebas', 'No dejar puentes temporales en operacion']
  },
  {
    brand: 'Entrematic',
    model: 'LCU30H',
    application: 'Central avanzada para motores 24 V',
    pdfUrl: './manuales/entrematic-lcu30h.pdf',
    specs: ['LCU30H 230 V; LCU30HJ 120 V', 'Hasta 6 A por motor', 'Menus AT, BC, BA, RO, SF, CC, EM y AP'],
    startup: ['Seleccionar configuracion AT', 'Revisar parametros BC y BA', 'Configurar radio RO', 'Probar seguridades y maniobra completa'],
    diagnostics: [['M4 / M5', 'Cortocircuito en motor 1 o 2'], ['MB / MC', 'Motor ausente'], ['I5', 'Falta tension de accesorios o corto'], ['IC', 'Tiempo de maniobra agotado']],
    safety: ['Confirmar voltaje de alimentacion segun modelo', 'Revisar cortos antes de reemplazar central']
  },
  {
    brand: 'Genius',
    model: 'SPRINT 383 / 740D',
    application: 'Central para motor AC',
    pdfUrl: './manuales/genius-sprint-383.pdf',
    specs: ['115 Vac / 60 Hz', 'Motor hasta 1000 W', 'Accesorios maximo 500 mA'],
    startup: ['Revisar LEDs de entradas', 'Configurar LO y PA', 'Confirmar direccion d1', 'Ajustar fuerza F0', 'Probar seguridades'],
    diagnostics: [['St', 'Consultar estado actual de central'], ['LED seguridad apagado', 'Seguridad ocupada, abierta o mal conectada'], ['No maniobra', 'Revisar STOP, OPEN A/B y finales']],
    safety: ['No aumentar fuerza sin revisar mecanica', 'Validar finales antes de entregar']
  },
  {
    brand: 'Nice',
    model: 'MC824H',
    application: 'Central 24 V con BlueBus y encoder',
    pdfUrl: './manuales/nice-pistones.pdf',
    specs: ['Uno o dos motores', 'Adquisicion automatica, manual o mixta', 'Historial de anomalias'],
    startup: ['Comprobar movimiento manual', 'Elegir tipo de motor', 'Confirmar M2 abre primero y M1 cierra primero', 'Adquirir posiciones', 'Probar BlueBus'],
    diagnostics: [['Falla adquisicion', 'Revisar topes, sentido, encoder y selector'], ['Falla BlueBus', 'Revisar dispositivos, cableado y reconocimiento']],
    safety: ['No ejecutar aprendizaje con obstaculos', 'Revisar BlueBus antes de cambiar accesorios']
  },
  {
    brand: 'CAME',
    model: 'ZLJ24',
    application: 'Central para AXO, FROG, FERNI y FAST',
    pdfUrl: './manuales/came-zlj24.pdf',
    specs: ['Entrada 230 Vac', 'Motores 24 Vdc, total maximo 500 W', 'Pantalla, botones y calibrado'],
    startup: ['Confirmar motor, sentido, encoder y finales', 'Revisar fusibles y seguridades', 'Guardar usuarios', 'Calibrar carrera'],
    diagnostics: [['encoder ERROR', 'Revisar conexion, funcionamiento y motor'], ['final carrera ERROR', 'Revisar finales y cableado'], ['tiempo funcionamiento ERROR', 'Corregir tiempo de trabajo'], ['STOP / C1 / C3 / C4', 'Revisar seguridad indicada']],
    safety: ['Documentar parametros antes de recalibrar', 'Probar STOP y fotocelulas antes de entregar']
  }
];
