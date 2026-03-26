document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rsvp-form');
  const status = document.getElementById('rsvp-status');
  const nameInput = document.getElementById('name');
  const guestsInput = document.getElementById('guests');
  const actionButtons = document.querySelectorAll('.btn-choice');

  // === ВСТАВЬ СВОИ ДАННЫЕ ИЗ TELEGRAM СЮДА ===
  const BOT_TOKEN = '8728738189:AAHVj8l_8jmpgTwDWHtzo3JTX4LdGIMkg_4'; 
  const CHAT_ID = '-5108248291';
  // 2. Используем зеркало вместо заблокированного api.telegram.org
const PROXY_URL = "https://api.tgproxy.it/bot" + TOKEN + "/sendMessage";

async function sendToTelegram(message) {
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (response.ok) {
      document.getElementById('rsvp-status').innerText = "Успешно отправлено!";
    } else {
      throw new Error('Ошибка сети');
    }
  } catch (error) {
    console.error("Ошибка:", error);
    document.getElementById('rsvp-status').innerText = "Ошибка при отправке. Попробуйте позже.";
  }
}
  // ===========================================

  const showStatus = (message, type = 'success') => {
    if (!status) return;
    status.textContent = message;
    status.classList.remove('rsvp-note--success', 'rsvp-note--error');
    status.classList.add(type === 'success' ? 'rsvp-note--success' : 'rsvp-note--error');
  };

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

      // Собираем данные формы
      const name = nameInput.value.trim();
      const guests = guestsInput.value;

      // Собираем отмеченный алкоголь
      const alcoholCheckboxes = document.querySelectorAll('input[name="alcohol"]:checked');
      const alcohol = Array.from(alcoholCheckboxes).map(cb => cb.value).join(', ') || 'Не выбрано';

      // Формируем текст сообщения для Телеграма
      let messageText = '';
      if (action === 'accept') {
        messageText = `🎉 НОВАЯ АНКЕТА (ПРИДУТ)!\n\nИмя: ${name}\nПерсон: ${guests}\nАлкоголь: ${alcohol}`;
      } else {
        messageText = `😔 ОТКАЗ (НЕ СМОГУТ):\n\nИмя: ${name}`;
      }

      // Показываем гостю, что идет загрузка, и блокируем кнопку от двойного клика
      showStatus('Отправка анкеты...', 'success');
      button.disabled = true;

      try {
        // Отправляем запрос к API Telegram
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: messageText,
          }),
        });

        if (response.ok) {
          if (action === 'accept') {
            showStatus('Спасибо! Присутствие подтверждено, очень ждём вас 💌', 'success');
          } else {
            showStatus('Спасибо за ответ. Будем скучать!', 'success');
          }
          form.reset(); // Очищаем форму после успешной отправки
        } else {
          showStatus('Произошла ошибка при отправке. Пожалуйста, напишите нам лично.', 'error');
        }
      } catch (error) {
        showStatus('Ошибка сети. Проверьте подключение к интернету.', 'error');
      } finally {
         button.disabled = false; // Разблокируем кнопку обратно
      }
    });
  });
});
