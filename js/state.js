const STORAGE_KEYS = {
    lang: 'lang',
    balance: 'slotBalance',
    skin: 'currentSkin',
    purchasedSkins: 'purchasedSkins',
    adminUnlocked: 'adminPanelUnlocked',
    secretPromoFound: 'promo_diov_found',
};

const DEFAULTS = Object.freeze({
    balance: 1000,
    lang: 'ru',
    skin: 'default',
    purchasedSkins: ['default'],
});

export const state = {
    balance: DEFAULTS.balance,
    currentLang: DEFAULTS.lang,
    currentSkin: DEFAULTS.skin,
    purchasedSkins: [...DEFAULTS.purchasedSkins],
    isSpinning: false,
    isAdminActivated: false,
    rouletteActive: false,
};

/** Reads saved state from storage into state. Called once at startup. */
export function loadState() {
    state.currentLang = localStorage.getItem(STORAGE_KEYS.lang) || DEFAULTS.lang;
    state.currentSkin = localStorage.getItem(STORAGE_KEYS.skin) || DEFAULTS.skin;

    const storedSkins = localStorage.getItem(STORAGE_KEYS.purchasedSkins);
    state.purchasedSkins = storedSkins ? JSON.parse(storedSkins) : [...DEFAULTS.purchasedSkins];

    const storedBalance = localStorage.getItem(STORAGE_KEYS.balance);
    state.balance = storedBalance !== null ? parseInt(storedBalance, 10) : DEFAULTS.balance;

    state.isAdminActivated = sessionStorage.getItem(STORAGE_KEYS.adminUnlocked) === 'true';
}

export function persistBalance() {
    localStorage.setItem(STORAGE_KEYS.balance, String(state.balance));
}

export function persistLang() {
    localStorage.setItem(STORAGE_KEYS.lang, state.currentLang);
}

export function persistSkins() {
    localStorage.setItem(STORAGE_KEYS.skin, state.currentSkin);
    localStorage.setItem(STORAGE_KEYS.purchasedSkins, JSON.stringify(state.purchasedSkins));
}

export function unlockAdminSession() {
    state.isAdminActivated = true;
    sessionStorage.setItem(STORAGE_KEYS.adminUnlocked, 'true');
}

export function hasSecretPromoBeenFound() {
    return localStorage.getItem(STORAGE_KEYS.secretPromoFound) === 'true';
}

export function markSecretPromoFound() {
    localStorage.setItem(STORAGE_KEYS.secretPromoFound, 'true');
}

export function addBalance(amount) {
    state.balance = Math.max(0, state.balance + amount);
    persistBalance();
}

export function spendBalance(amount) {
    state.balance = Math.max(0, state.balance - amount);
    persistBalance();
}

/** Full progress reset (used both on game-over and in the admin panel). */
export function resetProgress() {
    localStorage.clear();
    sessionStorage.clear();
    state.balance = DEFAULTS.balance;
    state.currentSkin = DEFAULTS.skin;
    state.purchasedSkins = [...DEFAULTS.purchasedSkins];
    state.isAdminActivated = false;
}
