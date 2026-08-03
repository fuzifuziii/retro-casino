const COIN_COUNT = 24;
const COIN_LIFETIME = 900;

export function createCoinExplosion() {
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight / 2;

    for (let i = 0; i < COIN_COUNT; i++) {
        const coin = document.createElement('div');
        coin.className = 'pixel-coin';
        coin.style.left = `${originX}px`;
        coin.style.top = `${originY}px`;
        document.body.appendChild(coin);

        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 220;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance - 60;
        const rotation = (Math.random() - 0.5) * 720;

        const animation = coin.animate(
            [
                { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 },
                {
                    transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rotation}deg)`,
                    opacity: 0,
                },
            ],
            {
                duration: COIN_LIFETIME + Math.random() * 300,
                easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)',
            }
        );

        animation.onfinish = () => coin.remove();
    }
}
