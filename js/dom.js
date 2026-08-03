export const dom = {
    navButtons: document.querySelectorAll('.nav-btn'),
    tabSections: document.querySelectorAll('.tab-section'),
    syncBalanceElements: document.querySelectorAll('.sync-balance'),
    gameOverScreen: document.getElementById('game-over-screen'),
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    sidebarMenu: document.getElementById('sidebar-menu'),

    machineBody: document.getElementById('machine-body'),
    msg: document.getElementById('msg'),
    reels: [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3'),
    ],
    knob: document.getElementById('lever-knob'),
    shaft: document.getElementById('lever-shaft'),

    canvas: document.getElementById('roulette-canvas'),
    rouletteBtn: document.getElementById('roulette-btn'),
    rouletteMsg: document.getElementById('roulette-msg'),

    promoInput: document.getElementById('promo-input'),
    promoMsg: document.getElementById('promo-msg'),
};

export const ctx = dom.canvas ? dom.canvas.getContext('2d') : null;

/** Re-queries nav-btns because the admin button is added dynamically to the DOM. */
export function refreshNavButtons() {
    dom.navButtons = document.querySelectorAll('.nav-btn');
    return dom.navButtons;
}
