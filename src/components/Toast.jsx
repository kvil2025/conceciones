import { CheckCircle, Loader, AlertCircle, Info } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  loading: Loader,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: '#10b981',
  loading: '#C9A84C',
  error: '#ef4444',
  info: '#0ea5e9',
};

export default function Toast({ toasts }) {
  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 40,
        right: 20,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 340,
      }}
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || ICONS.info;
        const color = COLORS[toast.type] || COLORS.info;

        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              background: 'rgba(13, 17, 23, 0.92)',
              border: `1px solid ${color}40`,
              borderRadius: 10,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 10px ${color}15`,
              animation: 'slideUp 0.3s ease',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Icon
              size={16}
              style={{
                color,
                flexShrink: 0,
                animation: toast.type === 'loading' ? 'spin 1s linear infinite' : 'none',
              }}
            />
            <span
              style={{
                fontSize: '0.78rem',
                color: '#F0F6FC',
                fontWeight: 500,
              }}
            >
              {toast.message}
            </span>
          </div>
        );
      })}
    </div>
  );
}
