// AUTO-GENERADO desde las facturas SII reales (carpeta 'Facturas SII').
// Fuente única de verdad de los montos FACTURADOS. Para actualizar: agregar
// la factura nueva acá con su folio, contrato, cuotaKey (debe calzar con el
// 'numero' que genera el motor: 'Cuota k/N', 'Anticipo i/6' o '1ª renta (al firmar)').

export interface FacturaSII {
  folio: number;
  contrato: string;
  cuotaKey: string;   // calza con Cuota.numero del motor
  fecha: string;      // fecha de emisión (ISO)
  uf: number | null;        // cantidad de UF facturada
  valorUf: number | null;   // valor de la UF usado en la factura
  neto: number;
  iva: number;
  total: number;
}

export const FACTURAS: FacturaSII[] = [
  { folio: 31, contrato: "C-001", cuotaKey: "Anticipo 1/6", fecha: "2025-12-09", uf: null, valorUf: null, neto: 1666667, iva: 316667, total: 1983334 },
  { folio: 38, contrato: "C-001", cuotaKey: "Anticipo 2/6", fecha: "2026-01-07", uf: null, valorUf: null, neto: 1666667, iva: 316667, total: 1983334 },
  { folio: 43, contrato: "C-001", cuotaKey: "Anticipo 3/6", fecha: "2026-02-06", uf: null, valorUf: null, neto: 1666667, iva: 316667, total: 1983334 },
  { folio: 47, contrato: "C-001", cuotaKey: "Anticipo 4/6", fecha: "2026-03-06", uf: null, valorUf: null, neto: 1666667, iva: 316667, total: 1983334 },
  { folio: 51, contrato: "C-001", cuotaKey: "Cuota 1/36", fecha: "2026-04-01", uf: 67.13, valorUf: 39644, neto: 2661302, iva: 505647, total: 3166949 },
  { folio: 52, contrato: "C-001", cuotaKey: "Cuota 2/36", fecha: "2026-04-07", uf: 67.13, valorUf: 39842, neto: 2674593, iva: 508173, total: 3182766 },
  { folio: 53, contrato: "C-001", cuotaKey: "Anticipo 5/6", fecha: "2026-04-07", uf: null, valorUf: null, neto: 1666667, iva: 316667, total: 1983334 },
  { folio: 63, contrato: "C-001", cuotaKey: "Anticipo 6/6", fecha: "2026-05-06", uf: null, valorUf: null, neto: 1666667, iva: 316667, total: 1983334 },
  { folio: 64, contrato: "C-001", cuotaKey: "Cuota 3/36", fecha: "2026-05-06", uf: 67.13, valorUf: 40200, neto: 2698626, iva: 512739, total: 3211365 },
  { folio: 69, contrato: "C-001", cuotaKey: "Cuota 4/36", fecha: "2026-06-06", uf: 67.13, valorUf: 40712, neto: 2732997, iva: 519269, total: 3252266 },
  { folio: 54, contrato: "C-002", cuotaKey: "Cuota 1/24", fecha: "2026-04-05", uf: 51.29, valorUf: 39819, neto: 2042317, iva: 388040, total: 2430357 },
  { folio: 55, contrato: "C-002", cuotaKey: "Cuota 2/24", fecha: "2026-04-05", uf: 51.29, valorUf: 39842, neto: 2043496, iva: 388264, total: 2431760 },
  { folio: 65, contrato: "C-002", cuotaKey: "Cuota 3/24", fecha: "2026-05-05", uf: 51.29, valorUf: 40187, neto: 2061191, iva: 391626, total: 2452817 },
  { folio: 70, contrato: "C-002", cuotaKey: "Cuota 4/24", fecha: "2026-06-05", uf: 51.29, valorUf: 40695, neto: 2087247, iva: 396577, total: 2483824 },
  { folio: 5, contrato: "C-004", cuotaKey: "1ª renta (al firmar)", fecha: "2025-01-30", uf: null, valorUf: null, neto: 3109244, iva: 590756, total: 3700000 },
  { folio: 6, contrato: "C-004", cuotaKey: "Cuota 1/48", fecha: "2025-02-21", uf: 25.58, valorUf: 38542, neto: 985904, iva: 187322, total: 1173226 },
  { folio: 10, contrato: "C-004", cuotaKey: "Cuota 2/48", fecha: "2025-03-21", uf: 25.58, valorUf: 38844, neto: 993630, iva: 188790, total: 1182420 },
  { folio: 11, contrato: "C-004", cuotaKey: "Cuota 3/48", fecha: "2025-04-21", uf: 25.58, valorUf: 39016, neto: 998029, iva: 189626, total: 1187655 },
  { folio: 13, contrato: "C-004", cuotaKey: "Cuota 4/48", fecha: "2025-05-22", uf: 25.58, valorUf: 39164, neto: 1001815, iva: 190345, total: 1192160 },
  { folio: 14, contrato: "C-004", cuotaKey: "Cuota 5/48", fecha: "2025-06-21", uf: 25.58, valorUf: 39244, neto: 1003862, iva: 190734, total: 1194596 },
  { folio: 18, contrato: "C-004", cuotaKey: "Cuota 6/48", fecha: "2025-07-21", uf: 25.58, valorUf: 39230, neto: 1003503, iva: 190666, total: 1194169 },
  { folio: 20, contrato: "C-004", cuotaKey: "Cuota 7/48", fecha: "2025-08-21", uf: 25.58, valorUf: 39269, neto: 1004501, iva: 190855, total: 1195356 },
  { folio: 22, contrato: "C-004", cuotaKey: "Cuota 8/48", fecha: "2025-09-21", uf: 25.58, valorUf: 39486, neto: 1010052, iva: 191910, total: 1201962 },
  { folio: 25, contrato: "C-004", cuotaKey: "Cuota 9/48", fecha: "2025-10-21", uf: 25.58, valorUf: 39547, neto: 1011612, iva: 192206, total: 1203818 },
  { folio: 29, contrato: "C-004", cuotaKey: "Cuota 10/48", fecha: "2025-11-21", uf: 25.58, valorUf: 39644, neto: 1014094, iva: 192678, total: 1206772 },
  { folio: 35, contrato: "C-004", cuotaKey: "Cuota 11/48", fecha: "2025-12-21", uf: 25.58, valorUf: 39690, neto: 1015270, iva: 192901, total: 1208171 },
  { folio: 41, contrato: "C-004", cuotaKey: "Cuota 12/48", fecha: "2026-01-21", uf: 25.58, valorUf: 39732, neto: 1016345, iva: 193106, total: 1209451 },
  { folio: 44, contrato: "C-004", cuotaKey: "Cuota 13/48", fecha: "2026-02-21", uf: 25.58, valorUf: 39751, neto: 1016831, iva: 193198, total: 1210029 },
  { folio: 49, contrato: "C-004", cuotaKey: "Cuota 14/48", fecha: "2026-03-21", uf: 25.58, valorUf: 39842, neto: 1019158, iva: 193640, total: 1212798 },
  { folio: 60, contrato: "C-004", cuotaKey: "Cuota 15/48", fecha: "2026-05-01", uf: 21.58, valorUf: 40000.61, neto: 863213, iva: 164010, total: 1027223 },
  { folio: 67, contrato: "C-004", cuotaKey: "Cuota 16/48", fecha: "2026-05-21", uf: 21.58, valorUf: 40442, neto: 872738, iva: 165820, total: 1038558 },
  { folio: 12, contrato: "C-005", cuotaKey: "1ª renta (al firmar)", fecha: "2025-05-21", uf: null, valorUf: null, neto: 2773109, iva: 526891, total: 3300000 },
  { folio: 15, contrato: "C-005", cuotaKey: "Cuota 1/48", fecha: "2025-06-21", uf: 22.93, valorUf: 39244, neto: 899865, iva: 170974, total: 1070839 },
  { folio: 19, contrato: "C-005", cuotaKey: "Cuota 2/48", fecha: "2025-07-21", uf: 22.93, valorUf: 39230, neto: 899544, iva: 170913, total: 1070457 },
  { folio: 21, contrato: "C-005", cuotaKey: "Cuota 3/48", fecha: "2025-08-21", uf: 22.93, valorUf: 39269, neto: 900438, iva: 171083, total: 1071521 },
  { folio: 23, contrato: "C-005", cuotaKey: "Cuota 4/48", fecha: "2025-09-21", uf: 18.99, valorUf: 39486, neto: 749839, iva: 142469, total: 892308 },
  { folio: 28, contrato: "C-005", cuotaKey: "Cuota 5/48", fecha: "2025-10-21", uf: 18.99, valorUf: 39547, neto: 750998, iva: 142690, total: 893688 },
  { folio: 30, contrato: "C-005", cuotaKey: "Cuota 6/48", fecha: "2025-11-21", uf: 18.99, valorUf: 39644, neto: 752840, iva: 143040, total: 895880 },
  { folio: 36, contrato: "C-005", cuotaKey: "Cuota 7/48", fecha: "2025-12-21", uf: 18.99, valorUf: 39690, neto: 753713, iva: 143205, total: 896918 },
  { folio: 42, contrato: "C-005", cuotaKey: "Cuota 8/48", fecha: "2026-01-21", uf: 18.99, valorUf: 39732, neto: 754511, iva: 143357, total: 897868 },
  { folio: 45, contrato: "C-005", cuotaKey: "Cuota 9/48", fecha: "2026-02-21", uf: 18.99, valorUf: 39751, neto: 754871, iva: 143425, total: 898296 },
  { folio: 50, contrato: "C-005", cuotaKey: "Cuota 10/48", fecha: "2026-03-21", uf: 18.99, valorUf: 39842, neto: 756600, iva: 143754, total: 900354 },
  { folio: 61, contrato: "C-005", cuotaKey: "Cuota 11/48", fecha: "2026-05-01", uf: 18.99, valorUf: 40000.61, neto: 759612, iva: 144326, total: 903938 },
  { folio: 68, contrato: "C-005", cuotaKey: "Cuota 12/48", fecha: "2026-05-21", uf: 18.99, valorUf: 40442, neto: 767994, iva: 145919, total: 913913 },
  { folio: 58, contrato: "C-006", cuotaKey: "1ª renta (al firmar)", fecha: "2026-05-01", uf: 3051.93, valorUf: 40080.29, neto: 122322239, iva: 23241225, total: 145563464 },
  { folio: 62, contrato: "C-006", cuotaKey: "Cuota 1/24", fecha: "2026-05-05", uf: 155.74, valorUf: 40186.79, neto: 6258691, iva: 1189151, total: 7447842 },
  { folio: 71, contrato: "C-006", cuotaKey: "Cuota 2/24", fecha: "2026-06-05", uf: 155.74, valorUf: 40695, neto: 6337839, iva: 1204189, total: 7542028 },
  { folio: 79, contrato: "C-007", cuotaKey: "Pago inicial", fecha: "2026-06-30", uf: null, valorUf: null, neto: 7500000, iva: 1425000, total: 8925000 },
  { folio: 77, contrato: "C-007", cuotaKey: "Cuota 1/48", fecha: "2026-06-30", uf: 22.66, valorUf: 40160, neto: 910026, iva: 172905, total: 1082931 },
  { folio: 78, contrato: "C-007", cuotaKey: "Cuota 2/48", fecha: "2026-06-30", uf: 22.66, valorUf: 40661, neto: 921378, iva: 175062, total: 1096440 },
];

/** Índice contrato|cuotaKey -> factura, para overlay en la conciliación. */
export const FACTURA_POR_CUOTA: Record<string, FacturaSII> = {};
for (const f of FACTURAS) {
  FACTURA_POR_CUOTA[`${f.contrato}|${f.cuotaKey}`] = f;
}
