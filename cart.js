document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const deliveryCostElement = document.getElementById('delivery-cost'); 
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Корзина пуста. Перейдите в каталог, чтобы добавить товары.</p>';
    } else {
        cartItemsContainer.innerHTML = ''; // Очищаем контейнер перед добавлением элементов

        cart.forEach(item => {
            const cartItemCard = document.createElement('div');
            cartItemCard.classList.add('product-card'); // Используем класс карточки из каталога

            cartItemCard.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="product-image">
                <h3>${item.name}</h3>
                <p>Рейтинг: ${item.rating || 'Нет'}</p>
                <p class="price">Цена: ${item.price}₽</p>
                <p>Количество: ${item.quantity}</p>
                <button class="remove-from-cart-btn" data-id="${item.id}">Удалить</button>
            `;
            cartItemsContainer.appendChild(cartItemCard);
        });
    }

    // Обновляем итоговую стоимость корзины
    updateTotalPrice();
});

// Функция для расчета стоимости доставки
function calculateDeliveryCost() {
    const deliveryDate = document.getElementById('delivery-date');
    const timeSlot = document.getElementById('time-slot');
    
    let deliveryCost = 0;

    // Стоимость доставки зависит от временного интервала
    if (timeSlot.value === "9-12") {
        deliveryCost = 200; 
    } else if (timeSlot.value === "12-15") {
        deliveryCost = 200; 
    } else if (timeSlot.value === "15-18") {
        deliveryCost = 200; 
    } else if (timeSlot.value === "18-00") {
        deliveryCost = 400; // Стоимость для интервала 18:00-21:00
    }

    // Проверка, если выбран выходной день (суббота или воскресенье)
    const selectedDate = new Date(deliveryDate.value);
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 6 || dayOfWeek === 0) {  // 6 - суббота, 0 - воскресенье
        deliveryCost += 300; // Добавляем 300 рублей в выходные
    }

    return deliveryCost;
}

// Обновление итоговой стоимости корзины с доставкой
function updateTotalPrice() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalPrice = 0;

    // Считаем итоговую стоимость товаров
    cart.forEach(item => {
        totalPrice += item.price * item.quantity; // Умножаем цену на количество
    });

    // Получаем стоимость доставки
    const deliveryCost = calculateDeliveryCost();

    // Обновляем текст итоговой стоимости товаров
    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = `${totalPrice + deliveryCost}₽`; // Итоговая стоимость товаров + доставка
    }

    // Отображаем стоимость доставки отдельно
    const deliveryCostElement = document.getElementById('delivery-cost');
    if (deliveryCostElement) {
        deliveryCostElement.textContent = `Доставка: ${deliveryCost}₽`; // Стоимость доставки
    }
}

// Обработчик для удаления товара из корзины
document.querySelector('.cart-items').addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-from-cart-btn')) {
        const productId = event.target.dataset.id;
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Фильтруем корзину, удаляя товар с указанным id
        const updatedCart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));

        // Перезагружаем страницу для обновления отображения корзины
        location.reload();
    }
});

// Получаем кнопку отправки заказа
const checkoutButton = document.querySelector("button[type='submit']"); // кнопка "Отправить заказ"

// Функция для оформления заказа
function checkout(event) {
    event.preventDefault(); // Отменяем стандартное поведение формы

    // Получаем все обязательные поля
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const address = document.getElementById("address");
    const deliveryDate = document.getElementById("delivery-date");
    const timeSlot = document.getElementById("time-slot");

    // Проверяем, если хотя бы одно обязательное поле не заполнено
    if (!name.value || !email.value || !phone.value || !address.value || !deliveryDate.value || !timeSlot.value) {
        alert("Пожалуйста, заполните все обязательные поля!");  // Уведомление о незаполненных полях
        return;
    }

    // Получаем товары из корзины
    const cartItems = JSON.parse(localStorage.getItem("cart")) || []; // Получаем товары из корзины

    if (cartItems.length === 0) {
        alert("Ваша корзина пуста! Добавьте товары в корзину.");  // Уведомление, если корзина пуста
        return;
    }

    // Формируем новый заказ
    const order = {
        items: cartItems.map(item => item.name), // Наименования товаров
        totalPrice: cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + calculateDeliveryCost(), // Итоговая цена с доставкой
        date: new Date().toLocaleString(), // Дата и время оформления заказа
        deliveryDate: deliveryDate.value, // Дата доставки
        deliveryTime: timeSlot.value, // Временной интервал доставки
        comment: document.getElementById("comment").value, // Комментарий к заказу
    };

    // Загружаем существующие заказы
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    // Добавляем новый заказ в список
    orders.push(order);

    // Сохраняем обновленные заказы в localStorage
    localStorage.setItem("orders", JSON.stringify(orders));

    // Очищаем корзину
    localStorage.setItem("cart", JSON.stringify([]));

    // Уведомление о том, что заказ оформлен
    alert("Ваш заказ успешно оформлен!");

    // Перенаправляем на страницу Личного кабинета (или обновляем страницу заказов)
    window.location.href = "profile.html"; // Перенаправление на страницу ЛК
}

// Добавляем обработчик для кнопки "Отправить заказ"
checkoutButton.addEventListener("click", checkout);

// Обработчик изменений на форме (для обновления стоимости доставки)
document.getElementById('delivery-date').addEventListener('change', updateTotalPrice);
document.getElementById('time-slot').addEventListener('change', updateTotalPrice);
