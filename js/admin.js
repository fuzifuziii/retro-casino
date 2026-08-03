// Enter promo codes, unlock/populate secret admin panel, and full progress reset.
import { dom } from './dom.js';
import { state, unlockAdminSession, persistSkins, addBalance, resetProgress } from './state.js';
import { i18nData, t } from './i18n.js';
import { playSound } from './audio.js';
import { updateBalanceDisplay, checkBankruptStatus } from './ui.js';
import { applySkin, renderShop } from './shop.js';
import { setupTabNavigation, goToFirstTab } from './navigation.js';

const PROMO_CODES = {
    diov: unlockVoidSkin,
    admin: unlockAdminPanel,
};

function showPromoResult(text, isError) {
    if (!dom.promoMsg) return;
    dom.promoMsg.classList.remove('status-error', 'status-success');
    void dom.promoMsg.offsetWidth;
    dom.promoMsg.textContent = text;
    dom.promoMsg.classList.add(isError ? 'status-error' : 'status-success');
    playSound(isError ? 'lose' : 'win');
}

function unlockVoidSkin() {
    const lang = t();
    if (state.purchasedSkins.includes('void')) {
        showPromoResult(lang.voidAlreadyUnlocked, true);
        return;
    }
    state.purchasedSkins.push('void');
    persistSkins();
    showPromoResult(lang.voidUnlocked, false);
    renderShop();
}

function unlockAdminPanel() {
    const lang = t();
    if (state.isAdminActivated) {
        showPromoResult(lang.adminAlreadyActivated, true);
        return;
    }
    unlockAdminSession();
    buildAdminButton();
    showPromoResult(lang.adminActivated, false);
}

/** Handler for the activate button on the promo codes tab. */
export function submitPromoCode() {
    if (!dom.promoInput || !dom.promoMsg) return;

    const code = dom.promoInput.value.trim().toLowerCase();
    const lang = t();

    if (code === '') {
        showPromoResult(lang.emptyCode, true);
        return;
    }

    const handler = PROMO_CODES[code];
    if (!handler) {
        showPromoResult(lang.invalidCode, true);
        return;
    }

    handler();
    dom.promoInput.value = '';
}

/** Adds the adminn menu item to the sidebar if it's not already there. */
export function buildAdminButton() {
    if (document.querySelector('.admin-nav-btn')) return;

    const adminBtn = document.createElement('button');
    adminBtn.className = 'nav-btn admin-nav-btn';
    adminBtn.setAttribute('data-tab', 'tab-admin');
    adminBtn.setAttribute('data-i18n', 'navAdmin');
    adminBtn.textContent = i18nData[state.currentLang].navAdmin;

    if (dom.sidebarMenu) dom.sidebarMenu.appendChild(adminBtn);

    setupTabNavigation();
}

/** +/- tokens from admin panel. */
export function adminGiveMoney(amount) {
    addBalance(amount);
    updateBalanceDisplay();
    renderShop();
    checkBankruptStatus();
    playSound('win');
}

function removeAdminButton() {
    const adminBtn = document.querySelector('.admin-nav-btn');
    if (adminBtn) adminBtn.remove();
}

function fullReset(resultMessage) {
    resetProgress();
    removeAdminButton();
    updateBalanceDisplay();
    applySkin();
    renderShop();
    checkBankruptStatus();
    setupTabNavigation();

    if (resultMessage && dom.msg) {
        dom.msg.textContent = resultMessage;
        dom.msg.style.color = '#ff007f';
    }
    playSound('win');
}

/** Full reset from the secret admin panel: redirects to the home tab. */
export function adminResetStorage() {
    fullReset(null);
    goToFirstTab();
}

/** Full reset from the game over screen. */
export function resetGameFromGameOver() {
    fullReset(t().tryAgainNextTime);
}
