# Climate Smart Leasing — Control financiero

Plataforma web de control financiero para **Climate Smart Leasing SpA** (RUT 77.868.887-5).

Consolida los contratos de arrendamiento contra los movimientos de la cuenta corriente Santander N° 9427-8910, expone el libro mayor completo (436 movimientos contables), permite verificar las cuentas pagadoras de cada contrato y cargar nuevas cartolas mensuales para mantener la conciliación actualizada automáticamente.

![CSL Logo](public/logos/csl-logo-green.png)

---

## Pantallas

1. **Resumen ejecutivo** — KPIs en vivo (facturado, cobrado, pendiente, % cobranza, alertas) + indicadores globales del libro mayor (saldo, aportes de capital, subsidios CORFO, inversión I+D).
2. **Contratos** — Los 7 vigentes con metadata completa, cronograma de cuotas y estado de pagos.
3. **Contabilidad** — Libro mayor con 436 movimientos clasificados, agrupados por categoría y proyecto interno (Axolot, Opticept, Micronizador, Sensores, AFIS, FIP, Flota, etc.).
4. **Cronograma maestro** — Las 167 cuotas proyectadas (Ene 2025 → Mar 2029) con filtro por estado.
5. **Movimientos bancarios** — 77 abonos extraídos de 13 cartolas, asignados al contrato correspondiente.
6. **Verificación de cuentas** — Por cada contrato, verifica que el RUT pagador detectado en cartolas coincida con el RUT declarado.
7. **Subir cartola** — Drag & drop de un PDF de cartola Santander; el sistema extrae los abonos y los reconcilia automáticamente.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (paleta CSL + Apple-style)
- **pdf-parse** (extracción de texto del lado servidor)
- **lucide-react** (iconos)

---

## Desarrollo local

Requisitos: Node.js 18+ y npm.

```bash
npm install
npm run dev
```

Abrir → http://localhost:3000

Para producción local:
```bash
npm run build
npm run start
```

---

## Despliegue en Vercel

### Opción A — GitHub + Vercel (recomendada)

1. **Crear repositorio en GitHub**
   ```bash
   cd csl-app
   git init
   git add .
   git commit -m "Initial commit: CSL control financiero"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/csl-control.git
   git push -u origin main
   ```

2. **Conectar con Vercel**
   - Ir a [vercel.com/new](https://vercel.com/new)
   - Click en "Import Git Repository"
   - Autorizar GitHub si es la primera vez
   - Seleccionar el repositorio `csl-control`
   - Vercel auto-detecta Next.js. No tocar nada de la configuración.
   - Click "Deploy"

3. **¡Listo!** En ~2 minutos tendrás una URL pública (ej: `csl-control-xxx.vercel.app`).
   Cada vez que hagas `git push`, Vercel redeploya automáticamente.

### Opción B — Vercel CLI

```bash
npm install -g vercel
cd csl-app
vercel login
vercel --prod
```

Sigue las instrucciones interactivas.

### Opción C — Upload directo

1. En vercel.com → New Project → Other
2. Sube todo el directorio (excepto `node_modules` y `.next`)

---

## Estructura

```
csl-app/
├── app/
│   ├── api/cartolas/parse/route.ts       # Endpoint de extracción de PDFs
│   ├── components/
│   │   ├── TopNav.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Contracts.tsx
│   │   ├── Accounting.tsx                # ← Libro mayor completo
│   │   ├── Schedule.tsx
│   │   ├── Movements.tsx
│   │   ├── AccountVerification.tsx       # ← Verificación de cuentas
│   │   ├── CartolaUpload.tsx             # ← Subida de cartolas
│   │   └── StatusPill.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── contracts.ts                       # Datos verificados de 7 contratos
│   ├── abonos.ts                          # 77 abonos extraídos
│   ├── ledger.ts                          # 436 movimientos contables
│   ├── conciliation.ts                    # Motor de conciliación
│   ├── uf.ts                              # Tabla UF (SII)
│   └── format.ts                          # Formatters CLP/UF/fecha
├── public/
│   ├── logos/                             # Logos oficiales CSL
│   ├── favicon.ico
│   └── icon-*.png
├── tailwind.config.js
├── next.config.js
├── vercel.json
└── package.json
```

---

## Hallazgos críticos del análisis

1. **Vikingos — Anticipo $20M IVA incluido nunca pagado.** Los 3 pagos de may-2026 (~$2,43M c/u) son cuotas regulares, no el anticipo.
2. **Trongkai — Cobranza fija $400k/mes desde 01/05/2026 sin pago detectado.** Equipo ODIN entregado el 01/03/2026 (impago temprano que faculta término anticipado por mora >60 días).
3. **Puerta Patagonia — El cliente paga la renta (~$3,18M) pero NO el anticipo prorrateado** (~$1,66M extra mensual durante 6 meses).
4. **RUT erróneo Vikingos** — El contrato indica RUT 53.319.273-4 (idéntico a Puerta Patagonia); la cartola confirma 53.321.997-7. **Emitir adenda**.
5. **Documentos duplicados** — `Contrato_Comunidad.pdf`, `Contrato_firmado__Vilanova.pdf` y `Contrato_firmado__Geist_1_VILANOVA.pdf` son el MISMO contrato.

---

## Datos del proyecto

- **Razón social**: Climate Smart Leasing SpA
- **RUT**: 77.868.887-5
- **Cuenta bancaria**: Banco Santander Cta. Cte. N° 0-000-9427891-0
- **Domicilio**: Avenida Chacabuco 485, Of. 302, Concepción

---

## Notas técnicas

- **Datos verificados** contra los PDFs originales y el modelo contable oficial (Climate_Smart_Leasing.xlsx).
- **Notación chilena** respetada — "67,127 UF" = 67.127 UF (sesenta y siete coma uno dos siete).
- **UF**: valores oficiales SII para el último día de cada mes (Ene 2025 — May 2026).
- **Conciliación**: algoritmo de matching por magnitud (±25%) con fallback FIFO. Para SCG (RUT compartido entre Flota 1 y 2), desambigua por monto + fecha.
- **Verificación de cuentas**: por cada contrato, agrupa abonos por RUT y marca "Verificado" si el RUT pagador coincide con el declarado en contrato.
