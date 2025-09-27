document.addEventListener('DOMContentLoaded', () => {
  // Элементы
  const steps = document.querySelectorAll('.step');
  const nextButtons = document.querySelectorAll('.next-step');
  const backButtons = document.querySelectorAll('.back-step');
  const submitButton = document.querySelector('.submit');
  const newOrderButton = document.querySelector('.new-order');
  const progressBar = document.getElementById('progress-bar');
  let currentStep = 1;

  // Показать первый шаг
  document.getElementById(`step-${currentStep}`).classList.add('active');
  progressBar.style.width = `${(currentStep / 5) * 100}%`;

  // Логика кнопок "Далее"
  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        steps[currentStep - 1].classList.remove('active');
        currentStep++;
        steps[currentStep - 1].classList.add('active');
        if (currentStep === 2) updateCost();
        if (currentStep === 4) updateSummary();
        progressBar.style.width = `${(currentStep / 5) * 100}%`;
      }
    });
  });

  // Логика кнопок "Назад"
  backButtons.forEach(button => {
    button.addEventListener('click', () => {
      steps[currentStep - 1].classList.remove('active');
      currentStep--;
      steps[currentStep - 1].classList.add('active');
      progressBar.style.width = `${(currentStep / 5) * 100}%`;
    });
  });

  // Логика кнопки "Оформить заказ"
  submitButton.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify({
          premise: document.querySelector('input[name="premise-type"]:checked')?.value,
          area: document.querySelector('#area').value,
          services: Array.from(document.querySelectorAll('input[name="services"]:checked')).map(s => s.value),
          urgency: document.querySelector('input[name="urgency"]:checked')?.value,
          date: document.querySelector('#date').value,
          time: document.querySelector('#time').value,
          name: document.querySelector('#name').value,
          phone: document.querySelector('#phone').value
        }),
        headers: { 'Content-Type': 'application/json' }
      })
        .then(() => {
          steps[currentStep - 1].classList.remove('active');
          currentStep++;
          steps[currentStep - 1].classList.add('active');
          document.getElementById('order-number').textContent = Math.floor(Math.random() * 10000);
          localStorage.setItem('lastOrder', JSON.stringify({
            premise: document.querySelector('input[name="premise-type"]:checked')?.value,
            area: document.querySelector('#area').value,
            cost: document.getElementById('final-cost').textContent
          }));
        })
        .catch(() => alert('Ошибка при отправке!'));
    }
  });

  // Логика кнопки "Новый заказ"
  newOrderButton.addEventListener('click', () => {
    steps[currentStep - 1].classList.remove('active');
    currentStep = 1;
    steps[currentStep - 1].classList.add('active');
    document.querySelector('form').reset();
    updateCost();
    updateSummary();
    progressBar.style.width = `${(currentStep / 5) * 100}%`;
  });

  // Тёмная тема
  document.getElementById('dark-mode-toggle').addEventListener('change', (e) => {
    document.body.classList.toggle('dark-mode', e.target.checked);
  });

  // Валидация шага
  function validateStep(step) {
    if (step === 1) {
      const premise = document.querySelector('input[name="premise-type"]:checked');
      const area = document.querySelector('#area').value;
      if (!premise || !area || area <= 0) {
        alert('Выберите тип помещения и укажите площадь!');
        return false;
      }
    } else if (step === 2) {
      const services = document.querySelectorAll('input[name="services"]:checked');
      if (services.length === 0) {
        alert('Выберите хотя бы одну услугу!');
        return false;
      }
    } else if (step === 3) {
      const date = document.querySelector('#date').value;
      const time = document.querySelector('#time').value;
      if (!date || !time) {
        alert('Укажите дату и время!');
        return false;
      }
    } else if (step === 4) {
      const name = document.querySelector('#name').value;
      const phone = document.querySelector('#phone').value;
      if (!name || !phone) {
        alert('Укажите имя и телефон!');
        return false;
      }
    }
    return true;
  }

  // Подсчёт стоимости
  function updateCost() {
    const area = parseFloat(document.querySelector('#area').value) || 0;
    const services = document.querySelectorAll('input[name="services"]:checked');
    const urgency = document.querySelector('input[name="urgency"]:checked')?.value;
    let basePrice = area * 5000; // 5000 ₽/м²
    basePrice += services.length * 10000; // 10000 ₽ за услугу
    let multiplier = 1;
    if (urgency === 'priority') multiplier = 1.2;
    if (urgency === 'urgent') multiplier = 1.5;
    const total = Math.round(basePrice * multiplier);
    document.getElementById('cost').textContent = `${total} ₽`;
    document.getElementById('final-cost').textContent = `${total} ₽`;
  }

  // Обновление сводки
  function updateSummary() {
    const premise = document.querySelector('input[name="premise-type"]:checked')?.value || 'Не выбрано';
    const area = document.querySelector('#area').value || 0;
    const services = Array.from(document.querySelectorAll('input[name="services"]:checked')).map(s => s.value);
    const urgency = document.querySelector('input[name="urgency"]:checked')?.value || 'normal';
    const date = document.querySelector('#date').value;
    const time = document.querySelector('#time').value;
    document.getElementById('summary-content').innerHTML = `
      <p>Тип помещения: ${premise}</p>
      <p>Площадь: ${area} м²</p>
      <p>Услуги: ${services.join(', ') || 'Не выбрано'}</p>
      <p>Срочность: ${urgency === 'normal' ? 'Обычная' : urgency === 'priority' ? 'Приоритетная' : 'Срочная'}</p>
      <p>Дата и время: ${date} ${time}</p>
    `;
  }

  // Обновление стоимости при изменении услуг или срочности
  document.querySelectorAll('input[name="services"], input[name="urgency"]').forEach(input => {
    input.addEventListener('change', updateCost);
  });
});