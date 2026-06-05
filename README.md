# 🏔️ Catastro Minero de Chile — Visor de Concesiones

Visor profesional e interactivo del catastro minero de Chile. Permite visualizar y explorar concesiones de exploración, manifestaciones, mensuras y pedimentos sobre un mapa interactivo.

## ✨ Características

- **4 capas de datos** con ~195.000 registros:
  - 🟡 Concesiones de Exploración (40.158)
  - 🟢 Manifestaciones (64.131)
  - 🔵 Mensuras (85.977)
  - 🔴 Pedimentos (4.806)
- **Mapa interactivo** con MapLibre GL JS
- **3 mapas base**: CARTO Dark, Esri Satellite, OpenTopoMap
- **Búsqueda** por nombre o titular con resultados en tiempo real
- **Popups informativos** con datos registrales completos
- **Estadísticas** con gráficos interactivos (distribución por tipo, top titulares, distribución por año)
- **Design premium** dark mode con glassmorphism y acentos dorados
- **Responsive** — funciona en desktop y mobile

## 📊 Fuente de Datos

Catastro minero de SERNAGEOMIN — Boletín Abril 2026.

## 🚀 Inicio Rápido

### Pre-requisitos
- Node.js 18+
- Python 3.9+ (para preparar los datos)

### 1. Clonar el repositorio
```bash
git clone https://github.com/kvil2025/conceciones.git
cd conceciones
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Preparar los datos
Los archivos GeoJSON del catastro minero deben estar en la carpeta fuente. Ejecutar el script de preparación:
```bash
python3 scripts/prepare_data.py
```
> **Nota:** El script espera los archivos GeoJSON originales en `~/catastro_conseciones/`. Modifica el `SOURCE_DIR` en el script si los tienes en otra ubicación.

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

### 5. Build de producción
```bash
npm run build
```

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| Framework | React 19 + Vite 6 |
| Mapa | MapLibre GL JS 4.7 |
| Gráficos | Recharts 2.15 |
| Iconos | Lucide React |
| Estilos | CSS Custom Properties |
| Fuentes | Inter + Outfit (Google Fonts) |

## 📁 Estructura del Proyecto

```
├── public/
│   └── data/          # GeoJSON + stats (generados por prepare_data.py)
├── scripts/
│   └── prepare_data.py # Genera centroides y estadísticas
├── src/
│   ├── components/
│   │   ├── MapViewer.jsx      # Mapa MapLibre GL
│   │   ├── Sidebar.jsx        # Panel lateral
│   │   ├── StatsModal.jsx     # Modal de estadísticas
│   │   └── LoadingScreen.jsx  # Pantalla de carga
│   ├── config/
│   │   └── layers.js          # Configuración de capas
│   ├── styles/
│   │   └── design-system.css  # Sistema de diseño
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## 📄 Licencia

Datos de catastro minero: SERNAGEOMIN (Chile). Uso educativo y de referencia.
