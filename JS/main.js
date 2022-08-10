// Selectors

const distanceLimit = 5 * 60 * 60000
// const IOIDate = "2022-08-10T12:43:00"
const IOIDate = "2022-08-10T18:00:00"
const hourReset = 5;
const oneMinute = 60000
const toDoInput = document.querySelector('.todo-input');
const toDoInput2 = document.querySelector('.todo-input-2');
const toDoBtn = document.querySelector('.todo-btn');
const toDoList = document.querySelector('.todo-list');
const standardTheme = document.querySelector('.standard-theme');
const lightTheme = document.querySelector('.light-theme');
const darkerTheme = document.querySelector('.darker-theme');
const stopBtn = document.querySelector('#stop-time-button');
const startBtn = document.querySelector('#start-time-button');
const resetBtn = document.querySelector('#reset-time-button');
const setDateBtn = document.querySelector('#set-date-button');
const refreshDateBtn = document.querySelector("#refresh-date-button")
const announcementBtn = document.querySelector("#myBtn");


// Event Listeners

toDoBtn.addEventListener('click', addToDo);
toDoList.addEventListener('click', deletecheck);
document.addEventListener("DOMContentLoaded", getTodos);

standardTheme.addEventListener('click', () => changeTheme('standard'));
lightTheme.addEventListener('click', () => changeTheme('light'));
darkerTheme.addEventListener('click', () => changeTheme('darker'));
stopBtn.addEventListener('click', () => stopInterval());
startBtn.addEventListener('click', () => startInterval());
resetBtn.addEventListener('click', () => resetInterval());
setDateBtn.addEventListener('click', () => setDate());
announcementBtn.addEventListener('click', () => resetTimeAnnouncement())
refreshDateBtn.addEventListener('click', () => refreshDate())


// Check if one theme has been set previously and apply it (or std theme if not found):
let savedTheme = localStorage.getItem('savedTheme');
savedTheme === null ?
    changeTheme('darker')
    : changeTheme(localStorage.getItem('savedTheme'));

// Functions;
function addToDo(event) {
    // Prevents form from submitting / Prevents form from relaoding;
    event.preventDefault();

    // toDo DIV;
    const toDoDiv = document.createElement("div");
    toDoDiv.classList.add('todo', `${savedTheme}-todo`);

    // Create LI
    const newToDo = document.createElement('li');
    if (toDoInput.value === '') {
        alert("You must write something!");
    } else {
        var val = toDoInput2.value.slice(0, 5) + " - " + toDoInput.value
        newToDo.innerText = val;
        newToDo.classList.add('todo-item');
        toDoDiv.appendChild(newToDo);

        // Adding to local storage;
        savelocal(val);

        const deleted = document.createElement('button');
        deleted.innerHTML = '<i class="fas fa-trash"></i>';
        deleted.classList.add('delete-btn', `${savedTheme}-button`);
        toDoDiv.appendChild(deleted);

        // Append to list;
        toDoList.appendChild(toDoDiv);

        // CLearing the input;
        toDoInput.value = '';
        toDoInput2.value = '';
    }

}


function deletecheck(event) {

    // console.log(event.target);
    const item = event.target;

    // delete
    if (item.classList[0] === 'delete-btn') {
        // item.parentElement.remove();
        // animation
        item.parentElement.classList.add("fall");

        //removing local todos;
        removeLocalTodos(item.parentElement);

        item.parentElement.addEventListener('transitionend', function () {
            item.parentElement.remove();
        })
    }

    // check
    if (item.classList[0] === 'check-btn') {
        item.parentElement.classList.toggle("completed");
    }


}

async function fetchAsync(url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

const url_backend = "http://35.240.148.140"
const add_backend = "http://35.240.148.140/add/"
const del_backend = "http://35.240.148.140/del/"
let todos = {}

// Saving to local storage:
function savelocal(todo) {
    fetchAsync(add_backend + todo).then(resp => {
        return resp
    })
}

async function grabRemote() {
    return await fetchAsync(url_backend).then(resp => {
        return resp
    })
}

function getTodos() {
    //Check: if item/s are there;
    fetchAsync(url_backend).then(resp => {
        // console.log(resp)
        // console.log(todos)
        if ( JSON.stringify(resp) !== JSON.stringify(todos)) {
            toDoList.innerHTML = ""
            for (const [key, value] of Object.entries(resp)) {
                // console.log(key, value);
                // toDo DIV;
                const toDoDiv = document.createElement("div");
                toDoDiv.classList.add("todo", `${savedTheme}-todo`);
                //
                //     // Create LI
                const newToDo = document.createElement('li');
                //
                newToDo.innerText = value;
                newToDo.classList.add('todo-item');
                toDoDiv.appendChild(newToDo);
                //
                //     // delete btn;
                const deleted = document.createElement('button');
                deleted.innerHTML = '<i class="fas fa-trash"></i>';
                deleted.classList.add("delete-btn", `${savedTheme}-button`);
                toDoDiv.appendChild(deleted);
                //
                //     // Append to list;
                toDoList.appendChild(toDoDiv);
            }
            todos = resp
        }

    })
}


function removeLocalTodos(todo) {
    // console.log(todo)
    const text = todo.children[0].innerText

    fetchAsync(url_backend).then(resp => {
        for (const [key, value] of Object.entries(resp)) {
            if (value === text) {
                fetchAsync(del_backend + key).then(resp => {
                    // console.log("OK")
                })
                break
            }
        }
    })
}

// Change theme function:
function changeTheme(color) {
    localStorage.setItem('savedTheme', color);
    savedTheme = localStorage.getItem('savedTheme');

    document.body.className = color;
    // Change blinking cursor for darker theme:
    color === 'darker' ?
        document.getElementById('title').classList.add('darker-title')
        : document.getElementById('title').classList.remove('darker-title');

    document.querySelector('input').className = `${color}-input`;
    // Change todo color without changing their status (completed or not):
    document.querySelectorAll('.todo').forEach(todo => {
        Array.from(todo.classList).some(item => item === 'completed') ?
            todo.className = `todo ${color}-todo completed`
            : todo.className = `todo ${color}-todo`;
    });
    // Change buttons color according to their type (todo, check or delete):
    document.querySelectorAll('button').forEach(button => {
        Array.from(button.classList).some(item => {
            if (item === 'check-btn') {
                button.className = `check-btn ${color}-button`;
            } else if (item === 'delete-btn') {
                button.className = `delete-btn ${color}-button`;
            } else if (item === 'todo-btn') {
                button.className = `todo-btn ${color}-button`;
            }
        });
    });
}

const hourResetTime = hourReset * 60 * oneMinute
let timeDuration = -1;
const offset = -(new Date).getTimezoneOffset() / 60; // 7
const offsetTime = offset * 60 * oneMinute

function getNextReset() {
    // return new Date(Date.now() + hourResetTime).getTime();
    // console.log(new Date(IOIDate))
    return new Date(IOIDate).getTime()
}

function getNextByDuration() {
    if (timeDuration !== -1) {
        return new Date(Date.now() + timeDuration).getTime();
    } else {
        return getNextReset();
    }
}

// Set the date we're counting down to
let countDownDate = getNextReset();

let interval = null;

function resetTimeAnnouncement() {
    const nextTime = (new Date(Date.now() + offsetTime)).toISOString().slice(11, 16);
    document.getElementById("form2").value = nextTime;
    // console.log(nextTime);
}

function refreshDate() {
    // document.getElementById('time-input').value = (new Date(Date.now() + hourResetTime + offsetTime)).toISOString().slice(0, 19);
    const oldDate = new Date(IOIDate)
    const tmpRef = new Date(oldDate.getTime() + offsetTime).toISOString();
    document.getElementById('time-input').value = tmpRef.slice(0, 16);
}


let countDownFunc = function () {

    // Get today's date and time
    let now = new Date().getTime();

    // Find the distance between now and the count down date
    let distance = countDownDate - now;
    timeDuration = distance;
    let notStart = distance > distanceLimit;
    if(distance > distanceLimit) distance -= distanceLimit
    // Time calculations for days, hours, minutes and seconds
    // let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    let secString = String(seconds).padStart(2, '0');
    let minString = String(minutes).padStart(2, '0');
    // console.log(distance)
    // console.log(notStart)
    // console.log(distanceLimit)
    // If the count down is finished, write some text
    if(notStart) {

        document.getElementById("title").innerHTML = "Time to start:";
        document.getElementById("demo").innerHTML = "-"+ hours + ":"
        + minString + ":" + secString;
        return;
    }
    if (distance < 0) {
        document.getElementById("title").innerHTML = "Time left:";
        document.getElementById("demo").innerHTML = "0:00:00";
    } else {
        document.getElementById("title").innerHTML = "Time left:";
        document.getElementById("demo").innerHTML = hours + ":"
        + minString + ":" + secString;
    }
    // console.log(countDownDate)
}

function stopInterval() {
    clearInterval(interval);
    document.getElementById("title").innerHTML = "Time left: (paused)";
}

function startInterval() {
    stopInterval()
    countDownDate = getNextByDuration();
    document.getElementById("title").innerHTML = "Time left:";
    interval = setInterval(countDownFunc, 100);
}

function resetInterval() {
    countDownDate = getNextReset();
    // timeDuration = hourResetTime;
    document.getElementById("demo").innerHTML = `${hourReset}:00:00`
    // console.log(countDownDate)
}

function setDate() {
    // console.log("here")
    const timeElem = document.querySelector("#time-input").value
    if (!timeElem) futureTime = getNextReset()
    else futureTime = new Date(timeElem)
    countDownDate = futureTime
    countDownFunc()
}

document.addEventListener('keydown', function (e) {
    // console.log(e)
    // console.log(modal.style.display)
    resetTimeAnnouncement();
    if (e.key == '`') {
        if (modal.style.display === "none") {
            modal.style.display = "block";
        } else {
            modal.style.display = "none";
        }
    }
});

refreshDate();
// resetInterval();
startInterval();

setInterval(getTodos, 1000)
