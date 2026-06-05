import { useState } from 'react';

/*
 * LoginGate — Pantalla de acceso obligatorio.
 * Captura nombre, email y empresa del usuario.
 * Envía los datos por email usando EmailJS (gratuito, sin backend).
 *
 * CONFIGURACIÓN EmailJS:
 * 1. Crear cuenta en https://www.emailjs.com (gratis, 200 emails/mes)
 * 2. Agregar servicio SMTP (Gmail, Outlook, etc.)
 * 3. Crear template con variables: {{from_name}}, {{from_email}}, {{company}}, {{message}}
 * 4. Copiar service_id, template_id y public_key al objeto EMAILJS_CONFIG
 */
const EMAILJS_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID',     // ← Reemplazar con tu service ID de EmailJS
  templateId: 'YOUR_TEMPLATE_ID',   // ← Reemplazar con tu template ID
  publicKey: 'YOUR_PUBLIC_KEY',     // ← Reemplazar con tu public key
  toEmail: 'contacto@tecknologia.cl',
};

export default function LoginGate({ onAccessGranted }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError('Nombre y email son obligatorios');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un email válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send email via EmailJS
      if (EMAILJS_CONFIG.serviceId !== 'YOUR_SERVICE_ID') {
        await sendEmail({ name, email, company });
      } else {
        // Fallback: log to console when EmailJS is not configured
        console.log('📧 Nuevo acceso al Catastro Minero:', { name, email, company, timestamp: new Date().toISOString() });
      }

      // Store access in localStorage so user doesn't need to log in again
      localStorage.setItem('catastro_access', JSON.stringify({
        name,
        email,
        company,
        timestamp: new Date().toISOString(),
      }));

      onAccessGranted({ name, email, company });
    } catch (err) {
      console.error('Error sending email:', err);
      // Grant access anyway — don't block due to email failure
      localStorage.setItem('catastro_access', JSON.stringify({
        name,
        email,
        company,
        timestamp: new Date().toISOString(),
      }));
      onAccessGranted({ name, email, company });
    } finally {
      setLoading(false);
    }
  };

  async function sendEmail({ name, email, company }) {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: {
          from_name: name,
          from_email: email,
          company: company || 'No especificada',
          to_email: EMAILJS_CONFIG.toEmail,
          message: `Nuevo acceso al Visor de Catastro Minero.\n\nNombre: ${name}\nEmail: ${email}\nEmpresa: ${company || 'No especificada'}\nFecha: ${new Date().toLocaleString('es-CL')}`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('EmailJS error');
    }
  }

  return (
    <div className="login-gate">
      {/* Background image overlay */}
      <div className="login-bg" />

      {/* Content */}
      <div className="login-content">
        {/* Logos */}
        <div className="login-logos">
          <div className="login-logo-item">
            <img
              src="/logo-tecknologia.png"
              alt="TECKNOLOGIA"
              className="login-logo-tecknologia"
            />
          </div>
          <div className="login-logo-divider" />
          <div className="login-logo-item">
            <img
              src="/logo-geologgia.png"
              alt="Geologgia Ltda."
              className="login-logo-geologgia"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="login-title">
          Catastro Minero
          <span className="login-title-gold"> de Chile</span>
        </h1>
        <p className="login-subtitle">
          Visor profesional de concesiones, manifestaciones, mensuras y pedimentos
        </p>

        {/* Stats */}
        <div className="login-stats">
          <div className="login-stat">
            <span className="login-stat-number">195.072</span>
            <span className="login-stat-label">Registros</span>
          </div>
          <div className="login-stat">
            <span className="login-stat-number">4</span>
            <span className="login-stat-label">Capas de datos</span>
          </div>
          <div className="login-stat">
            <span className="login-stat-number">2026</span>
            <span className="login-stat-label">Actualizado</span>
          </div>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-label">Nombre completo *</label>
            <input
              className="login-input"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="login-form-group">
            <label className="login-label">Email *</label>
            <input
              className="login-input"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label className="login-label">Empresa</label>
            <input
              className="login-input"
              type="text"
              placeholder="Nombre de tu empresa (opcional)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            className="login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Ingresando...
              </>
            ) : (
              'Acceder al visor'
            )}
          </button>
        </form>

        {/* Footer credits */}
        <div className="login-footer">
          <span>Desarrollado por <strong>TECKNOLOGIA</strong></span>
          <span className="login-footer-dot">·</span>
          <span>Datos: <strong>SERNAGEOMIN</strong> · Boletín Abril 2026</span>
        </div>
      </div>
    </div>
  );
}
