// === ГЛОБАЛЬНАЯ ФУНКЦИЯ ДЛЯ ОТВЕТА ОТ ВК ===
// Она должна быть снаружи, чтобы тег <script> мог к ней обратиться
window.vkCallback = function(response) {
  if (response.response) {
    console.log('Уведомление успешно доставлено в ВК');
  } else {
    console.error('Ошибка отправки в ВК:', response.error);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rsvp-form');
  const status = document.getElementById('rsvp-status');
  const nameInput = document.getElementById('name');
  const guestsInput = document.getElementById('guests');
  const actionButtons = document.querySelectorAll('.btn-choice');

  // === НАСТРОЙКИ TELEGRAM ===
  const TG_BOT_TOKEN = '8728738189:AAHVj8l_8jmpgTwDWHtzo3JTX4LdGIMkg_4'; 
  const TG_CHAT_ID = '-5108248291'; 
  const TG_PROXY_URL = `https://api.tgproxy.it/bot${TG_BOT_TOKEN}/sendMessage`;

  // === НАСТРОЙКИ ВКОНТАКТЕ ===
  // Не забудь вставить токен и ваши с Алиной ID (через запятую)
  const VK_TOKEN = 'vk1.a.JkQHmQWu79v9J9U35o2lWZBojUBVMUx2lAn9HWqHUtERa0TDPuN6XZXndKmyzRpnpxk3UofDzbvHEB43Lk3cA_TIDapJymfYUsf4ri8IfkvYQJmkQw-rWKkl12LyoQ4ZOIITIOKbhSwJrE9TKDixLWAY_eOWM7heuv7f46PGAGtOxDrIl1-qwE7orbyrrQoNa97afRIylsthZks6ArguvA';
  const VK_USER_IDS = '55868327,143992279'; 

  // Функция для отображения статуса
  const showStatus = (message, type = 'success') => {
    if (!status) return;
    status.textContent = message;
    status.className = 'rsvp-note'; 
    status.classList.add(type === 'success' ? 'rsvp-note--success' : 'rsvp-note--error');
  };

  // Валидация
  const validate = () => {
    if (!nameInput.value.trim()) {
      showStatus('Пожалуйста, укажите имя и фамилию.', 'error');
      nameInput.focus();
      return false;
    }
    const guests = Number(guestsInput.value);
    if (!guests || guests < 1) {
      showStatus('Укажи количество персон (минимум 1).', 'error');
      guestsInput.focus();
      return false;
    }
    return true;
  };

  actionButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const action = button.dataset.action;

      if (!validate()) return;

      const name = nameInput.value.trim();
      const guests = guestsInput.value;
      const alcoholCheckboxes = document.querySelectorAll('input[name="alcohol"]:checked');
      const alcohol = Array.from(alcoholCheckboxes).map(cb => cb.value).join(', ') || 'Не выбрано';

      // Формируем текст (HTML для TG, обычный текст для ВК)
      let messageTextTG = '';
      let messageTextVK = '';

      if (action === 'accept') {
        messageTextTG = `🎉 <b>НОВАЯ АНКЕТА (ПРИДУТ)!</b>\n\n👤 Имя: ${name}\n👥 Персон: ${guests}\n🍷 Алкоголь: ${alcohol}`;
        messageTextVK = `🎉 НОВАЯ АНКЕТА (ПРИДУТ)!\n\n👤 Имя: ${name}\n👥 Персон: ${guests}\n🍷 Алкоголь: ${alcohol}`;
      } else {
        messageTextTG = `😔 <b>ОТКАЗ (НЕ СМОГУТ):</b>\n\n👤 Имя: ${name}`;
        messageTextVK = `😔 ОТКАЗ (НЕ СМОГУТ):\n\n👤 Имя: ${name}`;
      }

      showStatus('Отправка анкеты...', 'success');
      button.disabled = true;

      // 1. ОТПРАВКА В ВК (через JSONP)
      const randomId = Date.now();
      const vkUrl = `https://api.vk.com/method/messages.send?user_ids=${VK_USER_IDS}&message=${encodeURIComponent(messageTextVK)}&random_id=${randomId}&v=5.131&access_token=${VK_TOKEN}&callback=vkCallback`;
      
      const script = document.createElement('script');
      script.src = vkUrl;
      document.body.appendChild(script);
      script.onload = () => script.remove(); // Убираем за собой тег

      // 2. ОТПРАВКА В TELEGRAM
      try {
        const response = await fetch(TG_PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TG_CHAT_ID,
            text: messageTextTG,
            parse_mode: 'HTML'
          }),
        });

        if (response.ok) {
          if (action === 'accept') {
            showStatus('Спасибо! Присутствие подтверждено, очень ждём вас 💌', 'success');
          } else {
            showStatus('Спасибо за ответ. Будем скучать!', 'success');
          }
          form.reset(); 
        } else {
          // Если TG отвалился, но ВК ушел
          showStatus('Ошибка сервера Telegram. Но мы всё равно получили вашу анкету!', 'error');
        }
      } catch (error) {
        showStatus('Ошибка сети. Проверьте подключение к интернету.', 'error');
        console.error('Ошибка TG:', error);
      } finally {
        button.disabled = false;
      }
    });
  });
});
