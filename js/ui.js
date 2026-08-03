// Cross-module interface operations: balance and bankruptcy screen.
import { dom } from './dom.js';
import { state } from './state.js';
import { playSound } from './audio.js';

/** Synchronizes all .sync-balance elements (mobile header + sidebar) with state.balance. */
export function updateBalanceDisplay() {
    dom.syncBalanceElements.forEach(el => {
        el.textContent = state.balance;
    });
}

export function checkBankruptStatus() {
    if (!dom.gameOverScreen) return;

    const isBankrupt = state.balance < 100 && !state.isSpinning && !state.rouletteActive;
    if (isBankrupt) {
        dom.gameOverScreen.classList.add('active-screen');
        playSound('gameover');
    } else {
        dom.gameOverScreen.classList.remove('active-screen');
    }
}
