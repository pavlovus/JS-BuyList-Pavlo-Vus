const addButton = document.querySelector('.add-button');
const input = document.querySelector('.add-input');
const productList = document.querySelector('.product-list');

function addProduct(name, amount = 1, bought = false) {
    const productItem = document.createElement('div');
    productItem.className = 'product';

    const productName = document.createElement('span');
    productName.className = 'name';
    productName.textContent = name;
    productName.setAttribute('data-tooltip', 'Змінити назву');
    if (bought) productName.classList.add('crossed');

    const amountBar = document.createElement('div');
    amountBar.className = 'amount-bar';

    const minusButton = document.createElement('button');
    minusButton.className = 'change-button minus';
    minusButton.textContent = '-';
    minusButton.setAttribute('data-tooltip', 'Відняти одиницю');
    minusButton.disabled = amount <= 1;

    const amountAvailable = document.createElement('span');
    amountAvailable.className = 'amount-available';
    amountAvailable.textContent = amount;

    const plusButton = document.createElement('button');
    plusButton.className = 'change-button plus';
    plusButton.textContent = '+';
    plusButton.setAttribute('data-tooltip', 'Додати одиницю');

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = '×';
    deleteButton.setAttribute('data-tooltip', 'Видалити');

    const productCondition = document.createElement('div');
    productCondition.className = 'product-condition';

    const currentCondition = document.createElement('button');
    currentCondition.className = 'condition';
    currentCondition.textContent = bought ? 'Куплено' : 'Не куплено';
    currentCondition.setAttribute('data-tooltip', bought ? 'Прибрати товар' : 'Купити товар');

    productCondition.append(currentCondition);
    if (!bought) productCondition.append(deleteButton);

    if (bought) {
        amountBar.append(amountAvailable);
    } else {
        amountBar.append(minusButton, amountAvailable, plusButton);
    }

    productItem.append(productName, amountBar, productCondition);
    productList.append(productItem);

    updateStats();
    setupProductEvents(productItem, plusButton, minusButton, deleteButton, amountAvailable, productCondition, currentCondition, productName, amountBar);
    saveToLocalStorage();
}

addButton.addEventListener('click', () => {
    const name = input.value.trim();
    if (name !== '') {
        addProduct(name);
        input.value = '';
    }
    input.focus();
})

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addButton.click();
    }
})

function setupProductEvents(productItem, plusButton, minusButton, deleteButton, amountAvailable, productCondition, currentCondition, productName, amountBar) {
    if (deleteButton) deleteButton.addEventListener('click', () => { deleteProduct(productItem); });

    if (plusButton) plusButton.addEventListener('click', () => { increaseQuantity(amountAvailable, minusButton); });
    if (minusButton) minusButton.addEventListener('click', () => { reduceQuantity(amountAvailable, minusButton); });

    currentCondition.addEventListener('click', () => { changeCondition(currentCondition, productCondition, productName, amountBar, plusButton, minusButton, amountAvailable, deleteButton); });

    productName.addEventListener('click', () => { changeName(productItem, productName); });
}

function deleteProduct(productItem) {
    productItem.remove();
    updateStats();
    saveToLocalStorage();
}

function reduceQuantity(amountAvailable, minusButton) {
    let currentAmount = parseInt(amountAvailable.textContent);
        if (currentAmount > 1) {
        amountAvailable.textContent = --currentAmount;
        if (currentAmount === 1) minusButton.disabled = true;
        
        updateStats();
    }
    saveToLocalStorage();
}

function increaseQuantity(amountAvailable, minusButton) {
    let currentAmount = parseInt(amountAvailable.textContent);
    amountAvailable.textContent = currentAmount + 1;
    minusButton.disabled = false;
    updateStats();
    saveToLocalStorage();
}

function changeCondition(currentCondition, productCondition, productName, amountBar, plusButton, minusButton, amountAvailable, deleteButton) {
    const isBought = currentCondition.textContent === 'Не куплено';

    if (isBought) {
        currentCondition.textContent = 'Куплено';
        currentCondition.setAttribute('data-tooltip', 'Прибрати товар');
        productName.classList.add('crossed');

        deleteButton.remove();
        plusButton.remove();
        minusButton.remove();
        amountBar.innerHTML = '';
        amountBar.append(amountAvailable);
    } else {
        currentCondition.textContent = 'Не куплено';
        currentCondition.setAttribute('data-tooltip', 'Купити товар');
        productName.classList.remove('crossed');

        if (!productCondition.contains(deleteButton)) {
            productCondition.append(deleteButton);
        }

        amountBar.innerHTML = '';
        amountBar.append(minusButton, amountAvailable, plusButton);
    }

    updateStats();
    saveToLocalStorage();
}

function changeName(productItem, productName) {
    const input = document.createElement('input');
    input.className = 'name-input';
    input.value = productName.textContent;
    productItem.replaceChild(input, productName);
    input.focus();

    input.addEventListener('blur', () => {
        const newName = document.createElement('span');
        newName.className = 'name';
        newName.textContent = input.value.trim() || 'Без назви';
        newName.setAttribute('data-tooltip', 'Змінити назву');
        productItem.replaceChild(newName, input);

        setupProductEvents(productItem);
        updateStats();
        saveToLocalStorage();
    });
}

function updateStats() {
    const boughtProducts = document.getElementById('bought');
    const notBoughtProducts = document.getElementById('not-bought');

    boughtProducts.innerHTML = '';
    notBoughtProducts.innerHTML = '';
    
    document.querySelectorAll('.product-list .product').forEach(product => { createStatOfProduct(product, boughtProducts, notBoughtProducts); });
}

function createStatOfProduct(product, boughtProducts, notBoughtProducts) {
    const name = product.querySelector('.name')?.textContent;
    const amount = product.querySelector('.amount-available')?.textContent;
    const condition = product.querySelector('.condition')?.textContent;
    
    if(name && amount && condition) {
        const statsItem = document.createElement('span');
        statsItem.className = 'product-item';

        const statName = document.createElement('span');
        statName.className = 'product-name';
        statName.textContent = name;

        const statAmount = document.createElement('span');
        statAmount.className = 'product-amount';
        statAmount.textContent = amount;
    
        statsItem.append(statName, statAmount);
        const isBought = condition === 'Куплено';
        if (isBought) {
            statName.classList.add('crossed');
            statAmount.classList.add('crossed');
            boughtProducts.append(statsItem);
        } else {
            notBoughtProducts.append(statsItem);
        }
    }
}

function saveToLocalStorage() {
    const products = [];

    document.querySelectorAll('.product-list .product').forEach(product => {
        const name = product.querySelector('.name')?.textContent;
        const amount = parseInt(product.querySelector('.amount-available')?.textContent) || 1;
        const bought = product.querySelector('.condition')?.textContent === 'Куплено';
        if (name) {
            products.push({ name, amount, bought });
        }
    });

    localStorage.setItem('products', JSON.stringify(products));
}

function loadFromLocalStorage() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.forEach(product => {
        addProduct(product.name, product.amount, product.bought);
    });
}

window.addEventListener('beforeunload', saveToLocalStorage);
window.addEventListener('load', loadFromLocalStorage);

/*window.onload = () => {
    addProduct('Приклад товару', 1, false);
    addProduct('Інший товар', 2, true);
    addProduct('Ще один товар', 3, false);
}*/