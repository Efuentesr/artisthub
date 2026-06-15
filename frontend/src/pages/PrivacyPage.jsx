export default function PrivacyPage() {
  return (
    <div style={{ background: '#0f0f13', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7, color: '#e2e2e8' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Política de Privacidad</h1>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2.5rem' }}>ArtistHub · Última actualización: 15 de junio de 2026</p>

        <p style={{ color: '#b0b0be', marginBottom: '0.75rem' }}>Esta Política de Privacidad describe cómo ArtistHub recopila, usa y protege la información de los usuarios.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: '2rem 0 0.75rem' }}>1. Información que recopilamos</h2>
        <ul style={{ color: '#b0b0be', paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
          <li>Nombre y correo electrónico de registro.</li>
          <li>Handles de tus cuentas de Instagram, TikTok y/o Facebook.</li>
          <li>Tokens de acceso OAuth de Meta (almacenados de forma segura).</li>
          <li>Mensajes directos y comentarios de tus cuentas sociales (con tu autorización).</li>
          <li>Notas personales que crees dentro de la aplicación.</li>
        </ul>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: '2rem 0 0.75rem' }}>2. Cómo usamos tu información</h2>
        <ul style={{ color: '#b0b0be', paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
          <li>Mostrar y organizar tus interacciones en un inbox unificado.</li>
          <li>Sincronizar DMs y comentarios de Instagram vía API oficial de Meta.</li>
          <li>Enviarte notificaciones de cuenta (verificación, alertas de seguridad).</li>
        </ul>
        <p style={{ color: '#b0b0be', marginBottom: '0.75rem' }}>No usamos tu información para publicidad, ni la vendemos o compartimos con terceros.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: '2rem 0 0.75rem' }}>3. Datos de Instagram y Facebook (Meta)</h2>
        <p style={{ color: '#b0b0be', marginBottom: '0.75rem' }}>ArtistHub utiliza las APIs oficiales de Meta para acceder a:</p>
        <ul style={{ color: '#b0b0be', paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
          <li><strong>Mensajes directos (DMs)</strong> — permiso: <code>instagram_business_manage_messages</code></li>
          <li><strong>Comentarios</strong> — permiso: <code>instagram_business_manage_comments</code></li>
          <li><strong>Información básica de cuenta</strong> — permiso: <code>instagram_business_basic</code></li>
          <li><strong>Páginas de Facebook</strong> — permisos: <code>pages_show_list</code>, <code>pages_read_engagement</code></li>
        </ul>
        <p style={{ color: '#b0b0be', marginBottom: '0.75rem' }}>Puedes revocar el acceso en cualquier momento desde tu configuración de Instagram o Facebook.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: '2rem 0 0.75rem' }}>4. Seguridad</h2>
        <ul style={{ color: '#b0b0be', paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
          <li>Comunicaciones cifradas mediante HTTPS/TLS.</li>
          <li>Contraseñas almacenadas con hash seguro.</li>
          <li>Tokens de acceso almacenados de forma cifrada.</li>
        </ul>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: '2rem 0 0.75rem' }}>5. Retención de datos</h2>
        <p style={{ color: '#b0b0be', marginBottom: '0.75rem' }}>Conservamos tu información mientras tengas una cuenta activa. Puedes solicitar la eliminación escribiendo a <a href="mailto:fuentesrivera.edmundo@gmail.com" style={{ color: '#a78bfa' }}>fuentesrivera.edmundo@gmail.com</a>.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: '2rem 0 0.75rem' }}>6. Tus derechos</h2>
        <ul style={{ color: '#b0b0be', paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
          <li>Acceder a los datos que tenemos sobre ti.</li>
          <li>Corregir información incorrecta.</li>
          <li>Solicitar la eliminación de tus datos.</li>
          <li>Revocar el acceso a tus redes sociales en cualquier momento.</li>
        </ul>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: '2rem 0 0.75rem' }}>7. Contacto</h2>
        <p style={{ color: '#b0b0be', marginBottom: '0.75rem' }}>Email: <a href="mailto:fuentesrivera.edmundo@gmail.com" style={{ color: '#a78bfa' }}>fuentesrivera.edmundo@gmail.com</a></p>

        <hr style={{ border: 'none', borderTop: '1px solid #ffffff12', margin: '2rem 0' }} />
        <p style={{ color: '#555', fontSize: '0.8rem', marginTop: '3rem' }}>© 2026 ArtistHub. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}