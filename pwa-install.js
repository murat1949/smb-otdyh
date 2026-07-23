(() => {
  'use strict';

  const installButton = document.getElementById('installApp');
  const installHelp = document.getElementById('installHelp');
  let deferredPrompt = null;

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);

  function showButton(label) {
    if (!installButton || isStandalone()) return;
    installButton.querySelector('span:last-child').textContent = label;
    installButton.classList.add('show');
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch((error) => {
        console.warn('Service worker не зарегистрирован:', error);
      });
    });
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showButton('Установить на телефон');
  });

  if (isIOS && isSafari && !isStandalone()) {
    showButton('Добавить на экран «Домой»');
    installHelp.textContent = 'На iPhone нажмите кнопку «Поделиться», затем выберите «На экран Домой».';
  }

  installButton?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installButton.classList.remove('show');
      return;
    }

    if (isIOS) {
      installHelp.classList.toggle('show');
      return;
    }

    installHelp.textContent = 'Откройте меню браузера и выберите «Установить приложение» или «Добавить на главный экран».';
    installHelp.classList.add('show');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installButton?.classList.remove('show');
    installHelp?.classList.remove('show');
  });
})();