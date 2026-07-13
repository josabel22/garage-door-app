window.MG_TECHNICAL_MANUALS = [
  {
    brand: 'Beninca',
    model: 'HEADY',
    application: 'Central para uno o dos motores AC',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/beninca-heady.pdf',
    specs: ['115/230 Vac', 'Hasta 500 W por motor', 'Programacion con PG, + y -'],
    startup: ['Confirmar tension y puentes NC antes de energizar', 'Comprobar sentido de M1 y M2', 'Ajustar TM1/TM2, desfase, par y frenado', 'Probar fotocelulas, STOP y apertura completa'],
    diagnostics: [['ERR1', 'Revisar fotocelula, obstaculo, alimentacion y cableado'], ['No maniobra', 'Revisar entradas NC, fusibles, tension y motores']],
    safety: ['Cortar alimentacion antes de tocar borneras', 'Fotografiar cableado y parametros antes de modificar']
  },
  {
    brand: 'Beninca',
    model: 'BRAINY 24',
    application: 'Central 24 Vdc con encoder y finales',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/beninca-brainy-24.pdf',
    specs: ['Uno o dos motores', 'Hasta 5 A por motor', 'AUTOSET NOLS, LSW o ENC'],
    startup: ['Confirmar tipo de automatismo', 'Elegir modo AUTOSET correcto', 'Despejar recorrido y ejecutar AUTOSET', 'Probar antiaplastamiento y seguridades'],
    diagnostics: [['Amp1 / Amp2', 'Obstaculo o antiaplastamiento del motor indicado'], ['ENC1 / ENC2', 'Revisar encoder, cableado u obstaculo'], ['Err3', 'Fallo de potencia; requiere asistencia'], ['thrm', 'Proteccion termica del motor']],
    safety: ['No forzar AUTOSET con hojas trabadas', 'Verificar encoder antes de aumentar fuerza']
  },
  {
    brand: 'Ditec',
    model: 'VIVAH',
    application: 'Central 24 V por DIP, jumpers y trimmers',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/ditec-vivah.pdf',
    specs: ['Entrada 230 Vac', 'Salida 24 V, hasta 12 A por motor', 'F1 2 A y F2 2.5 A'],
    startup: ['Fotografiar DIP y trimmers', 'Puentear NC no usadas solo para prueba controlada', 'Seleccionar S1-S4 segun instalacion', 'Ajustar TC, R1 y TR', 'Probar fotocelulas'],
    diagnostics: [['Sin alimentacion', 'Revisar red, corto de accesorios y F1'], ['No cierra automatico', 'Revisar TC y contacto 1-2'], ['Cerradura o destello', 'Revisar F2']],
    safety: ['Restaurar seguridades despues de pruebas', 'No dejar puentes temporales en operacion']
  },
  {
    brand: 'Entrematic',
    model: 'LCU30H',
    application: 'Central avanzada para motores 24 V',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/entrematic-lcu30h.pdf',
    specs: ['LCU30H 230 V; LCU30HJ 120 V', 'Hasta 6 A por motor', 'Menus AT, BC, BA, RO, SF, CC, EM y AP'],
    startup: ['Seleccionar configuracion AT', 'Revisar parametros BC y BA', 'Configurar radio RO', 'Probar seguridades y maniobra completa'],
    diagnostics: [['M4 / M5', 'Cortocircuito en motor 1 o 2'], ['MB / MC', 'Motor ausente'], ['I5', 'Falta tension de accesorios o corto'], ['IC', 'Tiempo de maniobra agotado']],
    safety: ['Confirmar voltaje de alimentacion segun modelo', 'Revisar cortos antes de reemplazar central']
  },
  {
    brand: 'Genius',
    model: 'SPRINT 383 / 740D',
    application: 'Central para motor AC',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/genius-sprint-383.pdf',
    specs: ['115 Vac / 60 Hz', 'Motor hasta 1000 W', 'Accesorios maximo 500 mA'],
    startup: ['Revisar LEDs de entradas', 'Configurar LO y PA', 'Confirmar direccion d1', 'Ajustar fuerza F0', 'Probar seguridades'],
    diagnostics: [['St', 'Consultar estado actual de central'], ['LED seguridad apagado', 'Seguridad ocupada, abierta o mal conectada'], ['No maniobra', 'Revisar STOP, OPEN A/B y finales']],
    safety: ['No aumentar fuerza sin revisar mecanica', 'Validar finales antes de entregar']
  },
  {
    brand: 'Nice',
    model: 'MC824H',
    application: 'Central 24 V con BlueBus y encoder',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/nice-pistones.pdf',
    specs: ['Uno o dos motores', 'Adquisicion automatica, manual o mixta', 'Historial de anomalias'],
    startup: ['Comprobar movimiento manual', 'Elegir tipo de motor', 'Confirmar M2 abre primero y M1 cierra primero', 'Adquirir posiciones', 'Probar BlueBus'],
    diagnostics: [['Falla adquisicion', 'Revisar topes, sentido, encoder y selector'], ['Falla BlueBus', 'Revisar dispositivos, cableado y reconocimiento']],
    safety: ['No ejecutar aprendizaje con obstaculos', 'Revisar BlueBus antes de cambiar accesorios']
  },
  {
    brand: 'CAME',
    model: 'ZLJ24',
    application: 'Central para AXO, FROG, FERNI y FAST',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/came-zlj24.pdf',
    specs: ['Entrada 230 Vac', 'Motores 24 Vdc, total maximo 500 W', 'Pantalla, botones y calibrado'],
    startup: ['Confirmar motor, sentido, encoder y finales', 'Revisar fusibles y seguridades', 'Guardar usuarios', 'Calibrar carrera'],
    diagnostics: [['encoder ERROR', 'Revisar conexion, funcionamiento y motor'], ['final carrera ERROR', 'Revisar finales y cableado'], ['tiempo funcionamiento ERROR', 'Corregir tiempo de trabajo'], ['STOP / C1 / C3 / C4', 'Revisar seguridad indicada']],
    safety: ['Documentar parametros antes de recalibrar', 'Probar STOP y fotocelulas antes de entregar']
  },
  {
    brand: 'Ditec',
    model: 'E2H',
    application: 'Manual tecnico de referencia para central E2H',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/ditec-e2h-ip1967es.pdf',
    specs: ['Central de mando para automatismos', 'Parametros y conexiones segun manual', 'Referencia IP1967ES'],
    startup: ['Identificar modelo y alimentacion antes de intervenir', 'Fotografiar borneras y parametros', 'Revisar finales, seguridades y sentido de giro', 'Probar ciclo completo antes de entregar'],
    diagnostics: [['No maniobra', 'Revisar alimentacion, fusibles, STOP y entradas de seguridad'], ['Falla intermitente', 'Revisar conexiones flojas, fotocelulas y programacion']],
    safety: ['Cortar alimentacion antes de manipular borneras', 'No dejar puentes temporales instalados']
  },
  {
    brand: 'Allmatic',
    model: 'B1EE ERMES NEW',
    application: 'Central para motor corredizo con radio ERMES',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/allmatic-b1ee-ermes-new.pdf',
    specs: ['Central para automatismo corredizo', 'Sistema ERMES', 'Programacion segun parametros del manual'],
    startup: ['Verificar alimentacion y motor', 'Revisar finales de carrera', 'Programar controles y recorrido', 'Probar seguridades y cierre completo'],
    diagnostics: [['No abre o no cierra', 'Revisar finales, fotocelulas, STOP y alimentacion'], ['Radio no aprende', 'Revisar receptor, memoria y compatibilidad de control']],
    safety: ['Validar fotocelulas antes de entregar', 'No aumentar fuerza sin revisar mecanica']
  },
  {
    brand: 'Beninca',
    model: 'CPB24ESA',
    application: 'Central 24 V para automatismos Beninca',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/beninca-cpb24esa.pdf',
    specs: ['Central 24 V', 'Uso con automatismos Beninca compatibles', 'Programacion segun manual CPB24ESA'],
    startup: ['Confirmar tension y polaridad', 'Revisar accesorios y seguridades', 'Configurar parametros basicos', 'Ejecutar prueba de recorrido'],
    diagnostics: [['Falla de movimiento', 'Revisar motor, encoder o finales segun instalacion'], ['Seguridad activa', 'Revisar fotocelulas, STOP y contactos NC']],
    safety: ['Desconectar energia antes de intervenir', 'Registrar parametros antes de cambiar configuracion']
  },
  {
    brand: 'BFT',
    model: 'B ALCOR N',
    application: 'Central BFT para automatismos de porton',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/bft-b-alcor-n.pdf',
    specs: ['Central de mando BFT', 'Entradas de seguridad y control', 'Ajustes segun manual ALCOR N'],
    startup: ['Verificar alimentacion', 'Revisar dip switches o parametros', 'Confirmar finales y fotocelulas', 'Probar apertura y cierre'],
    diagnostics: [['No responde', 'Revisar fusibles, STOP, fotocelulas y comando'], ['Cierre falla', 'Revisar seguridad de cierre y tiempo de trabajo']],
    safety: ['No anular seguridades en operacion', 'Confirmar fuerza y recorrido con el porton libre']
  },
  {
    brand: 'Beninca',
    model: 'CPBULL8',
    application: 'Central para motor Bull de Beninca',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/beninca-cpbull8.pdf',
    specs: ['Central para corredera Bull', 'Control de finales y accesorios', 'Referencia CPBULL8'],
    startup: ['Revisar finales de carrera', 'Verificar sentido del motor', 'Programar recorrido y fuerza', 'Probar controles y fotocelulas'],
    diagnostics: [['Corredera no mueve', 'Revisar final, motor, capacitor y alimentacion'], ['Se detiene', 'Revisar obstaculo, fuerza y finales']],
    safety: ['Asegurar area libre durante pruebas', 'Revisar cremallera y topes mecanicos']
  },
  {
    brand: 'LiftMaster',
    model: 'CSW24UL',
    application: 'Operador batiente comercial 24 V',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/liftmaster-csw24ul.pdf',
    specs: ['Operador de brazo batiente', 'Uso comercial', 'Instalacion y diagnostico segun manual'],
    startup: ['Confirmar montaje mecanico', 'Verificar alimentacion y bateria si aplica', 'Programar limites', 'Probar sensores de seguridad'],
    diagnostics: [['No inicia ciclo', 'Revisar alimentacion, tarjeta, limites y dispositivos de seguridad'], ['Falla de limite', 'Revisar programacion y sensor de posicion']],
    safety: ['Instalar dispositivos de atrapamiento requeridos', 'No probar con personas cerca de la hoja']
  },
  {
    brand: 'Beninca',
    model: 'HEAD GBR3',
    application: 'Referencia tecnica Beninca HEAD',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/beninca-head-gbr3.pdf',
    specs: ['Central Beninca HEAD', 'Referencia GBR3', 'Conexion y parametros segun manual'],
    startup: ['Comparar borneras con fotografia inicial', 'Revisar tension y fusibles', 'Confirmar entradas NC', 'Probar maniobra completa'],
    diagnostics: [['No maniobra', 'Revisar STOP, fotocelulas, fusibles y tension'], ['Movimiento incorrecto', 'Revisar sentido de motores y parametros']],
    safety: ['No intervenir energizado', 'Restaurar seguridades antes de entrega']
  },
  {
    brand: 'JA',
    model: 'JA388',
    application: 'Manual tecnico JA388',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/ja388.pdf',
    specs: ['Control JA388', 'Referencia de conexion y programacion', 'Uso segun compatibilidad del equipo'],
    startup: ['Identificar alimentacion', 'Revisar conexiones principales', 'Programar funciones necesarias', 'Probar ciclo completo'],
    diagnostics: [['Sin respuesta', 'Revisar alimentacion, fusible y comando'], ['Funcion incompleta', 'Revisar parametros y entradas']],
    safety: ['Confirmar voltaje antes de energizar', 'Documentar cambios realizados']
  },
  {
    brand: 'LiftMaster',
    model: 'LA350',
    application: 'Operador batiente residencial/comercial ligero',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/liftmaster-la350.pdf',
    specs: ['Operador de porton batiente', 'Instalacion y limites segun manual', 'Compatible con accesorios LiftMaster'],
    startup: ['Revisar soportes y brazo', 'Configurar limites', 'Probar fuerza y reversa', 'Validar controles y fotocelulas'],
    diagnostics: [['No abre', 'Revisar bateria, alimentacion, limites y control'], ['Se devuelve', 'Revisar obstruccion, fuerza y sensores']],
    safety: ['Mantener zona libre durante aprendizaje', 'No omitir sensores requeridos']
  },
  {
    brand: 'EURO',
    model: 'EURO24 M1',
    application: 'Central 24 V para automatismos',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/euro24-m1.pdf',
    specs: ['Central 24 V', 'Configuracion M1', 'Conexion segun manual EURO24'],
    startup: ['Confirmar tension', 'Revisar accesorios', 'Programar recorrido', 'Probar seguridades'],
    diagnostics: [['Falla de movimiento', 'Revisar motor, finales y seguridades'], ['No reconoce control', 'Revisar receptor y memoria']],
    safety: ['Desconectar antes de cablear', 'No dejar seguridades anuladas']
  },
  {
    brand: 'Nice',
    model: 'ROAD',
    application: 'Motor corredizo Nice Road',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/nice-road-corredera.pdf',
    specs: ['Motor para porton corredizo', 'Programacion de carrera', 'Referencia de instalacion Road'],
    startup: ['Revisar cremallera y topes', 'Liberar y comprobar movimiento manual', 'Programar carrera', 'Probar BlueBus o seguridades segun modelo'],
    diagnostics: [['Corredera no avanza', 'Revisar desbloqueo, alimentacion, finales y obstaculos'], ['Falla en aprendizaje', 'Revisar topes, recorrido y sentido']],
    safety: ['No hacer aprendizaje con obstrucciones', 'Confirmar topes mecanicos']
  },
  {
    brand: 'Beninca',
    model: 'BULL624',
    application: 'Motor corredizo Beninca Bull 624',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/beninca-bull624.pdf',
    specs: ['Kit para porton corredizo', 'Hasta 600 kg segun referencia del manual', 'Central y accesorios Beninca'],
    startup: ['Revisar anclaje y cremallera', 'Confirmar finales', 'Programar controles y carrera', 'Probar fotocelulas'],
    diagnostics: [['Se detiene en recorrido', 'Revisar cremallera, finales, fuerza y obstaculos'], ['No aprende control', 'Revisar receptor y memoria']],
    safety: ['Verificar topes', 'No entregar sin prueba de seguridad']
  },
  {
    brand: 'Beninca',
    model: 'MATRIX CPBULL',
    application: 'Referencia MATRIX / CPBULL',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/beninca-matrix-cpbull.pdf',
    specs: ['Manual de referencia Beninca', 'Aplicacion en sistema CPBULL', 'Conexion y programacion segun manual'],
    startup: ['Identificar modelo exacto instalado', 'Revisar borneras y finales', 'Configurar parametros', 'Probar ciclo completo'],
    diagnostics: [['Falla de cierre', 'Revisar final, fotocelula y fuerza'], ['No responde a control', 'Revisar receptor, memoria y alimentacion']],
    safety: ['Guardar evidencia antes de modificar', 'Validar seguridades al final']
  },
  {
    brand: 'Allmatic',
    model: 'Pistones',
    application: 'Manual de pistones Allmatic',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/allmatic-pistones.pdf',
    specs: ['Automatismo batiente', 'Montaje de pistones', 'Ajustes mecanicos y electricos segun manual'],
    startup: ['Revisar medidas de instalacion', 'Confirmar apertura libre', 'Programar recorrido', 'Probar fuerza y seguridades'],
    diagnostics: [['Hoja desfasada', 'Revisar medidas, topes y tiempo de trabajo'], ['Motor no trabaja', 'Revisar capacitor, cableado y alimentacion']],
    safety: ['No operar con bisagras trabadas', 'Asegurar topes mecanicos']
  },
  {
    brand: 'STS',
    model: 'Porton',
    application: 'Manual de referencia para porton STS',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/porton-sts.pdf',
    specs: ['Manual de instalacion y referencia', 'Componentes segun documento STS', 'Uso como apoyo tecnico'],
    startup: ['Identificar componentes instalados', 'Revisar montaje mecanico', 'Comparar cableado con manual', 'Probar funcionamiento completo'],
    diagnostics: [['Funcion irregular', 'Revisar mecanica, sensores y conexiones'], ['Falla de seguridad', 'Revisar dispositivos y cableado']],
    safety: ['Verificar estabilidad mecanica', 'No entregar sin prueba de recorrido']
  },
  {
    brand: 'Q80S',
    model: 'Q80S',
    application: 'Central de mando Q80S',
    pdfUrl: 'https://cdn.jsdelivr.net/gh/josabel22/garage-door-app@main/q80s-es.pdf',
    specs: ['Central Q80S', 'Manual en espanol', 'Programacion y diagnostico segun documento'],
    startup: ['Revisar alimentacion y entradas', 'Configurar parametros principales', 'Probar controles', 'Validar seguridades'],
    diagnostics: [['No maniobra', 'Revisar alimentacion, STOP, fotocelulas y fusible'], ['No memoriza', 'Revisar procedimiento de programacion']],
    safety: ['No anular entradas de seguridad', 'Registrar parametros cambiados']
  }
];


