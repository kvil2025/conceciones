# 🗺️ Catastro Minero de Chile — Visor Interactivo

Visor profesional de concesiones mineras de Chile con datos del **SERNAGEOMIN** (Boletín Abril 2026).

Desarrollado por **[TECKNOLOGIA](https://tecknologia.cl)** × **Geologgia Ltda.**

![Capas](https://img.shields.io/badge/Registros-195.072-gold)
![Capas](https://img.shields.io/badge/Capas-4-blue)
![Datos](https://img.shields.io/badge/Fuente-SERNAGEOMIN-green)

---

## 📊 Datos incluidos

| Capa | Registros | Archivo |
|---|---|---|
| 🟡 Concesiones | 40.158 | `concesion.geojson` |
| 🟢 Manifestaciones | 64.131 | `manifestacion.geojson` |
| 🔵 Mensuras | 85.977 | `mensura.geojson` |
| 🔴 Pedimentos | 4.806 | `pedimento.geojson` |

---

## 🚀 Instalación rápida (local)

### Requisitos
- **Node.js** 18+ → [descargar](https://nodejs.org/)
- **Git** → [descargar](https://git-scm.com/)

### 3 pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/kvil2025/conceciones.git
cd conceciones

# 2. Instalar dependencias
npm install

# 3. Iniciar la app
npm run dev
```

Abre **http://localhost:5173** en tu navegador. ¡Listo! 🎉

> **Nota:** Los datos GeoJSON (~119 MB) están incluidos en el repositorio. La primera clonación puede tomar unos minutos dependiendo de tu conexión.

---

## 🖥️ Funcionalidades

- **Mapa interactivo** con MapLibre GL JS
- **4 capas de datos** activables por separado
- **3 mapas base**: Oscuro, Satélite, Topográfico
- **Búsqueda** por nombre de concesión o titular
- **Estadísticas** con gráficos por tipo y año
- **Popup detallado** al hacer click en cualquier polígono
- **Coordenadas en tiempo real** del cursor
- **Responsive** — funciona en escritorio y móvil

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| [React 19](https://react.dev) | UI framework |
| [Vite](https://vite.dev) | Build tool |
| [MapLibre GL JS](https://maplibre.org) | Motor de mapas |
| [Lucide React](https://lucide.dev) | Iconografía |
| [Recharts](https://recharts.org) | Gráficos estadísticos |

---

## 📁 Estructura del proyecto

```
conceciones/
├── public/
│   ├── data/              ← GeoJSON de SERNAGEOMIN
│   │   ├── concesion.geojson
│   │   ├── manifestacion.geojson
│   │   ├── mensura.geojson
│   │   ├── pedimento.geojson
│   │   └── stats.json
│   ├── logo-tecknologia.png
│   └── logo-geologgia.png
├── src/
│   ├── components/
│   │   ├── MapViewer.jsx   ← Mapa principal
│   │   ├── Sidebar.jsx     ← Panel lateral
│   │   ├── LoginGate.jsx   ← Pantalla de acceso
│   │   ├── StatsModal.jsx  ← Modal de estadísticas
│   │   └── LoadingScreen.jsx
│   ├── config/
│   │   └── layers.js       ← Configuración de capas
│   └── styles/
│       └── design-system.css
├── scripts/
│   └── optimize_geojson.py ← Optimizador de datos
├── package.json
└── vite.config.js
```

---

## 🔧 Comandos útiles

```bash
# Desarrollo (con hot reload)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Optimizar GeoJSON (requiere Python 3)
python3 scripts/optimize_geojson.py
```

---

## 🌐 Versión online

La app también está disponible en: **[catastro-minero.vercel.app](https://catastro-minero.vercel.app)**

> ⚠️ La versión online puede ser lenta por la descarga de datos. Para mejor rendimiento, usa la versión local.

---

## 📋 Datos

Los datos provienen del **Boletín Oficial de Minería** de [SERNAGEOMIN](https://www.sernageomin.cl/) (Abril 2026). Incluyen concesiones de exploración, manifestaciones mineras, mensuras constituidas y pedimentos registrados a lo largo de todo Chile.

---

## 📄 Licencia

Datos: Dominio público (SERNAGEOMIN).
Código: MIT License.

---

<p align="center">
  <strong>TECKNOLOGIA</strong> × <strong>Geologgia Ltda.</strong><br>
  Inteligencia geológica aplicada 🇨🇱
</p>
