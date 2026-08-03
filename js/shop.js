// Render shop cards, purchase/equip skins, apply theme to slot machine.
import { dom } from './dom.js';
import { state, spendBalance, persistSkins } from './state.js';
import { t } from './i18n.js';
import { playSound } from './audio.js';
import { updateBalanceDisplay } from './ui.js';

const SKIN_THEME_CLASSES = ['theme-neon', 'theme-gold', 'theme-blue', 'theme-grey', 'theme-green', 'theme-wave', 'theme-void'];

/** Re-renders all shop cards based on current language/balance/purchased skins. */
export function renderShop() {
    const lang = t();
    document.querySelectorAll('.shop-btn').forEach(btn => {
        const skinName = btn.id.replace('btn-skin-', '');
        const card = document.getElementById(`card-${skinName}`);
        if (!card) return;

        card.classList.remove('current');

        if (skinName === 'void' && !state.purchasedSkins.includes('void')) {
            btn.textContent = lang.codeOnly;
            btn.className = 'shop-btn';
            btn.disabled = true;
            return;
        }

        if (state.currentSkin === skinName) {
            card.classList.add('current');
            btn.textContent = lang.equipped;
            btn.className = 'shop-btn equipped';
            btn.disabled = true;
        } else if (state.purchasedSkins.includes(skinName)) {
            btn.textContent = lang.equip;
            btn.className = 'shop-btn';
            btn.disabled = false;
        } else {
            const price = parseInt(btn.getAttribute('data-price'), 10);
            btn.textContent = `${lang.buyFor}${price}`;
            btn.className = 'shop-btn btn-buy';
            btn.disabled = state.balance < price;
        }
    });
}

/** Binds buy/equip event listeners to shop cards (called once). */
export function setupShopListeners() {
    document.querySelectorAll('.shop-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const skinName = btn.id.replace('btn-skin-', '');

            if (state.purchasedSkins.includes(skinName)) {
                state.currentSkin = skinName;
                playSound('click');
            } else {
                const price = parseInt(btn.getAttribute('data-price'), 10);
                if (state.balance >= price) {
                    spendBalance(price);
                    state.purchasedSkins.push(skinName);
                    state.currentSkin = skinName;
                    playSound('win');
                }
            }

            persistSkins();
            updateBalanceDisplay();
            applySkin();
            renderShop();
        });
    });
}

/** Applies CSS class of current skin to the slot machine. */
export function applySkin() {
    if (!dom.machineBody) return;
    dom.machineBody.classList.remove(...SKIN_THEME_CLASSES);
    if (state.currentSkin !== 'default') {
        dom.machineBody.classList.add(`theme-${state.currentSkin}`);
    }
}
