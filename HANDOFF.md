# HANDOFF — Plataforma de Control Financiero Climate Smart Leasing

> Documento de traspaso del proyecto. Actualizado al **06-jul-2026**.
> Dueño saliente: Nicolás Rietta (GitHub: Nikolaaa11) · nicolasrietta@gmail.com

---

## 1. Qué es esto

Plataforma web de control financiero de **Climate Smart Leasing SpA** (RUT 77.868.887-5, "CSL"), empresa de arriendo de maquinarias y equipos del grupo CEHTA. Muestra en un solo lugar:

- Los **8 contratos** vigentes/modelados (7 de arriendo + 1 compraventa por confirmar) y su consolidado de cuotas.
- La **conciliación bancaria**: cada cuota cruzada contra los abonos reales de la cuenta Banco Santander cta. cte. **0-000-9427891-0**.
- La sección **Cobranza**: quién debe, cuánto, con mails de cobro listos para copiar/enviar.
- Conciliación de desembolsos a Geist (partner instalador) y verificación de cuenta.

| Recurso | URL |
|---|---|
| Sitio en producción | https://climate-smart-leasing-nine.vercel.app (dashboard en `/#dashboard`, cobranza en `/#cobranza`) |
| Repositorio | https://github.com/Nikolaaa11/Climate-Smart-Leasing (público) |
| Hosting | Vercel, cuenta `nicolasrietta-1798s-projects` — **auto-deploy con cada `git push` a `main`** |
| Carpeta de trabajo local | `C:\Users\DELL\Documents\000.11.CSL` (PDFs de contratos, cartolas, facturas) · repo clonado en `repo/` |

## 2. Stack y cómo correrlo

- **Next.js 14 (App Router) + TypeScript + Tailwind.** Sin base de datos: los datos viven en archivos TypeScript dentro de `lib/` (ver §3).
- Requisitos: Node 22+, `npm install`.

```bash
git clone https://github.com/Nikolaaa11/Climate-Smart-Leasing
cd Climate-Smart-Leasing
npm install
npm run dev          # desarrollo en http://localhost:3000

# Build (en Git Bash de Windows, `next` no queda en PATH):
node ./node_modules/next/dist/bin/next build
```

**Deploy = git push.** No hay pasos manuales en Vercel:

```bash
git add -A && git commit -m "mensaje" && git push
```

## 3. Arquitectura de datos (lo más importante)

Todo el sistema se calcula en tiempo real a partir de **3 archivos fuente** + 1 motor:

| Archivo | Qué contiene | Cuándo se edita |
|---|---|---|
| `lib/contracts.ts` | Los 7 contratos (`CONTRACTS`): cliente, RUT, renta UF, n° cuotas, fechas, RUT pagador en banco. **Single source of truth de los contratos.** | Al firmar/modificar un contrato |
| `lib/abonos.ts` | TODOS los abonos (ingresos) de la cuenta Santander, extraídos de las cartolas oficiales, con glosa original y n° de cartola. | **Cada mes, al llegar la cartola nueva** |
| `lib/uf.ts` | Valores UF de fin de mes (fuente SII) para el CÁLCULO de cuotas. | Cada mes (agregar el valor del mes que cerró) |
| `lib/cargos.ts` | Todos los CARGOS (egresos) de las cartolas — alimenta "lo que se ha gastado" en Movimientos. | Cada mes, junto con abonos.ts |
| `lib/useUfDia.ts` | Hook que trae la UF DEL DÍA desde mindicador.cl (con fallback) para los totales del Dashboard. | No se toca |
| `lib/exports.ts` | Genera Excel y PPT de estado de cuenta EN EL MOMENTO con datos vivos (botones en Cobranza). | No se toca |
| `lib/conciliation.ts` | El motor: genera las cuotas teóricas de cada contrato, identifica de qué cliente es cada abono (por RUT en la glosa) y los asigna a cuotas (primero calce exacto por monto ±1,5%, después FIFO). | Solo si cambia la lógica o se agrega una regla de identificación |

`Dashboard`, `Contratos`, `Cronograma` y `Cobranza` derivan TODAS sus cifras de `buildConciliation()` — **nunca edites números a mano en los componentes**; corrige la fuente. Los textos narrativos de cobranza (diagnósticos, mails) sí viven en `app/components/Cobranza.tsx` (array `DEUDORES`).

### Caso especial: Puerta Patagonia (C-001)

La facturación real difiere del texto del contrato y está **hardcodeada según las facturas SII reales** en `lib/conciliation.ts` (constantes `C001_ANTICIPOS` y `C001_RENTAS_EMITIDAS`):
- Anticipo $10MM + IVA: **6 facturas mensuales independientes** de $1.983.334 (dic-2025 → may-2026).
- Renta 67,127 UF + IVA: facturada **desde marzo-2026** (cuota 1/36).
- Al emitirse cada nueva factura de renta, agregar su monto neto exacto a `C001_RENTAS_EMITIDAS`.

## 4. Rutina mensual de actualización (el trabajo recurrente)

1. Descargar la(s) cartola(s) nueva(s) del Santander (empresa CSL) en PDF.
2. Extraer los **abonos** Y los **cargos** (cuidado: el PDF entremezcla ambos; validar contra los "Saldos diarios" de la última página y contra los totales "Otros abonos"/"Otros cargos" del encabezado).
3. Agregar cada abono a `lib/abonos.ts` y cada cargo a `lib/cargos.ts` con fecha ISO, monto, glosa original, n° doc y n° de cartola.
3b. Si Puerta Patagonia emitió una nueva factura de renta, agregar su neto exacto a `C001_RENTAS_EMITIDAS` en `lib/conciliation.ts`.
4. Agregar el valor UF del mes cerrado a `lib/uf.ts` (`UF_END_OF_MONTH`).
5. Si aparece un RUT nuevo que el motor no reconoce, agregar una regla en `identifyContract()` de `lib/conciliation.ts` (aunque sea `contract: null` con una razón descriptiva — así queda visible como "no identificado" y no se pierde).
6. Actualizar los textos de `DEUDORES` en `app/components/Cobranza.tsx` (fecha `HOY`, diagnósticos, mails) con las cifras nuevas.
7. `next build` → si compila, commit + push → verificar el sitio.

**Tip de verificación**: crear un script temporal que importe `buildConciliation()` y ejecutarlo con `./node_modules/.bin/sucrase-node script.ts` para ver esperado/pagado/deuda por contrato antes de publicar (borrarlo antes del commit). Los PDFs escaneados se leen con Python `pymupdf` (`fitz`); `pdftoppm` no está disponible en esta máquina.

## 5. Estado al 06-jul-2026 (foto actual)

| Contrato | Cliente | Estado | Deuda |
|---|---|---|---|
| C-001 Puerta Patagonia | Comunidad Ed. Puerta Patagonia (53.319.273-4) | 🔴 **GRAVE** — 5 facturas vencidas (F47, F53, F63, F64, F69). Paga ~1 factura/mes, siempre ~5 atrás. Última: F43 pagada 11-jun. | **$12.413.633** |
| C-002 Vikingos | Comunidad Ed. Los Vikingos (53.321.997-7) | 🟢 Al día (julio pagado anticipado 16-jun) | $39.080 (ajuste UF) |
| C-003 Trongkai | Agrotecnologías e Ingeniería (77.221.203-8) | 🔴 **NUNCA HA PAGADO** — 3 cuotas vencidas | $1.428.000 |
| C-004 Flota 1 (Volvo PLUS) | SCG SpA — paga Cristian Allende (14.183.198-4) | 🟡 Puntual, ~1 cuota de diferencia | $1.742.851 |
| C-005 Flota 2 (Volvo CORE) | SCG SpA | 🟡 ~1 cuota de diferencia | $2.768.020 |
| C-006 Barranco Amarillo | Procesadora Barranco Amarillo (78.191.887-3) | 🟡 Cuotas may+jun pagadas; **pendiente pago inicial 183 UF (~$8,8MM)** | $8.815.825 |
| C-007 Axopur 1 | ⚠️ SIN CONTRATO FIRMADO — solo modelo de negocio | (no cobrar) |
| C-008 Compraventa Comercializadora | RUT 76.058.363-4 | ⚠️ POR CONFIRMAR — $17.205.087 recibidos 26-jun registrados como pago único de compraventa; falta el contrato y datos del cliente | $0 |

**Total cobranza activa: ~$27,2MM.** Cada deudor tiene mail de cobro listo en la sección Cobranza (botón "Ver mail").

## 6. Pendientes abiertos (heredas esto)

1. **Clasificar con MCG/contabilidad** (los 3 aparecen en "abonos no identificados" de la plataforma):
   - Traspaso de **$145.563.465** (28-abr-2026) desde el RUT de Barranco Amarillo, glosa "Traspaso de cuenta" — si es de su contrato, su pago inicial (y mucho más) estaría cubierto. **No cobrar el pago inicial a Barranco sin resolver esto.**
   - **$17.205.087** (26-jun-2026, 4 transferencias) de "COMERCIALIZADORA" RUT 76.058.363-4 — sin contrato en el sistema. ¿Cliente nuevo? ¿Venta de equipos?
   - **$10.710.000** "Factura 41 PTEC" — entró el 11-jun y salió el mismo total el 15-jun (¿reversa/traspaso?).
   - También sin clasificar: depósito con documento ATM de **$270.033.596** (27-mar-2026).
2. **Adenda Vikingos**: el contrato tiene RUT erróneo (dice 53.319.273-4, el real es 53.321.997-7). Redactada la necesidad, falta emitirla y firmarla.
3. **Cobranza dura a Puerta Patagonia**: 5 facturas vencidas. El contrato (Cláusula Décimo Quinta/Sexta) permite acelerar toda la deuda, suspender el servicio y bloquear equipos con 2+ facturas impagas. Mail listo en la plataforma; decisión comercial pendiente.
4. **Trongkai**: definir acción de cobro (nunca ha pagado; el contrato permite término anticipado con retraso > 60 días).
5. **Axopur (C-007)**: confirmar cliente, RUT y fechas, y firmar contrato — hoy es solo modelo tentativo.
6. **Emails de contacto de deudores**: varios son placeholders (marcados en `DEUDORES.notasInternas`) — confirmar antes de enviar mails.
7. Al facturar la **renta julio de PP** (~06-jul, cuota 5/36): agregar el neto exacto a `C001_RENTAS_EMITIDAS`.
8. Agregar **UF de junio y julio 2026** a `lib/uf.ts` cuando cierre cada mes (hoy usa fallback = última UF conocida, mayo).

## 7. Documentos fuente clave

- **Contratos firmados**: carpeta `C:\Users\DELL\Downloads\Contratos actuales\` y `C:\Users\DELL\Documents\000.11.CSL\`. El de Puerta Patagonia vigente es el **protocolizado 02-dic-2025** (Notaría La Reina, rep. 70.416) — fija plazo de pago **15 días corridos desde emisión** y pago desde el **inicio de los trabajos** (no desde la recepción de obra).
- **Facturas SII de PP**: F43, F47, F52, F53, F63, F64, F69 (PDFs en Downloads; F52 está PAGADA aunque figuraba adeudada).
- **Cartolas Santander**: N°20-26 procesadas (dic-2025 → 30-jun-2026). Las históricas son la fuente oficial; las "provisorias" se reemplazan cuando sale la histórica.
- La recepción de obra PP: provisoria 17-mar-2026, **definitiva 08-abr-2026 sin observaciones** (clave para la cobranza: no pueden alegar mala entrega).

## 8. Datos sensibles y precauciones

- El repo es **público**: no subir cartolas, contratos ni PDFs con RUT/datos bancarios al repo. Los datos en `lib/*.ts` (montos, RUT empresa) ya son visibles — evaluar hacer el repo privado si incomoda.
- RUT chileno es dato personal (Ley 19.628) — cuidado al compartir pantallas/exports.
- La cuenta Vercel/GitHub es personal de Nicolás; para traspaso definitivo, transferir el repo y el proyecto Vercel a una organización.
- Los mails de cobro salen a nombre de "Nikolás Romero / Climate Smart Leasing SpA" con confirmación a `nikolasromero@climatesmartleasing.com` — actualizar firma/correo si cambia el responsable de cobranza.

## 9. Historial reciente (para contexto)

- **may-2026**: se construyó la plataforma; contratos C-001 a C-007 cargados desde PDFs; conciliación FIFO unificada entre Dashboard/Contratos/Cobranza.
- **10-jun-2026**: conciliación contra facturas SII reales de PP + cartolas oficiales N°21-26. Se descubrió que la F52 estaba pagada y que el modelo de PP estaba mal (anticipo separado de rentas). PP pasó a severidad grave. Se agregó Barranco a cobranza. Motor con calce exacto por monto antes de FIFO.
- **~11-jun-2026**: del contrato protocolizado de Vilanova se corrigió el plazo de pago de PP: 15 días corridos desde emisión (no 30).
- **03-jul-2026**: cartola N°26 histórica conciliada (PP pagó F43; Barranco cuota jun; Vikingos julio anticipado; aparecen COMERCIALIZADORA y PTEC sin clasificar).

- **06-jul-2026**: ronda "súper prompt" (ver docs/SUPER_PROMPT_CAMBIOS_2026-07-06.md): se elimina Contabilidad (datos incorrectos), UF del día vía mindicador.cl, totales de contratos en el Dashboard (total/pagado/deuda/por cobrar en CLP y UF), contratos PDF descargables (public/contratos, SIN órdenes de compra), C-008 compraventa Comercializadora (por confirmar), "Cronograma" pasa a llamarse "Consolidado de Pago de Cuota", Movimientos muestra cargos + abonos (lib/cargos.ts), y el Excel/PPT de cobranza se generan al momento con datos vivos (lib/exports.ts, dependencias xlsx + pptxgenjs).

El historial completo está en `git log` — los mensajes de commit documentan cada decisión.
