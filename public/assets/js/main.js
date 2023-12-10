const socket = io('https://webchat-app-lweu.onrender.com')

// Service messagerie
const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')
const chatDisplay = document.querySelector('.chat')
const activity = document.querySelector('.activity')
const usersList = document.querySelector('.userList')
const roomList = document.querySelector('.roomList')
const userActiveText = document.querySelector('#userActiveText');

// Menu utilisateurs présents
const arrow = document.querySelector('#arrow-dwn');
const selectBtn = document.querySelector('#select-btn');
// Bandeau secondaire
const accTitle = document.querySelector('#title');
const accountMenu = document.querySelector('#account-menu');

arrow.addEventListener('click', function () {
    selectBtn.classList.toggle("open");
});

// 

function sendMessage(e) {
    e.preventDefault()
    if (nameInput.value && msgInput.value && chatRoom.value) {
        socket.emit('message', {
            name: nameInput.value,
            text: msgInput.value
        })
        msgInput.value = ""
    }
    msgInput.focus()
}

function enterRoom(e) {
    e.preventDefault()
    if (nameInput.value && chatRoom.value) {
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        })
        document.querySelector('#chatMessages').innerHTML = "";
    }
}

function enterApp(e) {
    e.preventDefault()
    if (nameInput.value) {
        document.querySelector('.login').classList.toggle("hidden", true)
        document.querySelector('#chatContainer').classList.toggle("hidden", false)
    }
}

// function leaveApp(e) {
//     e.preventDefault()
//     nameInput.value = "";
//     chatRoom.value = "";
//     document.querySelector('.login').classList.toggle("hidden", false)
//     document.querySelector('#chatContainer').classList.toggle("hidden", true)
// }

document.querySelector('.form-msg')
    .addEventListener('submit', sendMessage)

document.querySelector('.form-join')
    .addEventListener('submit', enterRoom)

document.querySelector('.login-form')
    .addEventListener('submit', enterApp)



msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value)
})

// Listening for messages :
socket.on('message', (data) => {
    activity.textContent = ""
    const { name, text, time } = data
    const li = document.createElement('li')
    li.className = 'post'
    if (name === nameInput.value) li.className = 'post post--left'
    if (name !== nameInput.value && name !== 'Admin') li.className = 'post post--right'
    if (name === 'Admin') li.className = "post post--center"

    if (name !== 'Admin') {
        li.innerHTML = `<div class="post__header ${name === nameInput.value ? 'post__header--user' : 'post__header--reply'}">
        <span class="post__header--name">${name}</span>
        <span class="post__header--time">${time}</span>
        </div><div class="post__text">${text}</div>`
    } else {
        li.innerHTML = `<div class="post__text">${text}</div>`
    }
    document.querySelector('#chatMessages').appendChild(li)

    chatDisplay.scrollTop = chatDisplay.scrollHeight
})

// Listening for activities :
let activityTimer
socket.on('activity', (name) => {
    activity.textContent = `${name} is typing...`

    // Clear after 3 seconds
    clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
        activity.textContent = ""
    }, 3000)
})

socket.on('userList', ({ users }) => {
    showUsers(users)
})

socket.on('roomList', ({ rooms }) => {
    showRooms(rooms)
})

function showUsers(users) {
    usersList.innerHTML = ""
    userActiveText.innerHTML = `<p>Users in ${chatRoom.value}: </p>`

    if (users) {
        users.forEach((user, i) => {
            const li = document.createElement('li')
            li.innerHTML = `${user.name}`
            usersList.appendChild(li)
        });
        document.querySelector('#select-btn').classList = 'select-btn'
    } else document.querySelector('#select-btn').classList = 'select-btn hidden'
}


function showRooms(rooms) {
    roomList.innerHTML = ""
    if (rooms) {
        rooms.forEach((room, i) => {
            const li = document.createElement('li')
            li.innerHTML = `<img class="avatar" src="https://t4.ftcdn.net/jpg/02/01/10/87/360_F_201108775_UMAoFXBAsSKNcr53Ip5CTSy52Ajuk1E4.jpg"> <h1 class="username">${room}</h1>`
            roomList.appendChild(li)
            // When group clicked, join it.
            if (room != chatRoom.value) {
                li.addEventListener('click', (e) => {
                    chatRoom.value = room
                    enterRoom(e)
                })
            }
        });

        roomList.scrollTop = roomList.scrollHeight
    }


}

