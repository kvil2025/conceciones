import { useMemo } from 'react';
import {
  Layers,
  Search,
  Map as MapIcon,
  BarChart3,
  ChevronLeft,
  Moon,
  Satellite,
  Mountain,
  X,
  LogOut,
  User,
} from 'lucide-react';
import { LAYERS, LAYER_ORDER, BASEMAPS, formatNumber } from '../config/layers';

export default function Sidebar({
  isOpen,
  onToggle,
  layerVisibility,
  layerLoading,
  onToggleLayer,
  basemap,
  onBasemapChange,
  searchQuery,
  onSearch,
  searchResults,
  onResultClick,
  featureCounts,
  onShowStats,
  userName,
  onLogout,
}) {
  const totalFeatures = useMemo(
    () => LAYER_ORDER.reduce((sum, id) => sum + (featureCounts[id] || 0), 0),
    [featureCounts]
  );

  const activeCount = useMemo(
    () => LAYER_ORDER.filter((id) => layerVisibility[id]).length,
    [layerVisibility]
  );

  const basemapIcons = {
    dark: Moon,
    satellite: Satellite,
    topo: Mountain,
  };

  return (
    <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      {/* Header */}
      <div className="sidebar-header">
        {/* Company logos above title */}
        <div className="sidebar-header-logos">
          <img
            src="/logo-tecknologia.png"
            alt="TECKNOLOGIA"
            style={{ height: 28, opacity: 0.85, filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.4))' }}
          />
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)' }} />
          <img
            src="/logo-geologgia.png"
            alt="Geologgia Ltda."
            style={{
              height: 24,
              opacity: 0.85,
              background: 'rgba(255,255,255,0.9)',
              borderRadius: 3,
              padding: '2px 6px',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="sidebar-brand">
            <div>
              <div className="sidebar-title">Catastro Minero</div>
              <div className="sidebar-subtitle">Visor de Concesiones de Chile</div>
            </div>
          </div>
          <button
            onClick={onToggle}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Cerrar panel"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* User info bar */}
        {userName && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 12,
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={14} style={{ color: 'var(--gold-primary)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {userName}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                padding: 4,
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="sidebar-content">
        {/* Stats Summary */}
        <div className="sidebar-section">
          <div className="section-label">
            <BarChart3 /> Resumen
          </div>
          <div className="stats-grid">
            <div className="stat-card highlight">
              <div className="stat-number">{formatNumber(totalFeatures)}</div>
              <div className="stat-label">Total registros</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{activeCount}</div>
              <div className="stat-label">Capas activas</div>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onShowStats}
            style={{ marginTop: 10, width: '100%' }}
          >
            <BarChart3 size={14} />
            Ver estadísticas completas
          </button>
        </div>

        {/* Search */}
        <div className="sidebar-section">
          <div className="section-label">
            <Search /> Búsqueda
          </div>
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              className="search-input"
              type="text"
              placeholder="Buscar por nombre o titular..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
            {searchQuery && (
              <button
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                }}
                onClick={() => onSearch('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, idx) => (
                <div
                  key={`${result.layerId}-${result.id}-${idx}`}
                  className="search-result-item"
                  onClick={() => onResultClick(result)}
                  style={{ borderLeftColor: LAYERS[result.layerId]?.color }}
                >
                  <div className="search-result-name">{result.name}</div>
                  <div className="search-result-detail">
                    {result.titular} · {result.hectareas ? formatNumber(result.hectareas) + ' ha' : ''} · {LAYERS[result.layerId]?.name}
                  </div>
                </div>
              ))}
              {searchResults.length >= 30 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '8px',
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Mostrando primeros 30 resultados
                </div>
              )}
            </div>
          )}

          {searchQuery && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '16px 8px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              Sin resultados para "{searchQuery}"
            </div>
          )}
        </div>

        {/* Layers */}
        <div className="sidebar-section">
          <div className="section-label">
            <Layers /> Capas de datos
          </div>
          {LAYER_ORDER.map((layerId) => {
            const layer = LAYERS[layerId];
            const isActive = layerVisibility[layerId];
            const isLoading = layerLoading[layerId];

            return (
              <div
                key={layerId}
                className={`layer-toggle ${isActive ? 'active' : ''}`}
                onClick={() => onToggleLayer(layerId)}
                style={isActive ? { color: layer.color } : {}}
              >
                <div
                  className="layer-color-dot"
                  style={{
                    backgroundColor: isActive ? layer.color : 'var(--text-muted)',
                  }}
                />
                <div className="layer-info">
                  <div className="layer-name">{layer.name}</div>
                  <div className="layer-count">
                    {formatNumber(featureCounts[layerId])} registros
                  </div>
                </div>
                {isLoading ? (
                  <div className="layer-loading" />
                ) : (
                  <div
                    className="layer-switch"
                    style={
                      isActive
                        ? {
                            background: `${layer.color}30`,
                            borderColor: layer.color,
                          }
                        : {}
                    }
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Basemap Selector */}
        <div className="sidebar-section">
          <div className="section-label">
            <MapIcon /> Mapa base
          </div>
          <div className="basemap-grid">
            {Object.entries(BASEMAPS).map(([id, bm]) => {
              const Icon = basemapIcons[id] || MapIcon;
              const isActive = basemap === id;
              return (
                <div
                  key={id}
                  className={`basemap-option ${isActive ? 'active' : ''}`}
                  onClick={() => onBasemapChange(id)}
                >
                  <div className="basemap-icon">
                    <Icon size={18} />
                  </div>
                  <div className="basemap-label">{bm.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Source */}
        <div className="sidebar-section">
          <div
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: 'var(--text-secondary)' }}>Fuente de datos:</strong>
            <br />
            Catastro minero SERNAGEOMIN · Boletín Abril 2026
            <br />
            <span style={{ opacity: 0.6 }}>
              Datos actualizados al corte de abril 2026
            </span>
          </div>
        </div>
      </div>


    </aside>
  );
}
