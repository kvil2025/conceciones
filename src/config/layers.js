/* Layer definitions and configuration for the Catastro Minero viewer */

export const LAYERS = {
  concesion: {
    id: 'concesion',
    name: 'Concesiones',
    description: 'Concesiones de exploración',
    color: '#E8B84B',
    colorRgba: 'rgba(232, 184, 75, 0.35)',
    colorHover: 'rgba(232, 184, 75, 0.6)',
    colorBorder: 'rgba(232, 184, 75, 0.8)',
    file: '/data/concesion.geojson',
    centroidsFile: '/data/concesion-centroids.json',
    count: 40158,
    defaultVisible: false,
  },
  manifestacion: {
    id: 'manifestacion',
    name: 'Manifestaciones',
    description: 'Solicitudes de manifestación',
    color: '#10b981',
    colorRgba: 'rgba(16, 185, 129, 0.35)',
    colorHover: 'rgba(16, 185, 129, 0.6)',
    colorBorder: 'rgba(16, 185, 129, 0.8)',
    file: '/data/manifestacion.geojson',
    centroidsFile: '/data/manifestacion-centroids.json',
    count: 64131,
    defaultVisible: false,
  },
  mensura: {
    id: 'mensura',
    name: 'Mensuras',
    description: 'Mensuras constituidas',
    color: '#0ea5e9',
    colorRgba: 'rgba(14, 165, 233, 0.35)',
    colorHover: 'rgba(14, 165, 233, 0.6)',
    colorBorder: 'rgba(14, 165, 233, 0.8)',
    file: '/data/mensura.geojson',
    centroidsFile: '/data/mensura-centroids.json',
    count: 85977,
    defaultVisible: false,
  },
  pedimento: {
    id: 'pedimento',
    name: 'Pedimentos',
    description: 'Pedimentos registrados',
    color: '#ef4444',
    colorRgba: 'rgba(239, 68, 68, 0.35)',
    colorHover: 'rgba(239, 68, 68, 0.6)',
    colorBorder: 'rgba(239, 68, 68, 0.8)',
    file: '/data/pedimento.geojson',
    centroidsFile: '/data/pedimento-centroids.json',
    count: 4806,
    defaultVisible: false,
  },
};

export const LAYER_ORDER = ['concesion', 'manifestacion', 'mensura', 'pedimento'];

export const BASEMAPS = {
  dark: {
    id: 'dark',
    name: 'Oscuro',
    icon: 'moon',
    tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'],
    attribution: '&copy; <a href="https://carto.com">CARTO</a>',
  },
  satellite: {
    id: 'satellite',
    name: 'Satélite',
    icon: 'satellite',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    attribution: '&copy; <a href="https://www.esri.com">Esri</a>',
  },
  topo: {
    id: 'topo',
    name: 'Topográfico',
    icon: 'mountain',
    tiles: ['https://a.tile.opentopomap.org/{z}/{x}/{y}.png'],
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
};

export const CHILE_CENTER = [-33.45, -70.65];
export const CHILE_BOUNDS = [[-75.8, -56.0], [-66.0, -17.5]];
export const DEFAULT_ZOOM = 5;

export const FIELD_LABELS = {
  nombre: 'Nombre',
  titular: 'Titular',
  dueno_norm: 'Dueño',
  tipo: 'Tipo',
  hectareas: 'Hectáreas',
  juzgado: 'Juzgado',
  anio_sentencia: 'Año Sentencia',
  f_sentenci: 'Fecha Sentencia',
  rol: 'Rol',
  archivo: 'Archivo',
  solicitud: 'Solicitud',
  comuna: 'Comuna',
  bol_senten: 'Boletín Sent.',
  bol_sol: 'Boletín Sol.',
  boletin: 'Boletín',
  mensura: 'Mensura',
  conservado: 'Conservador',
  seccion_boletin: 'Sección Boletín',
};

export function formatNumber(num) {
  if (num == null) return '—';
  return new Intl.NumberFormat('es-CL').format(num);
}
