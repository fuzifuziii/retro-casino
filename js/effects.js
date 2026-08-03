// effects.js
// Purely visual effects not tied to game state.

const COIN_COUNT = 25;
const GRAVITY = 0.35;
const FADE_STEP = 0.025;
const FRAME_MS = 20;

/** Flying pixel coins bursting from the center of the screen (win effect). */
export function createCoinExplosion() {
    const container = document.body;
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    for (let i = 0; i < COIN_COUNT; i++) {
        const coin = document.createElement('div');
        coin.className = 'pixel-coin';
        coin.style.left = `${startX}px`;
        coin.style.top = `${startY}px`;
        container.appendChild(coin);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 6 + 4;
        let velX = Math.cos(angle) * velocity;
        let velY = Math.sin(angle) * velocity - 4;
        let posX = startX;
        let posY = startY;
        let opacity = 1;

        const intervalId = setInterval(() => {
            velY += GRAVITY;
            posX += velX;
            posY += velY;
            opacity -= FADE_STEP;

            coin.style.left = `${posX}px`;
            coin.style.top = `${posY}px`;
            coin.style.opacity = opacity;

            if (opacity <= 0 || posY > window.innerHeight) {
                clearInterval(intervalId);
                coin.remove();
            }
        }, FRAME_MS);
    }
}