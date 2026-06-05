import { useMemo } from 'react';
import { X } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { LAYERS, formatNumber } from '../config/layers';

const COLORS = {
  concesion: '#E8B84B',
  manifestacion: '#10b981',
  mensura: '#0ea5e9',
  pedimento: '#ef4444',
};

const RADIAN = Math.PI / 180;

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text
      x={x}
      y={y}
      fill="#F0F6FC"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: '0.7rem', fontWeight: 600 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  return (
    <div
      style={{
        background: 'rgba(13, 17, 23, 0.95)',
        border: '1px solid rgba(240, 246, 252, 0.08)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: '0.75rem',
        color: '#F0F6FC',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 3 }}>
        {d.payload.name || d.payload.titular}
      </div>
      <div style={{ color: '#8B949E' }}>
        {formatNumber(d.value)} registros
      </div>
    </div>
  );
}

export default function StatsModal({ data, onClose }) {
  // Pie chart data
  const pieData = useMemo(() => {
    if (!data?.total_features) return [];
    return Object.entries(data.total_features).map(([key, value]) => ({
      name: LAYERS[key]?.name || key,
      value,
      color: COLORS[key] || '#8B949E',
    }));
  }, [data]);

  // Top titulares bar chart
  const titularesData = useMemo(() => {
    if (!data?.top_titulares) return [];
    return data.top_titulares.slice(0, 15).map((t) => ({
      name: t.titular.length > 25 ? t.titular.slice(0, 25) + '…' : t.titular,
      titular: t.titular,
      value: t.count,
    }));
  }, [data]);

  // Top juzgados
  const juzgadosData = useMemo(() => {
    if (!data?.by_juzgado) return [];
    return Object.entries(data.by_juzgado)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, value]) => ({
        name: name.length > 20 ? name.slice(0, 20) + '…' : name,
        value,
      }));
  }, [data]);

  // Year distribution
  const yearData = useMemo(() => {
    if (!data?.by_year) return [];
    return Object.entries(data.by_year)
      .filter(([year]) => !isNaN(parseInt(year)) && parseInt(year) > 1950)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([year, value]) => ({
        name: year,
        value,
      }));
  }, [data]);

  const total = useMemo(() => {
    if (!data?.total_features) return 0;
    return Object.values(data.total_features).reduce((a, b) => a + b, 0);
  }, [data]);

  return (
    <div className="stats-modal-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stats-modal-header">
          <div>
            <div className="stats-modal-title">Estadísticas del Catastro</div>
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                marginTop: 4,
              }}
            >
              {formatNumber(total)} registros totales · Boletín Abril 2026
            </div>
          </div>
          <button className="stats-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="stats-modal-body">
          <div className="stats-charts-grid">
            {/* Pie Chart - Distribution by type */}
            <div className="chart-card">
              <div className="chart-title">Distribución por tipo</div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={45}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                    stroke="rgba(10,10,15,0.5)"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: '#8B949E', fontSize: '0.7rem' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Top Juzgados */}
            <div className="chart-card">
              <div className="chart-title">Top 15 juzgados por registros</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={juzgadosData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#C9A84C" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Top Titulares */}
            <div className="chart-card full-width">
              <div className="chart-title">Top 15 titulares con más concesiones</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={titularesData} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-40}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 9 }}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart - Year Distribution */}
            <div className="chart-card full-width">
              <div className="chart-title">Distribución por año de sentencia</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={4} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
