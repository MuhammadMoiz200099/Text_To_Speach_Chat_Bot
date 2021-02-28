let state = {
    conversationData: {},
    inputMessage: '',
    currentConversation: [],
    botName: 'Urwah',
    userName: ''
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

window.onload = function() {
    initStorage();
    checkoutStorageData();
    if (!state.userName) {
        $('#infoModal').modal({ backdrop: 'static', keyboard: false });
        handleKey();
    }
    readTextFile("./conversation.json", function(text) {
        var data = JSON.parse(text);
        state.conversationData = data.speach;
    });
    updateConvoBox();
}

function initStorage() {
    if (!localStorage.getItem('chatStore')) {
        resetStorage();
    }
}

function checkoutStorageData() {
    const storage = JSON.parse(localStorage.getItem('chatStore')) || {}
    if (Object.entries(storage).length) {
        state.currentConversation = storage.currentConversation;
        state.userName = storage.userName
    }
    if (state.currentConversation.length) {
        updateChatBox();
    }
    if (state.userName) {
        updateUser();
    }
}

function handleModel() {
    const storage = JSON.parse(localStorage.getItem('chatStore')) || {}
    const name = document.getElementById('modelName').value;
    if (name && name.length > 3) {
        storage.userName = name;
        state.userName = name;
        document.getElementById('modelName').value = '';
        $('#infoModal').modal('hide');
        updateUser();
    } else {
        alert("Please fill the form correctly");
    }
    localStorage.setItem('chatStore', JSON.stringify(storage));
}

function removeUser() {
    state = {
        conversationData: {},
        inputMessage: '',
        currentConversation: [],
        botName: 'Urwah',
        userName: ''
    }
    $('#infoModal').modal({ backdrop: 'static', keyboard: false });
    document.getElementById('user').innerHTML = '';
    clearChat();
    resetStorage();
}

function resetStorage() {
    localStorage.setItem('chatStore', JSON.stringify({
        currentConversation: [],
        userName: ''
    }));
}

function updateUser() {
    const userDiv = document.getElementById('user');
    userDiv.innerHTML = `
        <div id="username">${state.userName}</div>
        <i class="fa fa-power-off"></i>    
    `
}

function handleKey() {
    document.getElementById('modelName').addEventListener('keypress', (event) => {
        if (event.code === 'Enter') {
            event.preventDefault();
            handleModel()
        }
    });
}

document.getElementById('messageInput').addEventListener('keypress', (event) => {
    if (event.code === 'Enter') {
        state.inputMessage = document.getElementById('messageInput').value;
        document.getElementById('messageInput').value = '';
        getConversation();
    }
});

function getConversation() {
    const storage = JSON.parse(localStorage.getItem('chatStore')) || {};
    const keys = Object.keys(state.conversationData);
    if (keys.includes(state.inputMessage.toLowerCase())) {
        state.currentConversation.unshift({
            id: Date.now(),
            me: state.inputMessage,
            bot: state.conversationData[state.inputMessage]
        });
    } else {
        state.currentConversation.unshift({
            id: Date.now(),
            me: state.inputMessage,
            bot: "Sorry, i did not understand."
        });
    }
    storage.currentConversation = state.currentConversation;
    localStorage.setItem('chatStore', JSON.stringify(storage));
    updateChatBox();
}

function updateConvoBox() {
    const box = document.getElementById('convoBox');
    if (state.currentConversation.length) {
        box.style.display = 'block'
    } else {
        box.style.display = 'none'
    }
}

function updateChatBox() {
    updateConvoBox();
    const chatBox = document.getElementById('chat-box');
    let chatItems = '';
    state.currentConversation.forEach((item) => {
        chatItems += `
            <div class="message-container">
                <i class="fa fa-times" onclick="removeItem(${item.id})"></i>
                <div class="incomming">
                    <div class="user-message">
                        <div class="message">${item.me}</div>
                        <i class="fa fa-microphone icon-clickable mt-1 ml-2" onclick="voice('${item.me}')"></i>
                    </div>
                    <div class="time-read">
                        ${getTime()}
                        <i class="fa fa-check"></i>
                    </div>
                </div>
                <div class="outgoing">
                    <div class="bot-message">
                        <div class="message">${item.bot}</div>
                        <i class="fa fa-microphone icon-clickable mt-1 ml-2" onclick="voice('${item.bot}')"></i>
                    </div>
                    <div class="time-read">
                        ${getTime()}
                        <i class="fa fa-check"></i>
                    </div>
                </div>
            </div>
        `
    });
    chatBox.innerHTML = ''
    chatBox.innerHTML = chatItems;
}

function removeItem(itemId) {
    const storage = JSON.parse(localStorage.getItem('chatStore')) || {};
    state.currentConversation = state.currentConversation.filter((item) => item.id != itemId);
    storage.currentConversation = state.currentConversation;
    localStorage.setItem('chatStore', JSON.stringify(storage));
    updateChatBox();
}

function getTime() {
    const time = new Date();
    return time.getHours() + ':' + time.getMinutes();
}

function clearChat() {
    const storage = JSON.parse(localStorage.getItem('chatStore')) || {};
    state.currentConversation = []
    storage.currentConversation = state.currentConversation
    localStorage.setItem('chatStore', JSON.stringify(storage));
    updateChatBox();
}

function voice(message) {
    const speakLib = new SpeechSynthesisUtterance();
    const voices = window.speechSynthesis.getVoices();
    speakLib.voice = voices[1];
    speakLib.text = message.toLowerCase();
    speakLib.lang = 'en-US';
    window.speechSynthesis.speak(speakLib);
}