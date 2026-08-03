// Slot machine lever controls (drag) and reel spin logic.
import { dom } from './dom.js';
import { state, spendBalance, addBalance, hasSecretPromoBeenFound, markSecretPromoFound } from './state.js';
import { t } from './i18n.js';
import { playSound } from './audio.js';
import { createCoinExplosion } from './effects.js';
import { updateBalanceDisplay, checkBankruptStatus } from './ui.js';
import { renderShop } from './shop.js';

const SYMBOLS = ['💎', '🍒', '🪙', '💀', '🍀'];
const SPIN_COST = 100;
const SPIN_DURATION_MS = 1500;
const MAX_PULL = 100;
const SECRET_PROMO_CHANCE = 0.1;

let isDragging = false;
let startY = 0;

function handleDragStart(clientY) {
    if (state.isSpinning) return;
    if (state.balance < SPIN_COST) {
        checkBankruptStatus();
        return;
    }
    isDragging = true;
    startY = clientY;
    if (dom.shaft) dom.shaft.classList.remove('lever-returning');
    playSound('click');
}

function handleDragMove(clientY) {
    if (!isDragging || !dom.shaft) return;

    let deltaY = clientY - startY;
    deltaY = Math.min(Math.max(deltaY, 0), MAX_PULL);

    const scaleY = 1 - (deltaY / MAX_PULL) * 0.75;
    dom.shaft.style.transform = `scaleY(${scaleY})`;

    if (deltaY >= MAX_PULL * 0.9) {
        triggerSpin();
    }
}

function resetLever() {
    isDragging = false;
    if (dom.shaft) {
        dom.shaft.classList.add('lever-returning');
        dom.shaft.style.transform = 'scaleY(1)';
    }
}

function setMessage(text, color) {
    if (!dom.msg) return;
    dom.msg.textContent = text;
    dom.msg.style.color = color;
}

/** Determines spin outcome by three landed symbols and updates balance/message. */
function resolveSpinResult(results) {
    const lang = t();
    const skullCount = results.filter(symbol => symbol === '💀').length;

    if (skullCount > 0) {
        const fine = skullCount * 50;
        state.balance = Math.max(0, state.balance - fine);
        setMessage(lang.skullFine(skullCount, fine), '#ff0000');
        playSound('lose');
        return;
    }

    const isTripleMatch = results[0] === results[1] && results[1] === results[2];
    const isPairMatch = results[0] === results[1] || results[1] === results[2] || results[0] === results[2];

    if (isTripleMatch) {
        if (!hasSecretPromoBeenFound() && Math.random() < SECRET_PROMO_CHANCE) {
            markSecretPromoFound();
            setMessage(lang.secretPromoFound, '#ffff00');
        } else {
            const winAmount = results[0] === '💎' ? 1000 : 500;
            addBalance(winAmount);
            setMessage(lang.jackpot(winAmount), '#00ffcc');
        }
        playSound('jack');
        createCoinExplosion();
    } else if (isPairMatch) {
        addBalance(200);
        setMessage(lang.win, '#ffcc00');
        playSound('win');
        createCoinExplosion();
    } else {
        setMessage(lang.loseSlot, '#ff007f');
        playSound('lose');
    }
}

function triggerSpin() {
    isDragging = false;
    state.isSpinning = true;
    resetLever();

    spendBalance(SPIN_COST);
    updateBalanceDisplay();
    setMessage(t().spinning, '#ffffff');

    dom.reels.forEach(reel => reel && reel.classList.add('spinning'));

    setTimeout(() => {
        const results = dom.reels.map(reel => {
            if (!reel) return null;
            reel.classList.remove('spinning');
            const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            reel.textContent = randomSymbol;
            return randomSymbol;
        });

        resolveSpinResult(results);

        updateBalanceDisplay();
        renderShop();
        state.isSpinning = false;
        checkBankruptStatus();
    }, SPIN_DURATION_MS);
}

/** Binds all mouse/touch listeners to slot machine lever. */
export function setupLeverControls() {
    if (dom.knob) {
        dom.knob.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleDragStart(e.clientY);
        });
        dom.knob.addEventListener('touchstart', (e) => {
            handleDragStart(e.touches[0].clientY);
        }, { passive: true });
    }

    window.addEventListener('mousemove', (e) => handleDragMove(e.clientY));
    window.addEventListener('mouseup', () => { if (isDragging) resetLever(); });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        handleDragMove(e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchend', () => { if (isDragging) resetLever(); });
}
