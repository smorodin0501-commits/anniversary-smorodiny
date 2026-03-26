document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rsvp-form');
  const status = document.getElementById('rsvp-status');
  const nameInput = document.getElementById('name');
  const guestsInput = document.getElementById('guests');
  const actionButtons = document.querySelectorAll('.btn-choice');

  // === НАСТРОЙКИ TELEGRAM ===
  // Санек, не забудь вставить токен между кавычками!
  const BOT_TOKEN = '8728738189:AAHVj8l_8jmpgTwDWHtzo3JTX4LdGIMkg_4'; 
  const CHAT_ID = '-5108248291'; 
  // Используем прокси, чтобы работало в РФ без VPN
  const PROXY_URL = `https://corsproxy.io/?https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  // Функция для отображения статуса
  const showStatus = (message, type = 'success') => {
    if (!status) return;
    status.textContent = message;
    status.className = 'rsvp-note'; // Сброс классов
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

      // Формируем текст
      let messageText = '';
      if (action === 'accept') {
        messageText = `🎉 <b>НОВАЯ АНКЕТА (ПРИДУТ)!</b>\n\n👤 Имя: ${name}\n👥 Персон: ${guests}\n🍷 Алкоголь: ${alcohol}`;
      } else {
        messageText = `😔 <b>ОТКАЗ (НЕ СМОГУТ):</b>\n\n👤 Имя: ${name}`;
      }

      showStatus('Отправка анкеты...', 'success');
      button.disabled = true;

      try {
        // Отправляем именно через PROXY_URL
        const response = await fetch(PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: messageText,
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
          showStatus('Ошибка сервера. Попробуйте включить VPN или напишите нам лично.', 'error');
        }
      } catch (error) {
        showStatus('Ошибка сети. Проверьте подключение к интернету.', 'error');
        console.error('Ошибка:', error);
      } finally {
        button.disabled = false;
      }
    });
  });
});
