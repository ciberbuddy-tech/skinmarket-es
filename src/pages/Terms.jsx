import React from 'react';

const Terms = () => {
    return (
        <div style={{ padding: '80px 20px', maxWidth: '800px', margin: '0 auto', color: 'white', fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
            <h1 style={{ color: 'var(--primary-color, #ff4d4d)', marginBottom: '30px' }}>Términos de Servicio</h1>
            <p><strong>Última actualización: 26 de febrero de 2026</strong></p>

            <section style={{ marginBottom: '30px' }}>
                <h2>1. Aceptación de los Términos</h2>
                <p>Al acceder y utilizar SkinMarket ES, usted acepta cumplir con estos términos de servicio y todas las leyes aplicables.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2>2. Uso del Sitio</h2>
                <p>Usted debe tener al menos 18 años para utilizar este sitio. SkinMarket ES ofrece servicios de apertura de cajas y mejora de skins de CS2 con fines de entretenimiento.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2>3. Transacciones y Valor</h2>
                <p>Las skins en SkinMarket ES se basan en valores de mercado. No garantizamos beneficios económicos ni el valor futuro de los artículos obtenidos.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2>4. Prohibiciones</h2>
                <p>Queda prohibido el uso de scripts, bots o cualquier método automatizado para interactuar con el sitio sin autorización previa.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2>5. Limitación de Responsabilidad</h2>
                <p>SkinMarket ES no se hace responsable de las pérdidas resultantes del uso del sitio o de problemas técnicos relacionados con la API de Steam.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2>6. Modificaciones</h2>
                <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado del sitio implica la aceptación de los nuevos términos.</p>
            </section>
        </div>
    );
};

export default Terms;
