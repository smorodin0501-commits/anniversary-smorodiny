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
      
      // Блокируем все кнопки, чтобы не было двойных кликов
      actionButtons.forEach(btn => btn.disabled = true);

      // --- Функция отправки в ВК (возвращает Promise) ---
      const sendVK = () => {
        return new Promise((resolve) => {
          const randomId = Date.now();
          const callbackName = 'vkCallback_' + randomId; // Уникальный callback для каждого запроса

          window[callbackName] = function(response) {
            delete window[callbackName]; // Очищаем глобальную область после ответа
            if (response.response) {
              resolve(true); // Успех
            } else {
              console.error('Ошибка отправки в ВК:', response.error);
              resolve(false); // Ошибка
            }
          };

          const vkUrl = `https://api.vk.com/method/messages.send?user_ids=${VK_USER_IDS}&message=${encodeURIComponent(messageTextVK)}&random_id=${randomId}&v=5.131&access_token=${VK_TOKEN}&callback=${callbackName}`;
          
          const script = document.createElement('script');
          script.src = vkUrl;
          document.body.appendChild(script);
          
          script.onload = () => script.remove(); 
          script.onerror = () => {
            console.error('Скрипт ВК не загрузился');
            script.remove();
            delete window[callbackName];
            resolve(false); // Ошибка сети/блокировка
          };
        });
      };

      // --- Функция отправки в Telegram (возвращает Promise) ---
      const sendTG = async () => {
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
          return response.ok; // Возвращает true, если статус 200-299
        } catch (error) {
          console.error('Ошибка сети TG:', error);
          return false; // Ошибка
        }
      };

      // Ждем результаты от обоих сервисов параллельно
      const [vkSuccess, tgSuccess] = await Promise.all([sendVK(), sendTG()]);

      // Проверяем: если хотя бы один сервис сработал (true), то считаем успешным
      if (vkSuccess || tgSuccess) {
        if (action === 'accept') {
          showStatus('Спасибо! Присутствие подтверждено, очень ждём вас 💌', 'success');
        } else {
          showStatus('Спасибо за ответ. Будем скучать!', 'success');
        }
        form.reset(); 
      } else {
        // Если оба вернули false
        showStatus('Ошибка сети. Не удалось отправить анкету. Пожалуйста, напишите нам лично.', 'error');
      }

      // Разблокируем кнопки
      actionButtons.forEach(btn => btn.disabled = false);
    });
  });
});
