// Translation dictionaries and applying translation to DOM.
import { state, persistLang } from './state.js';

export const i18nData = {
    ru: {
        defeat: "ПОРАЖЕНИЕ",
        bankruptMsg: "ВЫ ОБАНКРОТИЛИСЬ И ПОТЕРЯЛИ ВСЕ!",
        reset: "СБРОС",
        retroCasino: "РЕТРО КАЗИНО",
        tokens: "ТОКЕНЫ",
        navHome: "🏠 ГЛАВНАЯ",
        navSlots: "🎰 СЛОТЫ",
        navRoulette: "🎯 РУЛЕТКА",
        navShop: "🛒 МАГАЗИН",
        navPromo: "🎫 ПРОМОКОДЫ",
        navAdmin: "⚙️ АДМИНКА",
        welcome: "ДОБРО ПОЖАЛОВАТЬ В РЕТРО КАЗИНО!",
        welcomeSub: "ВЫБЕРИ ИГРУ НА БОКОВОЙ ПАНЕЛИ, ЧТОБЫ НАЧАТЬ",
        playerStats: "СТАТИСТИКА ИГРОКА",
        vipStatus: "СТАТУС: ВИП КЛИЕНТ",
        infoTitle: "ИНФОРМАЦИЯ",
        ruleCost: "Каждая прокрутка в слотах и рулетке стоит ₸100.",
        ruleShop: "Загляни в МАГАЗИН, чтобы кастомизировать автомат!",
        rulePromo: "Есть секретный код? Введи его во вкладке ПРОМОКОДЫ!",
        pixslots: "ПИКСЛОТЫ",
        pullLever: "ДЁРНИ РЫЧАГ",
        msgLuck: "ПРОВЕРИМ ТВОЮ УДАЧУ",
        dvdTitle: "DVD РУЛЕТКА",
        jackpotZone: "ЗОНА ПОБЕДЫ",
        startRoulette: "НАЧАТЬ ИГРУ (₸100)",
        rouletteMsgStart: "НАЖМИ СТАРТ И ПОЙМАЙ РУЛЕТКУ!",
        shopTitle: "СКИНЫ СЛОТОВ",
        shopSub: "ВЫБЕРИТЕ СТИЛЬ ДЛЯ ВАШЕГО АВТОМАТА",
        equipped: "ЭКИПИРОВАНО",
        equip: "EQUIP",
        buyFor: "КУПИТЬ ЗА ₸",
        codeOnly: "ТОЛЬКО ПО ПРОМОКОДУ",
        promoTitle: "ВВОД ПРОМОКОДОВ",
        promoSub: "ВВОДИ СЕКРЕТНЫЕ КОДЫ ДЛЯ РАЗБЛОКИРОВКИ БОНУСОВ",
        promoPlaceholder: "ВВЕДИТЕ ПРОМОКОД...",
        promoActivate: "АКТИВИРОВАТЬ",
        promoWait: "ОЖИДАНИЕ ВВОДА...",
        adminTitle: "⚡ СЕКРЕТНАЯ ПАНЕЛЬКА ⚡",
        adminSub: "УПРАВЛЕНИЕ РЕСУРСАМИ И СОСТОЯНИЕМ ИГРЫ",
        adminGiveTokens: "ВЫДАЧА ТОКЕНОВ",
        adminCoolFuncs: "КРУТЫЕ ФУНКЦИИ",
        tryAgainNextTime: "ПОПРОБУЙ УДАЧУ В СЛЕДУЮЩИЙ РАЗ!",
        emptyCode: "ПУСТО!",
        voidUnlocked: "СКИН COSMIC VOID РАЗБЛОКИРОВАН!",
        voidAlreadyUnlocked: "СКИН COSMIC VOID УЖЕ РАЗБЛОКИРОВАН!",
        adminAlreadyActivated: "АДМИНКА УЖЕ АКТИВИРОВАНА!",
        adminActivated: "АДМИНКА АКТИВИРОВАНА!",
        invalidCode: "КОДА НЕ СУЩЕСТВУЕТ.",
        spinning: "ПРОКРУТКА...",
        skullFine: (skulls, fine) => `УПС! ЧЕРЕПОВ: ${skulls}. ШТРАФ: -₸${fine}`,
        secretPromoFound: "СЕКРЕТНЫЙ ПРОМОКОД НАЙДЕН: DIOV",
        jackpot: (win) => `ДЖЕКПОТ! +₸${win}`,
        win: "ПОБЕДА! +₸200",
        loseSlot: "ПРОИГРАЛ? ПОПРОБУЙ ЕЩЕ РАЗОК!",
        rouletteBtnActive: "ПРЫГ-НЕ-СКОК!",
        rouletteMsgActive: "ПРЫГ-СКОК... ОСТАНОВИ ЕГО В ЗОНЕ!",
        rouletteSniper: (win) => `ДА ТЫ СНАЙПЕР, ТОЧНО В ЦЕЛЬ! +₸${win}`,
        rouletteGood: (win) => `НЕПЛОХО! +₸${win}`,
        rouletteMiss: "НЕ ПОПАЛ... ДАВАЙ ЕЩЕ!",
        rouletteCanvasText: "РУЛЕТКА"
    },
    en: {
        defeat: "DEFEAT",
        bankruptMsg: "YOU WENT BANKRUPT AND LOST EVERYTHING!",
        reset: "RESET",
        retroCasino: "RETRO CASINO",
        tokens: "TOKENS",
        navHome: "🏠 HOME",
        navSlots: "🎰 SLOTS",
        navRoulette: "🎯 ROULETTE",
        navShop: "🛒 SHOP",
        navPromo: "🎫 PROMOCODES",
        navAdmin: "⚙️ ADMIN",
        welcome: "WELCOME TO RETRO CASINO!",
        welcomeSub: "CHOOSE A GAME FROM THE SIDEBAR TO START",
        playerStats: "PLAYER STATS",
        vipStatus: "STATUS: VIP CLIENT",
        infoTitle: "INFORMATION",
        ruleCost: "Each spin in slots and roulette costs ₸100.",
        ruleShop: "Check out the SHOP to customize your machine!",
        rulePromo: "Got a secret code? Enter it in the PROMOCODES tab!",
        pixslots: "PIXSLOTS",
        pullLever: "PULL THE LEVER",
        msgLuck: "LET'S TEST YOUR LUCK",
        dvdTitle: "DVD ROULETTE",
        jackpotZone: "WINNER ZONE",
        startRoulette: "START GAME (₸100)",
        rouletteMsgStart: "PRESS START AND CATCH THE ROULETTE!",
        shopTitle: "SLOT SKINS",
        shopSub: "CHOOSE A STYLE FOR YOUR SLOT MACHINE",
        equipped: "EQUIPPED",
        equip: "EQUIP",
        buyFor: "BUY FOR ₸",
        codeOnly: "PROMOCODE ONLY",
        promoTitle: "ENTER PROMOCODES",
        promoSub: "ENTER SECRET CODES TO UNLOCK BONUSES",
        promoPlaceholder: "ENTER PROMOCODE...",
        promoActivate: "ACTIVATE",
        promoWait: "WAITING FOR INPUT...",
        adminTitle: "⚡ SECRET PANEL ⚡",
        adminSub: "MANAGE GAME RESOURCES AND STATE",
        adminGiveTokens: "GIVE TOKENS",
        adminCoolFuncs: "COOL FEATURES",
        tryAgainNextTime: "TRY YOUR LUCK NEXT TIME!",
        emptyCode: "EMPTY!",
        voidUnlocked: "COSMIC VOID SKIN UNLOCKED!",
        voidAlreadyUnlocked: "COSMIC VOID SKIN ALREADY UNLOCKED!",
        adminAlreadyActivated: "ADMIN PANEL ALREADY ACTIVATED!",
        adminActivated: "ADMIN PANEL ACTIVATED!",
        invalidCode: "CODE DOES NOT EXIST.",
        spinning: "SPINNING...",
        skullFine: (skulls, fine) => `OOPS! SKULLS: ${skulls}. FINE: -₸${fine}`,
        secretPromoFound: "SECRET PROMOCODE FOUND: DIOV",
        jackpot: (win) => `JACKPOT! +₸${win}`,
        win: "WIN! +₸200",
        loseSlot: "LOST? TRY AGAIN!",
        rouletteBtnActive: "STOP!",
        rouletteMsgActive: "JUMPING... STOP IT IN THE ZONE!",
        rouletteSniper: (win) => `BULLSEYE! YOU ARE A SNIPER! +₸${win}`,
        rouletteGood: (win) => `NOT BAD! +₸${win}`,
        rouletteMiss: "MISSED... TRY AGAIN!",
        rouletteCanvasText: "ROULETTE"
    }
};

/** Returns current language dictionary. */
export function t() {
    return i18nData[state.currentLang];
}

export function switchLanguage(lang) {
    if (!i18nData[lang]) return;
    state.currentLang = lang;
    persistLang();

    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeLangBtn = document.getElementById(`lang-${lang}`);
    if (activeLangBtn) activeLangBtn.classList.add('active');

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nData[lang][key]) {
            el.textContent = i18nData[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (i18nData[lang][key]) {
            el.placeholder = i18nData[lang][key];
        }
    });
}
