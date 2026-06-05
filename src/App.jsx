import { useState, useCallback, useRef, useEffect } from 'react';
import { LAYERS, LAYER_ORDER } from './config/layers';
import Sidebar from './components/Sidebar';
import MapViewer from './components/MapViewer';
import StatsModal from './components/StatsModal';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState(() => {
    const initial = {};
    LAYER_ORDER.forEach((id) => {
      initial[id] = LAYERS[id].defaultVisible;
    });
    return initial;
  });

  // Loading state per layer
  const [layerLoading, setLayerLoading] = useState({});

  // Layer data cache
  const layerDataRef = useRef({});

  // Current basemap
  const [basemap, setBasemap] = useState('dark');

  // Sidebar collapsed
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Stats modal
  const [showStats, setShowStats] = useState(false);
  const [statsData, setStatsData] = useState(null);

  // Map ref for external control
  const mapRef = useRef(null);

  // Initial loading
  const [appReady, setAppReady] = useState(false);

  // Fly to coordinates
  const [flyTo, setFlyTo] = useState(null);

  // Feature counts (actual loaded)
  const [featureCounts, setFeatureCounts] = useState(() => {
    const counts = {};
    LAYER_ORDER.forEach((id) => {
      counts[id] = LAYERS[id].count;
    });
    return counts;
  });

  // Load stats.json on mount
  useEffect(() => {
    fetch('/data/stats.json')
      .then((r) => r.json())
      .then((data) => setStatsData(data))
      .catch(console.error);
  }, []);

  // App ready after a short delay to allow map to initialize
  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  // Toggle layer visibility
  const handleToggleLayer = useCallback((layerId) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  }, []);

  // Update loading state for a layer
  const handleLayerLoading = useCallback((layerId, isLoading) => {
    setLayerLoading((prev) => ({
      ...prev,
      [layerId]: isLoading,
    }));
  }, []);

  // Search handler with debounce
  const searchTimeoutRef = useRef(null);
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }

      searchTimeoutRef.current = setTimeout(() => {
        const results = [];
        const q = query.toLowerCase();

        // Search through loaded layer data
        for (const layerId of LAYER_ORDER) {
          const data = layerDataRef.current[layerId];
          if (!data) continue;

          const features = data.features || [];
          for (let i = 0; i < features.length && results.length < 30; i++) {
            const props = features[i].properties;
            const name = (props.nombre || '').toLowerCase();
            const titular = (props.titular || '').toLowerCase();

            if (name.includes(q) || titular.includes(q)) {
              results.push({
                layerId,
                id: props.id,
                name: props.nombre,
                titular: props.titular,
                tipo: props.tipo,
                hectareas: props.hectareas,
                lat: props.lat_centro,
                lng: props.lng_centro,
              });
            }
          }
        }

        setSearchResults(results);
      }, 300);
    },
    []
  );

  // Handle search result click — fly to location
  const handleResultClick = useCallback((result) => {
    if (result.lat && result.lng) {
      setFlyTo({
        lng: result.lng,
        lat: result.lat,
        zoom: 12,
        timestamp: Date.now(),
      });

      // Ensure the layer is visible
      setLayerVisibility((prev) => ({
        ...prev,
        [result.layerId]: true,
      }));
    }
  }, []);

  // Register layer data for search
  const handleDataLoaded = useCallback((layerId, data) => {
    layerDataRef.current[layerId] = data;
    if (data && data.features) {
      setFeatureCounts((prev) => ({
        ...prev,
        [layerId]: data.features.length,
      }));
    }
  }, []);

  return (
    <>
      {!appReady && <LoadingScreen />}
      <div className="app-layout">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          layerVisibility={layerVisibility}
          layerLoading={layerLoading}
          onToggleLayer={handleToggleLayer}
          basemap={basemap}
          onBasemapChange={setBasemap}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          searchResults={searchResults}
          onResultClick={handleResultClick}
          featureCounts={featureCounts}
          onShowStats={() => setShowStats(true)}
        />
        <MapViewer
          layerVisibility={layerVisibility}
          basemap={basemap}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          onLayerLoading={handleLayerLoading}
          onDataLoaded={handleDataLoaded}
          flyTo={flyTo}
          featureCounts={featureCounts}
          mapRef={mapRef}
        />
      </div>
      {showStats && statsData && (
        <StatsModal data={statsData} onClose={() => setShowStats(false)} />
      )}
    </>
  );
}
