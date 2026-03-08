document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rsvp-form');
  const status = document.getElementById('rsvp-status');
  const nameInput = document.getElementById('name');
  const guestsInput = document.getElementById('guests');
  const actionButtons = document.querySelectorAll('.btn-choice');

  const showStatus = (message, type = 'success') => {
    if (!status) return;

    status.textContent = message;
    status.classList.remove('rsvp-note--success', 'rsvp-note--error');
    status.classList.add(type === 'success' ? 'rsvp-note--success' : 'rsvp-note--error');
  };

  const validate = () => {
    if (!nameInput.value.trim()) {
      showStatus('Пожалуйста, укажи имя и фамилию.', 'error');
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
    button.addEventListener('click', () => {
      const action = button.dataset.action;

      if (!validate()) return;

      if (action === 'accept') {
        showStatus('Спасибо! Присутствие подтверждено, очень ждём вас 💌', 'success');
      } else {
        showStatus('Спасибо за ответ. Будем скучать и поднимем бокал за вас 🖤', 'success');
      }

      form.reset();
    });
  });
});
