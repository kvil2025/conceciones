export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      {/* Company logos */}
      <div className="login-logos" style={{ marginBottom: 24 }}>
        <div className="login-logo-item">
          <img
            src="/logo-tecknologia-white.png"
            alt="TECKNOLOGIA"
            style={{ height: 48, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
          />
        </div>
        <div className="login-logo-divider" />
        <div className="login-logo-item">
          <img
            src="/logo-geologgia.png"
            alt="Geologgia Ltda."
            style={{
              height: 40,
              background: 'rgba(255,255,255,0.92)',
              borderRadius: 6,
              padding: '3px 8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      </div>

      <div className="loading-text">Catastro Minero de Chile</div>
      <div className="loading-sub">Preparando el visor de concesiones...</div>
      <div className="loading-bar">
        <div
          className="loading-bar-fill"
          style={{
            width: '100%',
            animation: 'loading-progress 1.6s ease-in-out',
          }}
        />
      </div>
      <style>{`
        @keyframes loading-progress {
          0% { width: 0%; }
          50% { width: 65%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
