import { dom } from './dom.js';
import { state, loadState } from './state.js';
import { switchLanguage } from './i18n.js';
import { updateBalanceDisplay, checkBankruptStatus } from './ui.js';
import { renderShop, setupShopListeners, applySkin } from './shop.js';
import { setupLeverControls } from './slots.js';
import { drawDvdStatic, stopRouletteGame, setupRouletteControls } from './roulette.js';
import { setupTabNavigation, toggleMobileSidebar } from './navigation.js';
import {
    submitPromoCode,
    buildAdminButton,
    adminGiveMoney,
    adminResetStorage,
    resetGameFromGameOver,
} from './admin.js';

/** Reaction to tab switching: "Slots"/"Roulette" tabs have side effects. */
function handleTabChange(targetTabId) {
    if (targetTabId === 'tab-shop') {
        renderShop();
    }

    if (targetTabId === 'tab-roulette') {
        drawDvdStatic();
    } else if (state.rouletteActive) {
        stopRouletteGame(false);
    }
}

/** Full UI translation + re-rendering dynamic screens. */
function applyLanguage(lang) {
    switchLanguage(lang);
    renderShop();
    if (!state.rouletteActive) {
        drawDvdStatic();
    }
}

function setupLanguageSwitcher() {
    document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
        btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
    });
}

function setupGlobalActions() {
    document.querySelectorAll('[data-action="toggle-sidebar"]').forEach(el => {
        el.addEventListener('click', toggleMobileSidebar);
    });

    document.querySelectorAll('[data-action="reset-game-over"]').forEach(el => {
        el.addEventListener('click', resetGameFromGameOver);
    });

    const promoSubmitBtn = document.getElementById('promo-submit-btn');
    if (promoSubmitBtn) promoSubmitBtn.addEventListener('click', submitPromoCode);

    document.querySelectorAll('[data-action="admin-give"]').forEach(btn => {
        const amount = parseInt(btn.getAttribute('data-amount'), 10);
        btn.addEventListener('click', () => adminGiveMoney(amount));
    });

    document.querySelectorAll('[data-action="admin-reset"]').forEach(btn => {
        btn.addEventListener('click', adminResetStorage);
    });
}

function init() {
    loadState();

    if (state.isAdminActivated) {
        buildAdminButton();
    }

    switchLanguage(state.currentLang);
    setupTabNavigation(handleTabChange);
    setupShopListeners();
    setupLeverControls();
    setupRouletteControls();
    setupLanguageSwitcher();
    setupGlobalActions();

    updateBalanceDisplay();
    applySkin();
    renderShop();
    drawDvdStatic();
    checkBankruptStatus();
}

init();
