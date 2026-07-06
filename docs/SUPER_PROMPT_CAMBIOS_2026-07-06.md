# SÚPER PROMPT — Cambios plataforma CSL (solicitados por Nicolás, 06-jul-2026)

> Este documento es el prompt maestro de la ronda de cambios del 06-jul-2026.
> Sirve para (a) ejecutar los cambios, (b) auditar después qué se pidió vs qué se hizo,
> y (c) re-usarlo como plantilla si hay que repetir alguna parte.

## Prompt

Trabaja en el proyecto Climate Smart Leasing (repo github.com/Nikolaaa11/Climate-Smart-Leasing,
sitio climate-smart-leasing-nine.vercel.app). Aplica TODOS estos cambios, compila y deploya:

1. **UF del día, siempre actualizada**: los totales de contratos deben mostrarse en UF y CLP
   usando la UF DEL DÍA, actualizada automáticamente todos los días (fetch a la API pública
   mindicador.cl al cargar la página; fallback a la última UF conocida en `lib/uf.ts` si no
   hay internet). Nada de valores UF fijos en la vista.

2. **Descargar contratos**: cada contrato debe tener su PDF firmado descargable desde la
   sección Contratos. Publicar SOLO contratos — las órdenes de compra quedan FUERA de la
   plataforma. PDFs disponibles: Geist 1 (=Puerta Patagonia/Vilanova), Geist 2 (=Vikingos),
   Trongkai, Flota 1, Flota 2, Barranco Amarillo. Axopur no tiene contrato firmado.

3. **Actualizar los números de cobranza**: refrescar la sección Cobranza a la fecha de hoy
   (06-jul-2026) — snapshots, diagnósticos y mails coherentes con las cartolas al 30-jun.

4. **8 contratos (incluye compraventa)**: agregar el contrato N°8: la COMPRAVENTA asociada a
   las 4 transferencias de $17.205.087 recibidas el 26-jun-2026 desde RUT 76.058.363-4
   ("COMERCIALIZADORA"). Datos del cliente/precio POR CONFIRMAR — dejarlo marcado así y
   conciliar el pago recibido contra este contrato.

5. **Órdenes de compra fuera**: no debe existir ninguna orden de compra en la plataforma
   (ni en descargas ni en secciones). Verificado: no había; se mantiene así.

6. **Excel y PPT siempre actualizados**: los botones de descarga de estado de cuenta (Excel)
   y presentación (PPT) deben generar el archivo EN EL MOMENTO con los datos vivos de la
   conciliación — nunca más archivos estáticos desactualizados en /public/downloads.

7. **Sacar Contabilidad**: la sección Contabilidad y los KPIs de posición financiera global
   (libro mayor) tienen datos incorrectos — eliminados (hecho el 06-jul, ronda anterior).

8. **Renombrar "Cronograma" → "Consolidado de Pago de Cuota"** en el menú, títulos y
   subtítulos donde aparezca.

9. **Totales de plata en contratos**: mostrar en el Dashboard el total consolidado:
   (a) total contratado (toda la plata comprometida en contratos, en CLP y UF del día),
   (b) lo que HAN PAGADO, (c) lo que está EN DEUDA (vencido/atrasado), y
   (d) lo que queda POR COBRAR a futuro.

10. **Movimientos bancarios completos**: la sección Movimientos debe mostrar tanto LO QUE
    HAN PAGADO (abonos) como LO QUE SE HA GASTADO (cargos/egresos de las cartolas), con
    totales de cada uno. Fuente: cartolas Santander N°20-26 (dic-2025 → jun-2026).

Reglas: números solo desde `lib/` + motor de conciliación; compilar antes de pushear;
push a main = deploy automático; no subir cartolas al repo (los contratos PDF sí, por
solicitud expresa — ver advertencia de privacidad en HANDOFF.md §8).

## Estado de ejecución

Ejecutado el 06-jul-2026 por Claude Code (sesión con Nicolás). Detalle por punto en el
mensaje de commit correspondiente y en HANDOFF.md.
