const apiUrl = "http://lab8-api.std-900.ist.mospolytech.ru/exam-2024-1/api/goods";
const apiKey = "6975389a-1339-49df-bbc0-2b8dd0a88546";
const productGrid = document.getElementById("productGrid");
let page = 1;
let products = [];  // Массив для хранения всех полученных товаров

// Функция для загрузки товаров с сервера
async function fetchProducts() {
    try {
        // Логирование запроса
        const response = await fetch(`${apiUrl}?api_key=${apiKey}&page=${page}`);
        console.log("API Response:", response); // Логирование ответа

        const data = await response.json();
        console.log("API Data:", data); // Логирование данных
        
        // Если данные содержат товары
        if (data && data.goods) {
            products = [...products, ...data.goods]; // Добавляем товары в массив
            createProductCards(products); // Генерируем карточки товаров
        } else {
            console.error("Нет товаров в ответе API");
        }
    } catch (error) {
        console.error("Error fetching products:", error); // Логирование ошибки
    }
}

// Генерация случайной цены (если не указана в API)
function generateRandomPrice() {
    return Math.floor(Math.random() * (5000 - 500 + 1)) + 500;
}

// Функция для создания карточек товаров
function createProductCards(products) {
    // Очищаем контейнер для товаров перед перерисовкой
    productGrid.innerHTML = '';

    // Создаем карточку для каждого товара
    products.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        // Сокращение длинных строк (название и описание товара)
        const truncatedName = product.name.length > 50 ? product.name.substring(0, 50) + "..." : product.name;
        const truncatedDescription = product.description && product.description.length > 100 ? product.description.substring(0, 100) + "..." : product.description;

        // Если цена отсутствует в API, используем случайную цену
        const price = product.price || generateRandomPrice(); 

        // Заглушка для изображения (если нет изображения в API)
        const defaultImage = "images/protein.jpg"; 
        const image = product.image || defaultImage;

        // Получаем рейтинг (если отсутствует, ставим 0)
        const rating = product.rating || 0;

        // Создаем карточку товара с данными
        card.innerHTML = `
            <img src="${image}" alt="${product.name}">
            <h3>${truncatedName}</h3>
            <p class="tooltip" title="${product.name}">Полное название: ${product.name}</p>
            <p class="tooltip" title="${product.description || 'Описание недоступно'}">${truncatedDescription || 'Описание недоступно'}</p>
            <p class="price">Цена: ${price}₽</p>
            <p class="rating">Рейтинг: ${rating} / 5</p>  <!-- Отображаем рейтинг -->
            <button class="add-to-cart-btn" data-id="${product.id}">Добавить в корзину</button>
        `;

        productGrid.appendChild(card);
    });
}

// Функция для сортировки товаров
function sortProducts(criteria) {
    const productCards = Array.from(document.querySelectorAll(".product-card")); // Получаем все карточки

    productCards.sort((a, b) => {
        const priceA = parseFloat(a.querySelector(".price").textContent.replace("Цена: ", "").replace("₽", "").trim());
        const priceB = parseFloat(b.querySelector(".price").textContent.replace("Цена: ", "").replace("₽", "").trim());
        const ratingA = parseFloat(a.querySelector(".rating").textContent.replace("Рейтинг: ", "").replace("/ 5", "").trim()) || 0;
        const ratingB = parseFloat(b.querySelector(".rating").textContent.replace("Рейтинг: ", "").replace("/ 5", "").trim()) || 0;

        if (criteria === "priceLow") return priceA - priceB; // Сортировка по возрастанию цены
        if (criteria === "priceHigh") return priceB - priceA; // Сортировка по убыванию цены
        if (criteria === "ratingHigh") return ratingB - ratingA; // Сортировка по убыванию рейтинга
        if (criteria === "ratingLow") return ratingA - ratingB; // Сортировка по возрастанию рейтинга
    });

    // Обновляем порядок карточек на странице
    productGrid.innerHTML = ""; // Очищаем контейнер
    productCards.forEach(card => productGrid.appendChild(card)); // Добавляем отсортированные карточки
}

// Обработчик изменения выбора сортировки
document.getElementById("sortSelect").addEventListener("change", (event) => {
    const selectedValue = event.target.value;
    sortProducts(selectedValue); // Вызываем сортировку по выбранному критерию
});

// Обработчик для загрузки новых товаров при нажатии на кнопку "Загрузить ещё"
document.getElementById("loadMore").addEventListener("click", () => {
    page++;
    fetchProducts();
});

// Изначально загружаем товары
fetchProducts();

// Обработчик кнопки "Добавить в корзину"
productGrid.addEventListener("click", (event) => {
    if (event.target.classList.contains("add-to-cart-btn")) {
        const productId = event.target.dataset.id;
        const productName = event.target.closest('.product-card').querySelector('h3').innerText;
        const productPriceText = event.target.closest('.product-card').querySelector('.price').innerText;
        const productImage = event.target.closest('.product-card').querySelector('img').src;
        const productRating = event.target.closest('.product-card').querySelector('.rating') 
            ? event.target.closest('.product-card').querySelector('.rating').innerText.replace('Рейтинг: ', '').trim() 
            : 0; // Получаем рейтинг из карточки товара

        // Преобразуем цену из текста в число
        const productPrice = parseFloat(productPriceText.replace('Цена: ', '').replace('₽', '').trim());

        const product = {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            rating: productRating // Добавляем рейтинг
        };

        addToCart(product);
    }
});

// Функция добавления товара в корзину
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        product.quantity = 1;
        cart.push(product);
    }

    // Сохраняем корзину в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Обновляем итоговую стоимость
    updateTotalPrice();

    // Показ уведомления о добавлении товара в корзину
    showAddToCartNotification(product.name);
}

// Функция для отображения уведомления
function showAddToCartNotification(productName) {
    // Создаем элемент уведомления
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.textContent = `${productName} добавлен в корзину!`;

    // Добавляем уведомление на страницу
    document.body.appendChild(notification);

    // Убираем уведомление через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Функция для обновления итоговой стоимости корзины
function updateTotalPrice() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalPrice = 0;

    cart.forEach(item => {
        totalPrice += item.price * item.quantity; // Умножаем цену на количество
    });

    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = `${totalPrice}₽`;
    }
}

// Инициализация корзины при загрузке страницы корзины
document.addEventListener('DOMContentLoaded', () => {
    updateTotalPrice();
});