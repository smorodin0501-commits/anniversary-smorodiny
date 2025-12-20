document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rsvp-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Спасибо за ответ! Ждём вас на свадьбе!');
  });
});
