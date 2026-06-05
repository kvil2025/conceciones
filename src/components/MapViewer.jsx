import { useEffect, useRef, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import {
  LAYERS,
  LAYER_ORDER,
  BASEMAPS,
  DEFAULT_ZOOM,
  formatNumber,
} from '../config/layers';
import {
  PanelLeftOpen,
  MapPin,
  Crosshair,
  ZoomIn,
} from 'lucide-react';

export default function MapViewer({
  layerVisibility,
  basemap,
  sidebarOpen,
  onSidebarToggle,
  onLayerLoading,
  onDataLoaded,
  flyTo,
  featureCounts,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const loadedLayersRef = useRef(new Set());
  const dataCache = useRef({});
  const [cursorCoords, setCursorCoords] = useState(null);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const hoveredFeatureRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const bmConfig = BASEMAPS[basemap] || BASEMAPS.dark;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          basemap: {
            type: 'raster',
            tiles: bmConfig.tiles,
            tileSize: 256,
            attribution: bmConfig.attribution,
          },
        },
        layers: [
          {
            id: 'basemap-layer',
            type: 'raster',
            source: 'basemap',
          },
        ],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: [-70.65, -33.45],
      zoom: DEFAULT_ZOOM,
      maxBounds: [[-82, -60], [-60, -15]],
      attributionControl: true,
    });

    // Navigation controls
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 150, unit: 'metric' }), 'bottom-right');

    // Track cursor coordinates
    map.on('mousemove', (e) => {
      setCursorCoords({
        lat: e.lngLat.lat.toFixed(5),
        lng: e.lngLat.lng.toFixed(5),
      });
    });

    // Track zoom
    map.on('zoom', () => {
      setMapZoom(Math.round(map.getZoom() * 10) / 10);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle basemap change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const doSwitch = () => {
      const bmConfig = BASEMAPS[basemap] || BASEMAPS.dark;
      const source = map.getSource('basemap');
      if (source) {
        source.setTiles(bmConfig.tiles);
      }
    };

    if (map.isStyleLoaded()) {
      doSwitch();
    } else {
      map.on('load', doSwitch);
    }
  }, [basemap]);

  // Load GeoJSON data for a layer
  const loadLayerData = useCallback(
    async (layerId) => {
      if (dataCache.current[layerId]) return dataCache.current[layerId];

      const layer = LAYERS[layerId];
      if (!layer) return null;

      onLayerLoading(layerId, true);

      try {
        const response = await fetch(layer.file);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        dataCache.current[layerId] = data;
        onDataLoaded(layerId, data);
        return data;
      } catch (err) {
        console.error(`Error loading ${layerId}:`, err);
        return null;
      } finally {
        onLayerLoading(layerId, false);
      }
    },
    [onLayerLoading, onDataLoaded]
  );

  // Add a polygon layer to the map
  const addLayerToMap = useCallback(
    (map, layerId, data) => {
      if (loadedLayersRef.current.has(layerId)) return;

      const layer = LAYERS[layerId];
      const sourceId = `source-${layerId}`;
      const fillId = `fill-${layerId}`;
      const lineId = `line-${layerId}`;
      const fillHoverId = `fill-hover-${layerId}`;

      // Add source
      map.addSource(sourceId, {
        type: 'geojson',
        data: data,
        generateId: true,
      });

      // Fill layer
      map.addLayer({
        id: fillId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': layer.color,
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.55,
            0.3,
          ],
        },
      });

      // Border layer
      map.addLayer({
        id: lineId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': layer.color,
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2.5,
            1,
          ],
          'line-opacity': 0.7,
        },
      });

      // Hover interaction
      map.on('mousemove', fillId, (e) => {
        if (e.features.length > 0) {
          map.getCanvas().style.cursor = 'pointer';

          // Remove previous hover
          if (
            hoveredFeatureRef.current &&
            hoveredFeatureRef.current.sourceId === sourceId
          ) {
            map.setFeatureState(
              { source: sourceId, id: hoveredFeatureRef.current.id },
              { hover: false }
            );
          }

          const featureId = e.features[0].id;
          map.setFeatureState(
            { source: sourceId, id: featureId },
            { hover: true }
          );
          hoveredFeatureRef.current = { sourceId, id: featureId };
        }
      });

      map.on('mouseleave', fillId, () => {
        map.getCanvas().style.cursor = '';
        if (
          hoveredFeatureRef.current &&
          hoveredFeatureRef.current.sourceId === sourceId
        ) {
          map.setFeatureState(
            { source: sourceId, id: hoveredFeatureRef.current.id },
            { hover: false }
          );
          hoveredFeatureRef.current = null;
        }
      });

      // Click popup
      map.on('click', fillId, (e) => {
        if (e.features.length === 0) return;

        const feature = e.features[0];
        const props = feature.properties;
        const layerConfig = LAYERS[layerId];

        const popupHTML = buildPopupHTML(props, layerConfig);

        new maplibregl.Popup({
          maxWidth: '340px',
          closeButton: true,
          closeOnClick: true,
        })
          .setLngLat(e.lngLat)
          .setHTML(popupHTML)
          .addTo(map);
      });

      loadedLayersRef.current.add(layerId);
    },
    []
  );

  // Build popup HTML
  function buildPopupHTML(props, layerConfig) {
    const badgeColor = layerConfig.color;
    const badgeBg = layerConfig.colorRgba;

    const fields = [
      { key: 'titular', label: 'Titular' },
      { key: 'tipo', label: 'Tipo' },
      { key: 'hectareas', label: 'Hectáreas' },
      { key: 'juzgado', label: 'Juzgado' },
      { key: 'anio_sentencia', label: 'Año Sentencia' },
      { key: 'rol', label: 'Rol' },
      { key: 'comuna', label: 'Comuna' },
      { key: 'solicitud', label: 'Solicitud' },
      { key: 'f_sentenci', label: 'Fecha Sentencia' },
      { key: 'archivo', label: 'Archivo' },
    ];

    const fieldRows = fields
      .filter((f) => props[f.key] && String(props[f.key]).trim())
      .map(
        (f) => `
        <div class="popup-field">
          <span class="popup-field-label">${f.label}</span>
          <span class="popup-field-value">${
            f.key === 'hectareas'
              ? formatNumber(props[f.key])
              : props[f.key]
          }</span>
        </div>`
      )
      .join('');

    return `
      <div class="popup-content">
        <div class="popup-type-badge" style="background:${badgeBg};color:${badgeColor};border:1px solid ${badgeColor}40">
          <span style="width:7px;height:7px;border-radius:50%;background:${badgeColor};display:inline-block"></span>
          ${layerConfig.name}
        </div>
        <div class="popup-title">${props.nombre || 'Sin nombre'}</div>
        ${fieldRows}
      </div>
    `;
  }

  // Handle layer visibility changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const onStyleReady = () => {
      LAYER_ORDER.forEach(async (layerId) => {
        const isVisible = layerVisibility[layerId];
        const fillId = `fill-${layerId}`;
        const lineId = `line-${layerId}`;

        if (isVisible) {
          // Load data if not cached
          if (!loadedLayersRef.current.has(layerId)) {
            const data = await loadLayerData(layerId);
            if (data && map.isStyleLoaded()) {
              addLayerToMap(map, layerId, data);
            }
          } else {
            // Just show the layers
            if (map.getLayer(fillId)) {
              map.setLayoutProperty(fillId, 'visibility', 'visible');
            }
            if (map.getLayer(lineId)) {
              map.setLayoutProperty(lineId, 'visibility', 'visible');
            }
          }
        } else {
          // Hide layers
          if (map.getLayer(fillId)) {
            map.setLayoutProperty(fillId, 'visibility', 'none');
          }
          if (map.getLayer(lineId)) {
            map.setLayoutProperty(lineId, 'visibility', 'none');
          }
        }
      });
    };

    if (map.isStyleLoaded()) {
      onStyleReady();
    } else {
      map.on('load', onStyleReady);
    }
  }, [layerVisibility, loadLayerData, addLayerToMap]);

  // Handle flyTo
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !flyTo) return;

    map.flyTo({
      center: [flyTo.lng, flyTo.lat],
      zoom: flyTo.zoom || 12,
      duration: 1500,
      essential: true,
    });
  }, [flyTo]);

  // Active layers for legend
  const activeLayers = LAYER_ORDER.filter((id) => layerVisibility[id]);

  return (
    <div className="map-container">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Sidebar toggle button (shown when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          className="sidebar-toggle"
          onClick={onSidebarToggle}
          title="Abrir panel"
        >
          <PanelLeftOpen />
        </button>
      )}

      {/* Map Legend */}
      {activeLayers.length > 0 && (
        <div className="map-legend">
          <div className="legend-title">Capas activas</div>
          {activeLayers.map((id) => {
            const layer = LAYERS[id];
            return (
              <div key={id} className="legend-item">
                <div
                  className="legend-dot"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="legend-label">{layer.name}</span>
                <span className="legend-value">
                  {formatNumber(featureCounts[id])}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Bar */}
      <div className="map-status-bar">
        {cursorCoords && (
          <>
            <div className="status-item">
              <Crosshair />
              {cursorCoords.lat}°, {cursorCoords.lng}°
            </div>
            <div className="status-divider" />
          </>
        )}
        <div className="status-item">
          <ZoomIn />
          Zoom: {mapZoom}
        </div>
        <div className="status-divider" />
        <div className="status-item">
          <MapPin />
          {formatNumber(
            LAYER_ORDER.reduce(
              (sum, id) => sum + (layerVisibility[id] ? featureCounts[id] : 0),
              0
            )
          )}{' '}
          features visibles
        </div>
        <div style={{ flex: 1 }} />
        <div className="status-item" style={{ opacity: 0.5 }}>
          WGS84 · EPSG:4326
        </div>
      </div>
    </div>
  );
}
