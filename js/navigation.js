import { dom, refreshNavButtons } from './dom.js';
import { state } from './state.js';
import { playSound } from './audio.js';

let onTabChange = null;

function closeMobileSidebar() {
    if (dom.sidebar && dom.sidebar.classList.contains('open')) {
        dom.sidebar.classList.remove('open');
        if (dom.sidebarBackdrop) dom.sidebarBackdrop.classList.remove('active');
    }
}

function handleTabClick(e) {
    if (state.isSpinning) return;

    const clickedButton = e.currentTarget;
    dom.navButtons.forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');

    const targetTabId = clickedButton.getAttribute('data-tab');
    dom.tabSections.forEach(section => section.classList.remove('active-tab'));

    const targetSection = document.getElementById(targetTabId);
    if (targetSection) targetSection.classList.add('active-tab');

    closeMobileSidebar();

    if (onTabChange) onTabChange(targetTabId);

    playSound('click');
}

export function setupTabNavigation(callback) {
    if (callback) onTabChange = callback;

    refreshNavButtons().forEach(button => {
        button.removeEventListener('click', handleTabClick);
        button.addEventListener('click', handleTabClick);
    });
}

export function toggleMobileSidebar() {
    if (dom.sidebar) dom.sidebar.classList.toggle('open');
    if (dom.sidebarBackdrop) dom.sidebarBackdrop.classList.toggle('active');
}

/** Programmatically activates the first tab (used after a full reset). */
export function goToFirstTab() {
    if (dom.navButtons[0]) dom.navButtons[0].click();
}
