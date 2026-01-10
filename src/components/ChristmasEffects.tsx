import React, { useEffect } from 'react';
import './ChristmasEffects.css';

export const ChristmasEffects: React.FC = () => {
    useEffect(() => {
        // Create snowflakes
        const snowContainer = document.querySelector('.christmas-snow');
        if (!snowContainer) return;

        const createSnowflake = () => {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.innerHTML = '❄';
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.animationDuration = Math.random() * 3 + 5 + 's';
            snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
            snowflake.style.animationName = Math.random() > 0.5 ? 'snowfall' : 'snowfall-reverse';

            snowContainer.appendChild(snowflake);

            // Remove snowflake after animation
            setTimeout(() => {
                snowflake.remove();
            }, 8000);
        };

        // Create snowflakes periodically
        const interval = setInterval(createSnowflake, 200);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Snowfall Container */}
            <div className="christmas-snow"></div>

            {/* Christmas Message Banner */}
            <div className="christmas-message">
                ✨ Feliz Ano Novo! Que 2026 traga muito bem-estar e paz para todos 🥂✨
            </div>
        </>
    );
};

export default ChristmasEffects;
