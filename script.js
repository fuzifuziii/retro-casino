// by fuzifuziii
// Состояние слотов
const symbols = ['💎', '🍒', '🪙', '💀', '🍀'];
let balance = 1000;
let isSpinning = false;
let isAdminActivated = false; 

// Состояние скинов
let currentSkin = localStorage.getItem('currentSkin') || 'default';
let purchasedSkins = JSON.parse(localStorage.getItem('purchasedSkins')) || ['default'];

if (localStorage.getItem('slotBalance')) {
    balance = parseInt(localStorage.getItem('slotBalance'));
}

if (sessionStorage.getItem('adminPanelUnlocked') === 'true') {
    isAdminActivated = true;
}

// Элементы навигации
let navButtons = document.querySelectorAll('.nav-btn');
const tabSections = document.querySelectorAll('.tab-section');
const syncBalanceElements = document.querySelectorAll('.sync-balance');
const gameOverScreen = document.getElementById('game-over-screen');

// Игровые элементы слотов
const machineBody = document.getElementById('machine-body');
const msg = document.getElementById('msg');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const knob = document.getElementById('lever-knob');
const shaft = document.getElementById('lever-shaft');

let isDragging = false;
let startY = 0;
const maxPull = 100;

// Состояние рулетки
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');
const rouletteBtn = document.getElementById('roulette-btn');
const rouletteMsg = document.getElementById('roulette-msg');

let rouletteActive = false;
let dvdAnimationId = null;

// Настройка логотипа рулетки
let dvd = {
    x: 50,
    y: 50,
    width: 110,
    height: 40,
    dx: 6,
    dy: 6,
    colors: ['#ff007f', '#00ffcc', '#ffff00', '#ff0055', '#38bdf8', '#a7f3d0'],
    currentColorIndex: 0
};

// 8-битный звук
function playSound(type) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'win') {
        osc.type = 'square';
        const now = audioCtx.currentTime;
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(400, now + 0.08);
        osc.frequency.setValueAtTime(500, now + 0.16);
        osc.frequency.setValueAtTime(600, now + 0.24);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start();
        osc.stop(now + 0.4);
    } else if (type === 'lose') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
    } else if (type === 'gameover') {
        const now = audioCtx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(140, now + 0.15);
        osc.frequency.setValueAtTime(100, now + 0.3);
        osc.frequency.linearRampToValueAtTime(30, now + 0.6);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start();
        osc.stop(now + 0.6);
    } else if (type === 'jack') {
        const now = audioCtx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.2, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.9);

        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();

        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);

        osc2.type = 'square';

        const notes = [600, 800, 1000, 1200, 1000, 1400];
        notes.forEach((f, i) => {
            osc2.frequency.setValueAtTime(f, now + i * 0.08);
        });

        gain2.gain.setValueAtTime(0.05, now);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

        osc2.start(now);
        osc2.stop(now + 0.7);
    }
}

// Клик по вкладкам
function setupTabNavigation() {
    navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.removeEventListener('click', handleTabClick);
        button.addEventListener('click', handleTabClick);
    });
}

function handleTabClick(e) {
    if (isSpinning) return; 

    const clickedButton = e.currentTarget;
    navButtons.forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');

    const targetTabId = clickedButton.getAttribute('data-tab');
    tabSections.forEach(section => section.classList.remove('active-tab'));
    document.getElementById(targetTabId).classList.add('active-tab');
    
    if (targetTabId === 'tab-shop') {
        renderShop();
    }
    
    if (targetTabId === 'tab-roulette') {
        drawDvdStatic();
    } else {
        if (rouletteActive) {
            stopRouletteGame(false);
        }
    }
    
    playSound('click');
}

function updateBalanceDisplay() {
    syncBalanceElements.forEach(el => {
        el.textContent = balance;
    });
    localStorage.setItem('slotBalance', balance);
}

function checkBankruptStatus() {
    if (balance < 100 && !isSpinning && !rouletteActive) {
        gameOverScreen.classList.add('active-screen');
        playSound('gameover');
    } else {
        gameOverScreen.classList.remove('active-screen');
    }
}

window.resetGameFromGameOver = function() {
    localStorage.clear();
    sessionStorage.clear();
    balance = 1000;
    currentSkin = 'default';
    purchasedSkins = ['default'];
    isAdminActivated = false;
    
    const adminBtn = document.querySelector('.admin-nav-btn');
    if (adminBtn) adminBtn.remove();
    
    updateBalanceDisplay();
    applySkin();
    renderShop();
    checkBankruptStatus();
    setupTabNavigation();
    
    msg.textContent = "ПОПРОБУЙ УДАЧУ В СЛЕДУЮЩИЙ РАЗ!";
    msg.style.color = "#ff007f";
    playSound('win');
};

// Логика промокодов
window.submitPromoCode = function() {
    const input = document.getElementById('promo-input');
    const promoMsg = document.getElementById('promo-msg');
    const code = input.value.trim().toLowerCase(); 
    
    promoMsg.classList.remove('status-error', 'status-success');
    void promoMsg.offsetWidth; 

    if (code === '') {
        promoMsg.textContent = "ПУСТО!";
        promoMsg.classList.add('status-error');
        playSound('lose');
        return;
    }

    if (code === 'diov') {
        if (!purchasedSkins.includes('void')) {
            purchasedSkins.push('void');
            localStorage.setItem('purchasedSkins', JSON.stringify(purchasedSkins));

            promoMsg.textContent = "СКИН COSMIC VOID РАЗБЛОКИРОВАН!";
            promoMsg.classList.add('status-success');

            renderShop();
            playSound('win');
        } else {
            promoMsg.textContent = "СКИН COSMIC VOID УЖЕ РАЗБЛОКИРОВАН!";
            promoMsg.classList.add('status-error');
            playSound('lose');
        }

        input.value = '';
        return;
    }

    if (code === 'admin') {
        if (isAdminActivated) {
            promoMsg.textContent = "АДМИНКА УЖЕ АКТИВИРОВАНА!";
            promoMsg.classList.add('status-error');
            playSound('lose');
            return;
        }

        isAdminActivated = true;
        sessionStorage.setItem('adminPanelUnlocked', 'true');
        buildAdminButton();
        
        promoMsg.textContent = "АДМИНКА АКТИВИРОВАНА!";
        promoMsg.classList.add('status-success');
        playSound('win');
        input.value = '';
        return;
    }

    promoMsg.textContent = "КОДА НЕ СУЩЕСТВУЕТ.";
    promoMsg.classList.add('status-error');
    playSound('lose');
};

function buildAdminButton() {
    if (document.querySelector('.admin-nav-btn')) return;

    const adminBtn = document.createElement('button');
    adminBtn.className = 'nav-btn admin-nav-btn';
    adminBtn.setAttribute('data-tab', 'tab-admin');
    adminBtn.innerHTML = '⚙️ АДМИНКА';
    
    const menu = document.getElementById('sidebar-menu');
    if (menu) menu.appendChild(adminBtn);

    setupTabNavigation();
}

// Логика рычага и слотов
knob.addEventListener('mousedown', (e) => {
    if (isSpinning) return;
    if (balance < 100) {
        checkBankruptStatus();
        return;
    }
    
    e.preventDefault(); 
    isDragging = true;
    startY = e.clientY;
    shaft.classList.remove('lever-returning');
    playSound('click');
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    let deltaY = e.clientY - startY;
    if (deltaY < 0) deltaY = 0;
    if (deltaY > maxPull) deltaY = maxPull;

    let scaleY = 1 - (deltaY / maxPull) * 0.75;
    shaft.style.transform = `scaleY(${scaleY})`;

    if (deltaY >= maxPull * 0.9) {
        triggerSpin();
    }
});

window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    resetLever();
});

function resetLever() {
    isDragging = false;
    shaft.classList.add('lever-returning');
    shaft.style.transform = `scaleY(1)`;
}

function triggerSpin() {
    isDragging = false;
    isSpinning = true;
    resetLever();

    balance -= 100;
    updateBalanceDisplay();
    msg.textContent = "ПРОКРУТКА...";
    msg.style.color = "#ffffff";

    reels.forEach(reel => reel.classList.add('spinning'));

    setTimeout(() => {
        let results = [];
        
        reels.forEach(reel => {
            reel.classList.remove('spinning');
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            reel.textContent = randomSymbol;
            results.push(randomSymbol);
        });

        // Логика с черепами
        const skullCount = results.filter(symbol => symbol === '💀').length;

        if (skullCount > 0) {
            const fine = skullCount * 50;
            balance = Math.max(0, balance - fine);
            msg.textContent = `УПС! ЧЕРЕПОВ: ${skullCount}. ШТРАФ: -₸${fine}`;
            msg.style.color = "#ff0000";
            playSound('lose');
        } else if (results[0] === results[1] && results[1] === results[2]) {
            if (!localStorage.getItem('promo_diov_found') && Math.random() < 0.1) {
                localStorage.setItem('promo_diov_found', 'true');
                msg.textContent = "СЕКРЕТНЫЙ ПРОМОКОД НАЙДЕН: DIOV";
                msg.style.color = "#ffff00";
                playSound('jack');
                createCoinExplosion();
            } else {
                let winAmount = 500;
                if (results[0] === '💎') winAmount = 1000;
                balance += winAmount;
                msg.textContent = `ДЖЕКПОТ! +₸${winAmount}`;
                msg.style.color = "#00ffcc";
                playSound('jack');
                createCoinExplosion();
            }
        } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            balance += 200;
            msg.textContent = "ПОБЕДА! +₸200";
            msg.style.color = "#ffcc00";
            playSound('win');
            createCoinExplosion();
        } else {
            msg.textContent = "ПРОИГРАЛ? ПОПРОБУЙ ЕЩЕ РАЗОК!";
            msg.style.color = "#ff007f";
            playSound('lose');
        }

        updateBalanceDisplay();
        renderShop(); 
        isSpinning = false;
        checkBankruptStatus();
    }, 1500);
}

// Логика движка рулетки
function drawDvdStatic() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 4;
    ctx.strokeRect(100, 75, 250, 150);
    ctx.fillStyle = dvd.colors[dvd.currentColorIndex];
    ctx.fillRect(dvd.x, dvd.y, dvd.width, dvd.height);
    ctx.fillStyle = '#000';
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('РУЛЕТКА', dvd.x + dvd.width/2, dvd.y + dvd.height/2);
}

function updateDvdPhysics() {
    dvd.x += dvd.dx;
    dvd.y += dvd.dy;
    let hitWall = false;
    if (dvd.x <= 0 || dvd.x + dvd.width >= canvas.width) { dvd.dx = -dvd.dx; hitWall = true; }
    if (dvd.y <= 0 || dvd.y + dvd.height >= canvas.height) { dvd.dy = -dvd.dy; hitWall = true; }
    if (hitWall) {
        dvd.currentColorIndex = (dvd.currentColorIndex + 1) % dvd.colors.length;
        playSound('click');
    }
}

function rouletteLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateDvdPhysics();
    drawDvdStatic();
    dvdAnimationId = requestAnimationFrame(rouletteLoop);
}

rouletteBtn.addEventListener('click', () => {
    if (!rouletteActive) {
        if (balance < 100) { checkBankruptStatus(); return; }
        balance -= 100;
        updateBalanceDisplay();
        rouletteActive = true;
        rouletteBtn.textContent = 'ПРЫГ-НЕ-СКОК!';
        rouletteBtn.style.backgroundColor = '#ff0055';
        rouletteMsg.textContent = 'ПРЫГ-СКОК... ОСТАНОВИ ЕГО В ЗОНЕ!';
        rouletteMsg.style.color = '#fff';
        dvd.dx = (Math.random() > 0.5 ? 4 : -4);
        dvd.dy = (Math.random() > 0.5 ? 4 : -4);
        rouletteLoop();
    } else {
        stopRouletteGame(true);
    }
});

function stopRouletteGame(shouldCalculateReward) {
    rouletteActive = false;
    cancelAnimationFrame(dvdAnimationId);
    rouletteBtn.textContent = 'НАЧАТЬ ИГРУ (₸100)';
    rouletteBtn.style.backgroundColor = '#3b2363';
    if (!shouldCalculateReward) return;
    let logoCenterX = dvd.x + dvd.width / 2;
    let logoCenterY = dvd.y + dvd.height / 2;
    if (logoCenterX >= 100 && logoCenterX <= 350 && logoCenterY >= 75 && logoCenterY <= 225) {
        let winPrize = 120;
        if (Math.abs(logoCenterX - 225) < 30 && Math.abs(logoCenterY - 150) < 20) {
            winPrize = 200;
            rouletteMsg.textContent = `ДА ТЫ СНАЙПЕР, ТОЧНО В ЦЕЛЬ! +₸${winPrize}`;
            rouletteMsg.style.color = '#00ffcc';
        } else {
            rouletteMsg.textContent = `НЕПЛОХО! +₸${winPrize}`;
            rouletteMsg.style.color = '#ffff00';
        }
        balance += winPrize;
        playSound('win');
        createCoinExplosion();
    } else {
        rouletteMsg.textContent = 'НЕ ПОПАЛ... ДАВАЙ ЕЩЕ!';
        rouletteMsg.style.color = '#ff0055';
        playSound('lose');
    }
    updateBalanceDisplay();
    renderShop();
    checkBankruptStatus();
}

function createCoinExplosion() {
    const coinCount = 25;
    const container = document.body;
    for (let i = 0; i < coinCount; i++) {
        const coin = document.createElement('div');
        coin.className = 'pixel-coin';
        const startX = window.innerWidth / 2 + 100; 
        const startY = window.innerHeight / 2;
        coin.style.left = `${startX}px`;
        coin.style.top = `${startY}px`;
        container.appendChild(coin);
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 6 + 4;
        let velX = Math.cos(angle) * velocity;
        let velY = Math.sin(angle) * velocity - 4; 
        let posX = startX;
        let posY = startY;
        let gravity = 0.35;
        let opacity = 1;
        const coinInterval = setInterval(() => {
            velY += gravity; posX += velX; posY += velY; opacity -= 0.025;
            coin.style.left = `${posX}px`;
            coin.style.top = `${posY}px`;
            coin.style.opacity = opacity;
            if (opacity <= 0 || posY > window.innerHeight) {
                clearInterval(coinInterval);
                coin.remove();
            }
        }, 20);
    }
}

const buyButtons = document.querySelectorAll('.shop-btn');
function renderShop() {
    buyButtons.forEach(btn => {
        const skinName = btn.id.replace('btn-skin-', '');
        const card = document.getElementById(`card-${skinName}`);
        if (!card) return;
        card.classList.remove('current');
        if (skinName === 'void' && !purchasedSkins.includes('void')) {
            btn.textContent = 'ТОЛЬКО ПО ПРОМОКОДУ';
            btn.className = 'shop-btn';
            btn.disabled = true;
            return;
        }
        if (currentSkin === skinName) {
            card.classList.add('current');
            btn.textContent = 'ЭКИПИРОВАНО';
            btn.className = 'shop-btn equipped';
            btn.disabled = true;
        } else if (purchasedSkins.includes(skinName)) {
            btn.textContent = 'EQUIP';
            btn.className = 'shop-btn';
            btn.disabled = false;
        } else {
            const price = parseInt(btn.getAttribute('data-price'));
            btn.textContent = `КУПИТЬ ЗА ₸${price}`;
            btn.className = 'shop-btn btn-buy';
            btn.disabled = balance < price;
        } 
    });
}

buyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const skinName = btn.id.replace('btn-skin-', '');
        if (purchasedSkins.includes(skinName)) {
            currentSkin = skinName;
            playSound('click');
        } else {
            const price = parseInt(btn.getAttribute('data-price'));
            if (balance >= price) {
                balance -= price;
                purchasedSkins.push(skinName);
                currentSkin = skinName;
                playSound('win');
            }
        }
        localStorage.setItem('currentSkin', currentSkin);
        localStorage.setItem('purchasedSkins', JSON.stringify(purchasedSkins));
        updateBalanceDisplay();
        applySkin();
        renderShop();
    });
});

function applySkin() {
    machineBody.classList.remove('theme-neon', 'theme-gold', 'theme-blue', 'theme-grey', 'theme-green', 'theme-wave', 'theme-void');
    if (currentSkin === 'neon') machineBody.classList.add('theme-neon');
    if (currentSkin === 'gold') machineBody.classList.add('theme-gold');
    if (currentSkin === 'blue') machineBody.classList.add('theme-blue');
    if (currentSkin === 'grey') machineBody.classList.add('theme-grey');
    if (currentSkin === 'green') machineBody.classList.add('theme-green');
    if (currentSkin === 'wave') machineBody.classList.add('theme-wave');
    if (currentSkin === 'void') machineBody.classList.add('theme-void');
}

window.adminGiveMoney = function(amount) {
    balance += amount;
    if (balance < 0) balance = 0;
    updateBalanceDisplay();
    renderShop();
    checkBankruptStatus();
    playSound('win');
};

window.adminResetStorage = function() {
    localStorage.clear();
    sessionStorage.clear();
    balance = 1000;
    currentSkin = 'default';
    purchasedSkins = ['default'];
    isAdminActivated = false;
    const adminBtn = document.querySelector('.admin-nav-btn');
    if (adminBtn) adminBtn.remove();
    updateBalanceDisplay();
    applySkin();
    renderShop();
    checkBankruptStatus();
    navButtons[0].click();
};

if (isAdminActivated) { buildAdminButton(); }
setupTabNavigation();
updateBalanceDisplay();
applySkin();
renderShop();
checkBankruptStatus();
drawDvdStatic();
