import { Pickaxe } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
        <Pickaxe />
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
