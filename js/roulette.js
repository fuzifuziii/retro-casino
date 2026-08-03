// DVD roulette
import { dom, ctx } from './dom.js';
import { state, spendBalance, addBalance } from './state.js';
import { t } from './i18n.js';
import { playSound } from './audio.js';
import { createCoinExplosion } from './effects.js';
import { updateBalanceDisplay, checkBankruptStatus } from './ui.js';
import { renderShop } from './shop.js';

const SPIN_COST = 100;
const DVD_SPEED = 1000;

// Winning zone on 450x300 canvas
const WIN_ZONE = { xMin: 100, xMax: 350, yMin: 75, yMax: 225 };
const SNIPER_ZONE = { centerX: 225, centerY: 150, toleranceX: 30, toleranceY: 20 };
const PRIZE_GOOD = 120;
const PRIZE_SNIPER = 200;

let lastTime = 0;
let animationFrameId = null;

const dvd = {
    x: 50,
    y: 50,
    width: 110,
    height: 40,
    dirX: 1,
    dirY: 1,
    colors: ['#ff007f', '#00ffcc', '#ffff00', '#ff0055', '#38bdf8', '#a7f3d0'],
    currentColorIndex: 0,
};

/** Draws current frame: background, dashed winning zone, logo itself. */
export function drawDvdStatic() {
    if (!ctx || !dom.canvas) return;
    ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, dom.canvas.width, dom.canvas.height);

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(WIN_ZONE.xMin, WIN_ZONE.yMin, WIN_ZONE.xMax - WIN_ZONE.xMin, WIN_ZONE.yMax - WIN_ZONE.yMin);

    ctx.fillStyle = 'rgba(0, 255, 204, 0.4)';
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t().jackpotZone || 'JACKPOT ZONE', 225, 150);
    ctx.restore();

    ctx.fillStyle = dvd.colors[dvd.currentColorIndex];
    ctx.fillRect(dvd.x, dvd.y, dvd.width, dvd.height);

    ctx.fillStyle = '#000';
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t().rouletteCanvasText, dvd.x + dvd.width / 2, dvd.y + dvd.height / 2);
}

function updateDvdPhysics(dt) {
    if (!dom.canvas) return;
    dvd.x += dvd.dirX * DVD_SPEED * dt;
    dvd.y += dvd.dirY * DVD_SPEED * dt;

    let hitWall = false;

    if (dvd.x <= 0) {
        dvd.x = 0;
        dvd.dirX = 1;
        hitWall = true;
    } else if (dvd.x + dvd.width >= dom.canvas.width) {
        dvd.x = dom.canvas.width - dvd.width;
        dvd.dirX = -1;
        hitWall = true;
    }

    if (dvd.y <= 0) {
        dvd.y = 0;
        dvd.dirY = 1;
        hitWall = true;
    } else if (dvd.y + dvd.height >= dom.canvas.height) {
        dvd.y = dom.canvas.height - dvd.height;
        dvd.dirY = -1;
        hitWall = true;
    }

    if (hitWall) {
        dvd.currentColorIndex = (dvd.currentColorIndex + 1) % dvd.colors.length;
        playSound('click');
    }
}

function rouletteLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    lastTime = timestamp;

    updateDvdPhysics(dt);
    drawDvdStatic();

    if (state.rouletteActive) {
        animationFrameId = requestAnimationFrame(rouletteLoop);
    }
}

function setRouletteMessage(text, color) {
    if (!dom.rouletteMsg) return;
    dom.rouletteMsg.textContent = text;
    dom.rouletteMsg.style.color = color;
}

function startRouletteGame() {
    if (state.balance < SPIN_COST) {
        checkBankruptStatus();
        return;
    }
    spendBalance(SPIN_COST);
    updateBalanceDisplay();

    state.rouletteActive = true;
    lastTime = 0;

    const lang = t();
    if (dom.rouletteBtn) {
        dom.rouletteBtn.textContent = lang.rouletteBtnActive;
        dom.rouletteBtn.style.backgroundColor = '#ff0055';
    }
    setRouletteMessage(lang.rouletteMsgActive, '#fff');

    dvd.dirX = Math.random() > 0.5 ? 1 : -1;
    dvd.dirY = Math.random() > 0.5 ? 1 : -1;

    animationFrameId = requestAnimationFrame(rouletteLoop);
}

function isInsideZone(x, y, zone) {
    return x >= zone.xMin && x <= zone.xMax && y >= zone.yMin && y <= zone.yMax;
}

function isSniperHit(x, y) {
    return Math.abs(x - SNIPER_ZONE.centerX) < SNIPER_ZONE.toleranceX
        && Math.abs(y - SNIPER_ZONE.centerY) < SNIPER_ZONE.toleranceY;
}

export function stopRouletteGame(shouldCalculateReward) {
    const lang = t();
    state.rouletteActive = false;
    cancelAnimationFrame(animationFrameId);

    if (dom.rouletteBtn) {
        dom.rouletteBtn.textContent = lang.startRoulette;
        dom.rouletteBtn.style.backgroundColor = '#3b2363';
    }
    if (!shouldCalculateReward) return;

    const logoCenterX = dvd.x + dvd.width / 2;
    const logoCenterY = dvd.y + dvd.height / 2;

    if (isInsideZone(logoCenterX, logoCenterY, WIN_ZONE)) {
        const isSniper = isSniperHit(logoCenterX, logoCenterY);
        const prize = isSniper ? PRIZE_SNIPER : PRIZE_GOOD;

        addBalance(prize);
        if (isSniper) {
            setRouletteMessage(lang.rouletteSniper(prize), '#00ffcc');
        } else {
            setRouletteMessage(lang.rouletteGood(prize), '#ffff00');
        }
        playSound('win');
        createCoinExplosion();
    } else {
        setRouletteMessage(lang.rouletteMiss, '#ff0055');
        playSound('lose');
    }

    updateBalanceDisplay();
    renderShop();
    checkBankruptStatus();
}

/** Binds listener to the roulette start/stop button */
export function setupRouletteControls() {
    if (!dom.rouletteBtn) return;
    dom.rouletteBtn.addEventListener('click', () => {
        if (!state.rouletteActive) {
            startRouletteGame();
        } else {
            stopRouletteGame(true);
        }
    });
}
