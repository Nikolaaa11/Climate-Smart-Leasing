// Órdenes de Compra emitidas por los clientes a CSL.
// Una OC NO se vincula a un contrato de arriendo (son trabajos/estudios puntuales):
// tiene un título, un cliente, su fecha, y una o más facturas asociadas.
// Fuente única de verdad. El documento de respaldo (campo `archivo`) se guarda
// pero NO se expone en la página (igual que en Contratos).

export interface FacturaOC {
  folio: number;         // n° de factura SII
  fecha: string;         // fecha de emisión (ISO yyyy-mm-dd)
  uf?: number | null;    // cantidad de UF facturada (null si el monto es en CLP)
  neto: number;          // monto neto CLP
  total: number;         // monto total CLP con IVA
  pagado?: number;       // monto pagado CLP (0 / undefined = sin pago)
  fechaPago?: string;    // fecha de pago (ISO), si se conoce
}

export interface OrdenCompra {
  id: string;                 // identificador interno (ej. "OC-001")
  titulo: string;             // nombre/título de la orden de compra
  cliente: string;            // razón social del cliente que emite la OC
  fechaOrdenCompra?: string;  // fecha de la OC (ISO); undefined si el documento aún no se sube
  archivo?: string;           // PDF de respaldo (en base de datos, NO se muestra en la página)
  facturas: FacturaOC[];
}

export const ORDENES_COMPRA: OrdenCompra[] = [
  {
    id: "OC-001",
    titulo: "Estudio IT Reciclaje de aguas",
    cliente: "Bebidas Funcionales Caelum SpA",
    fechaOrdenCompra: undefined, // documento por subir
    facturas: [
      // Pagadas: los abonos de Caelum ($1MM+$5MM+$4MM mar-2025 + $1,9MM ene-2026 = $11,9MM)
      // cubren el total de la OC. Fecha de pago por factura estimada por orden FIFO.
      { folio: 7, fecha: "2025-03-01", uf: null, neto: 4_000_000, total: 4_760_000, pagado: 4_760_000, fechaPago: "2025-03-14" },
      { folio: 8, fecha: "2025-03-10", uf: null, neto: 4_000_000, total: 4_760_000, pagado: 4_760_000, fechaPago: "2025-03-14" },
      { folio: 9, fecha: "2025-03-12", uf: null, neto: 2_000_000, total: 2_380_000, pagado: 2_380_000, fechaPago: "2026-01-02" },
    ],
  },
  {
    id: "OC-002",
    titulo: "Estudio analítica de aguas",
    cliente: "CG Metrics SpA",
    fechaOrdenCompra: undefined, // documento por subir
    facturas: [
      // Pagada: CG Metrics transfirió $788.002 (07-jul) + $5.000.000 (10-jul) = $5.788.002 exacto.
      { folio: 17, fecha: "2025-07-01", uf: null, neto: 4_863_867, total: 5_788_002, pagado: 5_788_002, fechaPago: "2025-07-10" },
    ],
  },
];
