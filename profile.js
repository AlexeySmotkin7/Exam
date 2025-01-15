// Получаем элементы DOM
const orderTableBody = document.querySelector("tbody");
const notifications = document.getElementById("notifications");
const viewOrderModal = document.getElementById("view-order-modal");
const editOrderModal = document.getElementById("edit-order-modal");
const deleteConfirmationModal = document.getElementById("delete-confirmation-modal");
const closeViewModal = document.getElementById("close-view-modal");
const closeEditModal = document.getElementById("close-edit-modal");
const saveOrderChanges = document.getElementById("save-order-changes");
const cancelDeleteButton = document.getElementById("cancel-delete");
const confirmDeleteButton = document.getElementById("confirm-delete");

// Переменная для хранения ID заказа, который нужно удалить
let orderIdToDelete = null;
let orderIdToEdit = null;  // Переменная для хранения ID заказа, который нужно редактировать

// Слушаем событие для закрытия модальных окон
closeViewModal.addEventListener("click", () => viewOrderModal.style.display = "none");
closeEditModal.addEventListener("click", () => editOrderModal.style.display = "none");

// Функция для отображения уведомлений
function showNotification(message) {
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.textContent = message;
    notifications.appendChild(notification);

    // Убираем уведомление через 3 секунды
    setTimeout(() => notification.remove(), 3000);
}

// Функция для загрузки заказов из localStorage и отображения их
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orderTableBody.innerHTML = ""; // Очищаем таблицу перед добавлением новых заказов

    orders.forEach((order, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${order.date}</td>
            <td>${order.items.join(", ")}</td>
            <td>${order.totalPrice}₽</td>
            <td>${order.deliveryDate} ${order.deliveryTime}</td>
            <td>
                <button class="view-order" data-id="${index}">Просмотр</button>
                <button class="edit-order" data-id="${index}">Редактировать</button>
                <button class="delete-order" data-id="${index}">Удалить</button>
            </td>
        `;

        orderTableBody.appendChild(row);
    });
}

// Функция для отображения модального окна с подробностями заказа
function viewOrder(id) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const order = orders[id];

    document.getElementById("view-items").textContent = order.items.join(", ");
    document.getElementById("view-total-price").textContent = order.totalPrice + "₽";
    document.getElementById("view-delivery-date").textContent = order.deliveryDate;
    document.getElementById("view-delivery-time").textContent = order.deliveryTime;
    document.getElementById("view-order-date").textContent = order.date;

    viewOrderModal.style.display = "block";
}

// Функция для открытия модального окна редактирования заказа
function editOrder(id) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const order = orders[id];

    orderIdToEdit = id; // Сохраняем ID заказа для редактирования

    document.getElementById("edit-items").value = order.items.join(", ");
    document.getElementById("edit-delivery-date").value = order.deliveryDate;
    document.getElementById("edit-delivery-time").value = order.deliveryTime;

    editOrderModal.style.display = "block";

    // Обработчик для сохранения изменений
    saveOrderChanges.onclick = () => {
        const updatedOrder = {
            ...order,
            items: document.getElementById("edit-items").value.split(",").map(item => item.trim()),
            deliveryDate: document.getElementById("edit-delivery-date").value,
            deliveryTime: document.getElementById("edit-delivery-time").value,
        };

        // Обновляем общую стоимость заказа (сохраняем цену как была)
        updatedOrder.totalPrice = order.totalPrice; // Оставляем старую цену

        orders[id] = updatedOrder;
        localStorage.setItem("orders", JSON.stringify(orders));

        showNotification("Заказ отредактирован!");
        loadOrders();
        editOrderModal.style.display = "none";
    };
}

// Функция для отображения модального окна подтверждения удаления заказа
function showDeleteConfirmation(id) {
    // Сохраняем ID заказа, который нужно удалить
    orderIdToDelete = id;
    deleteConfirmationModal.style.display = "block";
}

// Функция для удаления заказа
function deleteOrder() {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.splice(orderIdToDelete, 1); // Удаляем заказ по индексу

    localStorage.setItem("orders", JSON.stringify(orders));
    showNotification("Заказ удален!");
    loadOrders();
    deleteConfirmationModal.style.display = "none"; // Закрываем модальное окно
}

// Обработчик кликов на кнопки "Просмотр", "Редактирование", "Удаление"
orderTableBody.addEventListener("click", (event) => {
    const target = event.target;
    const orderId = target.getAttribute("data-id");

    if (target.classList.contains("view-order")) {
        viewOrder(orderId);
    } else if (target.classList.contains("edit-order")) {
        editOrder(orderId);
    } else if (target.classList.contains("delete-order")) {
        showDeleteConfirmation(orderId);
    }
});

// Обработчик кликов для подтверждения удаления
confirmDeleteButton.onclick = deleteOrder;

// Обработчик кликов для отмены удаления
cancelDeleteButton.onclick = () => {
    deleteConfirmationModal.style.display = "none"; // Закрываем модальное окно
};

// Инициализация страницы (загрузка заказов)
loadOrders();
