import React from 'react';

const About = () => {
    return (
        <div style={{ padding: '80px 20px', maxWidth: '800px', margin: '0 auto', color: 'white', fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
            <h1 style={{ color: 'var(--primary-color, #ff4d4d)', marginBottom: '30px' }}>Sobre Nosotros</h1>

            <section style={{ marginBottom: '30px' }}>
                <h2>Nuestra Misión</h2>
                <p>En SkinMarket ES, nos dedicamos a proporcionar la plataforma más segura y emocionante para los entusiastas de CS2 en España. Nuestra misión es ofrecer una experiencia de usuario premium, transparente y justa para la apertura de cajas y el intercambio de skins.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2>¿Quiénes Somos?</h2>
                <p>Somos un equipo de apasionados por Counter-Strike que entendemos el valor y la emoción de coleccionar skins exclusivas. Hemos construido esta plataforma con tecnologías de última generación para garantizar la rapidez en las transacciones y la seguridad de tus activos digitales.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2>¿Por Qué Elegirnos?</h2>
                <ul>
                    <li><strong>Transparencia:</strong> Todos nuestros algoritmos de apertura son auditables.</li>
                    <li><strong>Soporte en Español:</strong> Atención personalizada para nuestra comunidad local.</li>
                    <li><strong>Rapidez:</strong> Retiros de skins ultra-rápidos a través de la API de Steam.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2>Contacto</h2>
                <p>Si tienes cualquier duda, sugerencia o problema, puedes contactarnos a través de nuestras redes sociales o nuestro sistema de soporte integrado.</p>
            </section>
        </div>
    );
};

export default About;
