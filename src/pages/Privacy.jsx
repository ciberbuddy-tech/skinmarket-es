import React from 'react';

const Privacy = () => {
    return (
        <div style={{ padding: '80px 20px', maxWidth: '800px', margin: '0 auto', color: 'white', fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
            <h1 style={{ color: 'var(--primary-color, #ff4d4d)', marginBottom: '30px' }}>Política de Privacidad</h1>
            <p><strong>Última actualización: 26 de febrero de 2026</strong></p>

            <section style={{ marginBottom: '30px' }}>
                <h2>1. Información que Recopilamos</h2>
                <p>Recopilamos información básica para mejorar su experiencia en SkinMarket ES, incluyendo datos de inicio de sesión a través de Steam, historial de transacciones en el sitio y preferencias de usuario.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2>2. Uso de la Información</h2>
                <p>Sus datos se utilizan exclusivamente para:</p>
                <ul>
                    <li>Gestionar su cuenta y transacciones de skins.</li>
                    <li>Personalizar su experiencia en nuestra plataforma.</li>
                    <li>Mejorar nuestros servicios y seguridad.</li>
                    <li>Cumplir con las normativas legales de Google AdSense.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2>3. Cookies y Publicidad</h2>
                <p>Utilizamos cookies para analizar el tráfico y personalizar los anuncios a través de Google AdSense. Los proveedores de terceros, incluido Google, utilizan cookies para mostrar anuncios basados en las visitas anteriores de un usuario a su sitio web o a otros sitios web.</p>
                <p>Puede inhabilitar la publicidad personalizada visitando <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#4da6ff' }}>Configuración de anuncios</a>.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2>4. Seguridad</h2>
                <p>Implementamos medidas de seguridad técnicas para proteger su información personal. No compartimos sus datos con terceros sin su consentimiento, excepto por requerimientos legales.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2>5. Contacto</h2>
                <p>Si tiene preguntas sobre esta política, puede contactarnos a través de nuestro soporte técnico.</p>
            </section>
        </div>
    );
};

export default Privacy;
