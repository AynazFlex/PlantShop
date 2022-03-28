"use strict"

/* глобальные переменные и навигация по DOM index.html*/
const plantsDropdown = document.body.querySelector('.plants__dropdown'); // выпадающий список из блока растений
const plantsDropdownSelected = document.body.querySelector('.plants__drop-item_selected') // выбранный элемент выпадающего списка из блока растений
const buttonOpenModal = document.body.querySelector('.header__form-button'); // кнопка для открытия модального окна
const modalWindow = document.body.querySelector('.modal-window'); // модальное окно
const cancelForm = document.body.querySelector('.modal-window__button_cancel'); // отмена формы
const buttonCloseModal = document.body.querySelector('.modal-window__close'); // закрытие модального окна
const form = document.forms[0]; // форма модального окна
const formName = form.name; // поле ввода имени
const formTel = form.tel; // поле ввода телефона
const warningFormValid = document.body.querySelector('.modal-window__warning'); // подсказка валидности полей ввода формы
const modalWindowFormPanel = document.body.querySelector('.modal-window__form-panel'); // каркас формы (родительский элемент)
const loaderSpinner = document.body.querySelector('.modal-window__load-spinner'); // спиннер для ожидание получения json данных


/* слушатели событий */

plantsDropdown.onclick = (event) => { // выпадающий список из блока растений
    plantsDropdown.classList.toggle('plants__dropdown_close');
    if(event.target.closest('.plants__drop-item')) {
        const elemForSlected = event.target;
        plantsDropdownSelected.textContent = elemForSlected.textContent;
    }
}

plantsDropdown.onblur = () => { // выпадающий список из блока растений
    plantsDropdown.classList.add('plants__dropdown_close');
}

buttonOpenModal.onclick = () =>{ // открыть модальное окно
    modalWindow.classList.remove('modal-window_close');
    document.body.style.overflow = 'hidden';
    warningModalPassive();
}

cancelForm.addEventListener('click', closeModalWindow); // закрытие модального окна
buttonCloseModal.addEventListener('click', closeModalWindow); // закрытие модального окна

formName.oninput = () => { // валидация формы для Имени
    if(formName.value.length < 3) {
        warningModalActive(formName, 'имя должно быть не менее 3-х символов')
        formName.onblur = () => {
            formName.focus();
        }
    } else {
        warningModalPassive();
        formName.onblur = null;
    }
}

formTel.oninput = () => { // валидация формы для Телефона
    if(!(formTel.value.slice(0, 2) == '+7' && formTel.value.length == 12) && !(formTel.value[0] == '8' && formTel.value.length == 11)) {
        warningModalActive(formTel, 'телефон должен начинаться с +7 или 8, за которыми следуют еще 10 цифр')
        formTel.onblur = () => {
            formTel.focus();
        }
    } else {
        warningModalPassive();
        formTel.onblur = null;
    }
}

form.onsubmit = event => { // отправка формы и получения json данных 
    event.preventDefault();
    if(warningFormValid.style.display == 'block' || !formTel.value || !formName.value) { // проверка полей ввода формы
        alert('заполните форму правильно');
        return;
    }
    modalWindowFormPanel.style.display = 'none'; // каркас формы 
    loaderSpinner.style.display = ''; // активация спиннера
    dataForTable() // получем данные из url json данных
    .then((data) => {
        loaderSpinner.style.display = 'none'; // отключение спиннера
        createTable(data); // создание таблицы из массива полученных обЪектов из url
    })
    .catch((err) => {
        loaderSpinner.style.display = 'none'; // отключение спиннера
        errorGet(err); // при ошибки получения данных из url
    })
    .finally(() => {
        modalWindow.onclick = event => { // возврощаем в исходное состочние веб сайт
            if(event.target.closest('table') || event.target.closest('.error')) return
            modalWindow.querySelector('table') ? modalWindow.querySelector('table').remove() :  modalWindow.querySelector('.error').remove()
            modalWindowFormPanel.style.display = ''; // каркас формы
            closeModalWindow(); // закрытие модального окна
            modalWindow.onclick = null;
        }
    });
}

/* функции */

function closeModalWindow() { // функция для закрытие модального окна
    formName.value = '';
    formTel.value = '';
    modalWindow.classList.add('modal-window_close');
    document.body.style.overflow = 'scroll';
}

function warningModalActive(element, text) { // функция для вкючения предупреждения валидности ввода полей
    warningFormValid.style.display = 'block';
    warningFormValid.textContent = text;
    warningFormValid.style.left = element.getBoundingClientRect().left + 'px';
    warningFormValid.style.top = element.getBoundingClientRect().bottom + 5 + 'px';
}

function warningModalPassive() { // функция для отключения предупреждения валидности ввода полей
    warningFormValid.style.display = 'none';
    warningFormValid.textContent = '';
    warningFormValid.style.left = 0;
    warningFormValid.style.top = 0;
}

async function getAfterSubmitForm() { // асинхронная функция для получения массиа данных из url
    const response = await fetch('https://jsonplaceholder.typicode.com/todos');
    if(response.ok) return await response.json();
    return response.status;
}

async function dataForTable() { // обработка полученных данных из url 
    const data = await getAfterSubmitForm();
    if(data >= 400) throw new Error(`Ошибка ${data}`)
    const dataFilter = data.filter(obj => obj.userId === 5 && obj.completed === false)
    return dataFilter;
}
  
function fun1(obj) { // вспомогательная функция для создания заголовка таблицы
    return Object.keys(obj).map(key => typeof obj[key] === 'object' ? fun1(obj[key]).join('') : `<th>${key}</th>`); 
}
function fun2(obj) { // вспомогательная функция для создания тела таблицы
    return Object.values(obj).map(e => typeof e === 'object' ? fun2(e).join('') : `<td>${e}</td>`); 
}
  
function createTable(data) { // динамически создает таблицу из массива обЪектов произвольного размера и произвольного количества ключей объектов и любой вложенности объектов
    const div = document.createElement('div');
    modalWindow.append(div);
    div.innerHTML = `<table><tbody></tbody></table>`
    const table = div.querySelector('tbody');
    table.innerHTML = `<tr>${fun1(data[0]).join('')}</tr>`;
    data.forEach(e => table.innerHTML += `<tr>${fun2(e).join('')}</tr>`);
}

function errorGet(errorText) { // при ошибки получения данных из url
    const div = document.createElement('div');
    modalWindow.append(div);
    div.className = 'error';
    div.textContent = errorText;
}