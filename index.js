window.onload = function() {
  const firebaseConfig = {
    apiKey: "AIzaSyABzplPbhYqGersTJqmlPdfyZpY41BZz8Q",
    authDomain: "chat-app-acb2a.firebaseapp.com",
    databaseURL: "https://chat-app-acb2a-default-rtdb.firebaseio.com",
    projectId: "chat-app-acb2a",
    storageBucket: "chat-app-acb2a.appspot.com",
    messagingSenderId: "566112619857",
    appId: "1:566112619857:web:f10e8d25c8f728595b9770"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  class MEME_CHAT {
    home() {
      document.body.innerHTML = '';
      this.createTitle();
      this.createJoinForm();
    }

    chat() {
      this.createTitle();
      this.createChatUI();
    }

    createTitle() {
      const titleContainer = this.createElement('div', { id: 'title_container' });
      const titleInnerContainer = this.createElement('div', { id: 'title_inner_container' });
      const title = this.createElement('h1', { id: 'title', textContent: '9 3 8' });
      
      
      titleInnerContainer.append(title);
      titleContainer.append(titleInnerContainer);
      document.body.append(titleContainer);
    }

    createJoinForm() {
      const joinContainer = this.createElement('div', { id: 'join_container' });
      const joinInnerContainer = this.createElement('div', { id: 'join_inner_container' });
      const joinButtonContainer = this.createElement('div', { id: 'join_button_container' });
      const joinButton = this.createElement('button', { id: 'join_button', innerHTML: 'Join <i class="fas fa-sign-in-alt"></i>' });
      const joinInputContainer = this.createElement('div', { id: 'join_input_container' });
      const joinInput = this.createElement('input', {
        id: 'join_input',
        maxlength: 15,
        placeholder: "No.... It's Patrick Star",
        onkeyup: () => this.handleJoinInput(joinInput, joinButton)
      });

      joinButtonContainer.append(joinButton);
      joinInputContainer.append(joinInput);
      joinInnerContainer.append(joinInputContainer, joinButtonContainer);
      joinContainer.append(joinInnerContainer);
      document.body.append(joinContainer);
    }

    handleJoinInput(joinInput, joinButton) {
      if (joinInput.value.length > 0) {
        joinButton.classList.add('enabled');
        joinButton.onclick = () => {
          this.saveName(joinInput.value);
          document.getElementById('join_container').remove();
          this.createChatUI();
        };
      } else {
        joinButton.classList.remove('enabled');
      }
    }

    createChatUI() {
      const titleContainer = document.getElementById('title_container');
      const title = document.getElementById('title');
      titleContainer.classList.add('chat_title_container');
      title.classList.add('chat_title');

      const chatContainer = this.createElement('div', { id: 'chat_container' });
      const chatInnerContainer = this.createElement('div', { id: 'chat_inner_container' });
      const chatContentContainer = this.createElement('div', { id: 'chat_content_container' });
      const chatInputContainer = this.createElement('div', { id: 'chat_input_container' });
      const chatInputSend = this.createElement('button', {
        id: 'chat_input_send',
        disabled: true,
        innerHTML: `<i class="far fa-paper-plane"></i>`
      });
      const chatInput = this.createElement('input', {
        id: 'chat_input',
        maxlength: 1000,
        placeholder: `${this.getName()}. Say something...`,
        onkeyup: () => this.handleChatInput(chatInput, chatInputSend)
      });
      const chatLogoutContainer = this.createElement('div', { id: 'chat_logout_container' });
      const chatLogout = this.createElement('button', {
        id: 'chat_logout',
        textContent: `${this.getName()} • logout`,
        onclick: () => {
          localStorage.clear();
          this.home();
        }
      });

      chatLogoutContainer.append(chatLogout);
      chatInputContainer.append(chatInput, chatInputSend);
      chatInnerContainer.append(chatContentContainer, chatInputContainer, chatLogoutContainer);
      chatContainer.append(chatInnerContainer);
      document.body.append(chatContainer);

      this.createLoadingIndicator('chat_content_container');
      this.refreshChat();
    }

    handleChatInput(chatInput, chatInputSend) {
      if (chatInput.value.length > 0) {
        chatInputSend.removeAttribute('disabled');
        chatInputSend.classList.add('enabled');
        chatInputSend.onclick = () => {
          chatInputSend.setAttribute('disabled', true);
          chatInputSend.classList.remove('enabled');
          if (chatInput.value.length <= 0) {
            return;
          }
          this.createLoadingIndicator('chat_content_container');
          this.sendMessage(chatInput.value);
          chatInput.value = '';
          chatInput.focus();
        };
        this.displayTypingIndicator();
      } else {
        chatInputSend.classList.remove('enabled');
        this.hideTypingIndicator();
      }
    }

    saveName(name) {
      localStorage.setItem('name', name);
    }

    sendMessage(message) {
      if (this.getName() == null || message == null) {
        return;
      }

      db.ref('chats/').once('value', (messageObject) => {
        const index = parseFloat(messageObject.numChildren()) + 1;
        db.ref('chats/' + `message_${index}`).set({
          name: this.getName(),
          message: message,
          index: index,
          timestamp: Date.now()
        })
        .then(() => this.refreshChat())
        .catch(error => console.error("Error sending message: ", error));
      });
    }

    getName() {
      return localStorage.getItem('name') || null;
    }

    refreshChat() {
      const chatContentContainer = document.getElementById('chat_content_container');

      db.ref('chats/').on('value', (messagesObject) => {
        chatContentContainer.innerHTML = '';
        if (messagesObject.numChildren() === 0) {
          return;
        }

        const messages = Object.values(messagesObject.val()).sort((a, b) => a.index - b.index);

        messages.forEach(data => {
          const { name, message, timestamp } = data;
          const messageContainer = this.createElement('div', { class: 'message_container' });
          const messageInnerContainer = this.createElement('div', { class: 'message_inner_container' });
          const messageUserContainer = this.createElement('div', { class: 'message_user_container' });
          const messageUser = this.createElement('p', { class: 'message_user', textContent: name });
          const messageContentContainer = this.createElement('div', { class: 'message_content_container' });
          const messageContent = this.createElement('p', { class: 'message_content', textContent: message });
          const messageTimestamp = this.createElement('span', {
            class: 'message_timestamp',
            textContent: new Date(timestamp).toLocaleTimeString()
          });

          messageUserContainer.append(messageUser);
          messageContentContainer.append(messageContent, messageTimestamp);
          messageInnerContainer.append(messageUserContainer, messageContentContainer);
          messageContainer.append(messageInnerContainer);

          chatContentContainer.append(messageContainer);
        });

        chatContentContainer.scrollTop = chatContentContainer.scrollHeight;
      });
    }

    createLoadingIndicator(containerId) {
      const container = document.getElementById(containerId);
      container.innerHTML = '';

      const loaderContainer = this.createElement('div', { class: 'loader_container' });
      const loader = this.createElement('div', { class: 'loader' });

      loaderContainer.append(loader);
      container.append(loaderContainer);
    }

    displayTypingIndicator() {
      const typingIndicator = document.getElementById('typing_indicator');
      if (!typingIndicator) {
        const chatContainer = document.getElementById('chat_input_container');
        const typingIndicator = this.createElement('p', {
          id: 'typing_indicator',
          class: 'typing_indicator',
          textContent: 'Someone is typing...'
        });
        chatContainer.append(typingIndicator);
      }
    }

    hideTypingIndicator() {
      const typingIndicator = document.getElementById('typing_indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }

    createElement(tag, attributes) {
      const element = document.createElement(tag);
      for (let key in attributes) {
        if (key === 'textContent') {
          element.textContent = attributes[key];
        } else if (key === 'innerHTML') {
          element.innerHTML = attributes[key];
        } else if (key === 'onclick' || key === 'onkeyup') {
          element[key] = attributes[key];
        } else {
          element.setAttribute(key, attributes[key]);
        }
      }
      return element;
    }
  }

  const app = new MEME_CHAT();
  if (app.getName() == null) {
    app.home();
  } else {
    app.chat();
  }
};
