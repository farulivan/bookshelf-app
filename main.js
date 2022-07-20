const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', () => {
    const submitForm = document.getElementById('inputBookForm');
    submitForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addBook();
    })

    if (isStorageExist()) {
        loadDataFromStorage();
    }

    const submitSearch = document.getElementById('searchBook');
    submitSearch.addEventListener('submit', (event) => {
        event.preventDefault();
        searchBook();
    })
})

function searchBook() {
    const bookItem = document.querySelectorAll('.bookItem');
    const search = document.getElementById('search').value;

    for (let i = 0; i < bookItem.length; i++) {
        if (bookItem[i].firstChild.innerText.toLowerCase().includes(search.toLowerCase())) {
            bookItem[i].classList.remove('hide');
        } else {
            bookItem[i].classList.add('hide');
        }
    }
}

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').valueAsNumber;
    const isCompleted = isComplete();
    const generatedID = generateID();

    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isCompleted);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}


function generateID() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function isComplete() {  
    const isCompletedValue = document.querySelector('input[name="readingStatus"]:checked').value;
    return JSON.parse(isCompletedValue);
}

document.addEventListener(RENDER_EVENT, () => {

    const onProgressList = document.getElementById('onProgressList');
    onProgressList.innerHTML = '';

    const completedList = document.getElementById('completedList');
    completedList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) {
            onProgressList.append(bookElement);
        } else {
            completedList.append(bookElement);
        }
    }
})

function makeBook(bookObject) {
    const {id, title, author, year, isCompleted} = bookObject;
    
    const textTitle = document.createElement('h3');
    textTitle.innerText = title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = 'Author: ' + author;

    const textYear = document.createElement('p');
    textYear.innerText = 'Year: ' + year;

    const greenButton = document.createElement('button');
    greenButton.classList.add('green');

    const redButton = document.createElement('button');
    redButton.classList.add('red');
    redButton.innerText = 'Delete';

    redButton.addEventListener('click', () => {
        const overlay = document.getElementById('overlay');
        overlay.classList.add('show');
        
        const confirm = document.getElementById('confirm-box');
        confirm.addEventListener('click', (e) => {
            if (e.target.className == 'close' || e.target.className == 'no') {
                overlay.classList.remove('show');
            } else if (e.target.className == 'yes') {
                overlay.classList.remove('show');
                removeBook(id);
            }
        })
    })

    const action = document.createElement('div')
    action.classList.add('action');
    action.append(greenButton);
    action.append(redButton);

    const textContainer = document.createElement('article')
    textContainer.classList.add('bookItem');
    textContainer.append(textTitle, textAuthor, textYear, action);
    textContainer.setAttribute('id', 'book-' + id)

    if (isCompleted) {
        greenButton.innerText = 'On Progress';
        greenButton.classList.add('onprogress');
        greenButton.addEventListener('click', () => {
            moveToOnProgress(id);
        })
    } else {
        greenButton.innerText = 'Completed';
        greenButton.classList.add('completed');
        greenButton.addEventListener('click', () => {
            moveToCompleted(id);
        })

    }

    return textContainer;
}

function moveToOnProgress(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function moveToCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Your browser does not support local storage');
        return false;
    }

    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveBook() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(SAVED_EVENT, () => {
    showSnackbar();
})

function showSnackbar() {
    var snackbar = document.getElementById('snackbar');
    snackbar.className = 'show';
    setTimeout( () => {
        snackbar.className = snackbar.className.replace('show', '');
    }, 3000);
}