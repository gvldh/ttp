function createHelperWindow() {
    const myWindow = document.createElement('div');
    myWindow.id = 'my-torn-helper-window';
    myWindow.innerHTML = `
        <div class="window-header">
            <span>Teamplay tab</span>
            <button id="toggle-button">-</button> 
        </div>
        <div class="window-menu">
            <button class="menu-button" data-tab="settings">Settings</button>
            <button class="menu-button" data-tab="chat">Chat</button>
            <button class="menu-button active" data-tab="poker">Poker</button>
        </div>
        <div class="window-content">
            <div id="tab-settings" class="tab-content">
                <div class="settings-section" id="user-info-section" style="display: none;">
                    <p>User Info:</p>
                    <div id="user-info">User: <span id="user-name" style="font-weight: bold;">Unknown</span></div>
                    <button id="logout-button" style="width: 100%; padding: 8px; margin-top: 10px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">Logout</button>
                </div>
                <div class="settings-section" id="auth-form-section">
                    <p>Account:</p>
                    <div class="api-section">
                        <input type="text" id="username-input" placeholder="Username" autocomplete="username">
                        <input type="password" id="password-input" placeholder="Password" autocomplete="current-password">
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button id="login-button" style="flex-grow: 1; padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">Login</button>
                        <button id="register-button" style="flex-grow: 1; padding: 10px; background-color: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer;">Register</button>
                    </div>
                </div>
                <hr style="border-color: #555; margin: 20px 0;">
                <div class="settings-section">
                    <p>DON'T USE GENERAL CHANNEL IF YOU DON'T WANT TO BE SPYED ON</p><br/>
                    <p>Channel:</p>
                    <div class="api-section">
                        <input type="text" id="channel-input" placeholder="e.g., general">
                    </div>
                </div>
                <button id="save-connection-button" style="width: 100%; padding: 10px; background-color: #6c757d; color: white; border: none; border-radius: 3px; cursor: pointer;">Save Connection Settings</button>
                
                <div id="save-status" style="text-align: center; margin-top: 10px; height: 15px;"></div>
            </div>
            <div id="tab-chat" class="tab-content hidden">
                <div class="chat-controls">
                    <button class="chat-toggle-button connect-button">Connect</button>
                    <div class="chat-status status-disconnected">Status: Disconnected</div>
                </div>
                <div class="chat-container">
                    <div id="chat-display"></div>
                    <textarea id="chat-input" placeholder="Type your message..." disabled></textarea>
                    <button id="chat-send-button" disabled>Send</button>
                </div>
            </div>
            <div id="tab-poker" class="tab-content hidden">
                <div class="chat-controls">
                    <button class="chat-toggle-button connect-button">Connect</button>
                    <div class="chat-status status-disconnected">Status: Disconnected</div>
                </div>
                <hr style="border-color: #555; margin-bottom: 15px;">
                <div id="poker-auto-controls">
                    <div class="poker-controls">
                        <button id="get-logs-button">Request Update</button>
                        <button id="reset-button">Start Game</button>
                    </div>
                </div>
                <div id="poker-results"></div>
            </div>
        </div>
        <div class="resizer"></div>
    `;
    document.body.appendChild(myWindow);

    const settingsButton = myWindow.querySelector('.menu-button[data-tab="settings"]');
    const channelInput = document.getElementById('channel-input');
    const saveStatus = document.getElementById('save-status');
    const userNameSpan = document.getElementById('user-name');
    
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const logoutButton = document.getElementById('logout-button');
    const saveConnectionButton = document.getElementById('save-connection-button');
    const authFormSection = document.getElementById('auth-form-section');
    const userInfoSection = document.getElementById('user-info-section');

    const chatStatusDisplays = myWindow.querySelectorAll('.chat-status');
    const chatToggleButtons = myWindow.querySelectorAll('.chat-toggle-button');
    const chatDisplay = document.getElementById('chat-display');
    const chatInput = document.getElementById('chat-input');
    const chatSendButton = document.getElementById('chat-send-button');

    const requestUpdateButton = document.getElementById('get-logs-button');
    const autoResetButton = document.getElementById('reset-button');
    const pokerResultsDiv = document.getElementById('poker-results');

    const toggleButton = document.getElementById('toggle-button');
    const header = myWindow.querySelector('.window-header');
    const resizer = myWindow.querySelector('.resizer');
    const menuButtons = myWindow.querySelectorAll('.menu-button');
    const tabContents = myWindow.querySelectorAll('.tab-content');
    
    let currentUser = { name: 'Unknown', id: null };


    function displayUserInfo(name, id) {
        userNameSpan.textContent = name;
        currentUser = { name, id };
        settingsButton.classList.remove('warning');
        authFormSection.style.display = 'none';
        userInfoSection.style.display = 'block';
    }

    function clearUserInfo() {
        userNameSpan.textContent = 'Unknown';
        currentUser = { name: 'Unknown', id: null };
        settingsButton.classList.add('warning');
        authFormSection.style.display = 'block';
        userInfoSection.style.display = 'none';
    }
    
    function updateChatUI(status) {
        chatToggleButtons.forEach(button => {
            button.classList.remove('connect-button', 'disconnect-button');
            switch (status) {
                case 'connected': button.textContent = 'Disconnect'; button.classList.add('disconnect-button'); button.disabled = false; break;
                case 'connecting': button.textContent = 'Connecting...'; button.disabled = true; break;
                default: button.textContent = 'Connect'; button.classList.add('connect-button'); button.disabled = false; break;
            }
        });
        chatStatusDisplays.forEach(display => {
            switch (status) {
                case 'connected': display.textContent = 'Status: Connected'; display.className = 'chat-status status-connected'; break;
                case 'connecting': display.textContent = 'Status: Connecting...'; display.className = 'chat-status status-connecting'; break;
                default: display.textContent = 'Status: Disconnected'; display.className = 'chat-status status-disconnected'; break;
            }
        });
        const isConnected = (status === 'connected');
        chatInput.disabled = !isConnected;
        chatSendButton.disabled = !isConnected;
    }

    function loadData() {
        chrome.storage.sync.get(['authToken', 'username', 'userId', 'chatChannel'], function(result) {
            if (result.authToken && result.username) {
                displayUserInfo(result.username, result.userId);
            } else {
                clearUserInfo();
            }
            channelInput.value = result.chatChannel || 'general';
            chrome.runtime.sendMessage({ type: "GET_WEBSOCKET_STATUS" });
        });
    }

    async function handleAuth(endpoint) {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            saveStatus.textContent = 'All fields are required.';
            saveStatus.className = 'error';
            setTimeout(() => { saveStatus.textContent = ''; saveStatus.className = ''; }, 3000);
            return;
        }
        saveStatus.textContent = 'Processing...';
        saveStatus.className = '';

        try {
            const data = await chrome.runtime.sendMessage({
                type: "AUTH_REQUEST",
                payload: { endpoint, username, password }
            });

            if (data.error) {
                saveStatus.textContent = `Error: ${data.error}`;
                saveStatus.className = 'error';
                clearUserInfo();
            } else if (data.token) {
                const userData = { id: data.id || 'N/A', name: username };
                saveStatus.textContent = `Success! Welcome, ${userData.name}.`;
                saveStatus.className = '';
                await chrome.storage.sync.set({
                    authToken: data.token,
                    username: userData.name,
                    userId: userData.id
                });
                displayUserInfo(userData.name, userData.id);
            }
        } catch (error) {
            saveStatus.textContent = 'An error occurred during auth.';
            saveStatus.className = 'error';
            console.error(error);
        }
        setTimeout(() => { saveStatus.textContent = ''; saveStatus.className = ''; }, 3000);
    }
    
    async function handleLogout() {
        await chrome.storage.sync.remove(['authToken', 'username', 'userId']);
        clearUserInfo();
        chrome.runtime.sendMessage({ type: "DISCONNECT_WEBSOCKET" });
        saveStatus.textContent = 'You have been logged out.';
        setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    }

    function addMessageToChat(user, message) {
        if (!user || !message) { return; }
        const messageElement = document.createElement('p');
        if (user === currentUser.name) {
            messageElement.classList.add('self-message');
            messageElement.innerHTML = message;
        } else {
            messageElement.innerHTML = `<strong>${user}:</strong> ${message}`;
        }
        chatDisplay.appendChild(messageElement);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText) {
            chrome.runtime.sendMessage({ type: "SEND_MESSAGE", payload: { type: "chat.message", message: messageText } });
            chatInput.value = '';
        }
    }

    function render_active_game(activeGame) {
        if (!activeGame) {
            pokerResultsDiv.innerHTML = '<p style="color: #ffc107;">No active game found.</p>';
            autoResetButton.textContent = 'Start Game';
            requestUpdateButton.style.display = 'none';
            return;
        }
        
        requestUpdateButton.style.display = 'inline-block';
        autoResetButton.textContent = 'End Game';
    
        const hasPlayers = Array.isArray(activeGame.related_players) && activeGame.related_players.length > 0;
        const hasTableCards = Array.isArray(activeGame.related_table) && activeGame.related_table.length > 0;
        const hasEquity = activeGame.get_equity && typeof activeGame.get_equity === 'object';
        const hasPredictions = activeGame.get_prediction && typeof activeGame.get_prediction === 'object';
    
        if (!hasPlayers && !hasTableCards) {
            pokerResultsDiv.innerHTML = `<p style="color: #4caf50;">Active game is present</p>`;
            return;
        }
    
        let html = '<div>';
    
        if (hasTableCards) {
            html += '<h4 style="margin-top: 15px;">Table Cards:</h4>';
            const tableCards = activeGame.related_table.map(tableCard => 
                tableCard.card["__str__"]
            ).join(' | ');
            html += `<p>${tableCards}</p><br/><hr style="border-color: #555;"><br/>`;
        }
    
        if (hasPlayers) {
            const shouldShowDifference = activeGame.related_players.length > 1;
    
            activeGame.related_players.forEach(playerData => {
                const playerName = playerData.player.name;
                const hand = playerData.related_hand.map(handCard => 
                    handCard.card["__str__"]
                ).join(', ');
    
                html += `<div class="player-info">`;
                html += `<p><strong>${playerName}:</strong> ${hand}</p>`;
    
                if (hasEquity && activeGame.get_equity[playerName] !== undefined) {
                    const equity = (activeGame.get_equity[playerName] * 100).toFixed(2);
                    html += `<p><strong>Equity:</strong> ${equity}%</p>`;
                }
    
                if (hasPredictions && activeGame.get_prediction[playerName]) {
                    const predictionValue = activeGame.get_prediction[playerName];
                    const sortedPredictions = Object.entries(predictionValue)
                        .filter(([_, data]) => data.informed_chance > 0)
                        .sort(([, a], [, b]) => b.informed_chance - a.informed_chance);
    
                    if (sortedPredictions.length > 0) {
                        html += `<details class="prediction-details"><summary>Show Predictions</summary><ul>`;
                        sortedPredictions.forEach(([handName, data]) => {
                            const chance = data.informed_chance.toFixed(2);
                            let diffHtml = '';
    
                            if (shouldShowDifference) {
                                const difference = data.difference;
                                if (Math.abs(difference) > 0.001) {
                                    const formattedDiff = difference.toFixed(2);
                                    const sign = difference > 0 ? '+' : '';
                                    const color = difference > 0 ? '#4CAF50' : '#f44336';
                                    diffHtml = ` <span style="font-size: 11px; color: ${color};">(${sign}${formattedDiff}%)</span>`;
                                }
                            }
                            
                            html += `<li>${handName}: ${chance}%${diffHtml}</li>`;
                        });
                        html += `</ul></details>`;
                    }
                }
                html += `</div><hr style="border-color: #444; margin: 10px 0;">`;
            });
            
            if (html.endsWith('<hr style="border-color: #444; margin: 10px 0;">')) {
                html = html.slice(0, -50);
            }
        }
        html += '</div>';
        pokerResultsDiv.innerHTML = html;
    }

    function handleGameAction(button) {
        const action = button.textContent === 'Start Game' ? 'START_GAME' : 'END_GAME';
        const payload = { type: action.toLowerCase().replace('_', '.') };
        if (action === 'START_GAME') {
            payload.total_players = get_active_players();
        }
        chrome.runtime.sendMessage({ type: action, payload: payload });
    }
    
    async function send_hand(){
        const hand = get_hand();
        const table = get_table();
        if (hand.length === 0 && table.length === 0) { return; }
        chrome.runtime.sendMessage({ type: 'RECEIVE_HANDS', payload: {type: 'receive_hands', hand: hand, table: table, active_players: get_active_players()} });
    }

    function get_hand() {
        const cards = document.querySelectorAll(
            '.playerMeGateway___AEI5_ .hand___aOp4l .card___t7csZ .front___osz1p > div'
        );
        if (cards.length === 0) { return []; }
        return Array.from(cards)
            .map(card => eval_card(card.className))
            .filter(card => card !== null);
    }

    function get_table() {
        const cards = document.querySelectorAll(
            '.communityCards___cGHD3 .front___osz1p > div'
        );
        if (cards.length === 0) { return []; }
        return Array.from(cards)
            .map(card => eval_card(card.className))
            .filter(card => card !== null);
    }

    function eval_card(card){
        const regex = /(clubs|spades|hearts|diamonds)-([0-9TJQKA]+)/;
        const match = card.match(regex);
        if (!match) {
            return null;
        }
        const suits = { clubs: 4, spades: 1, hearts: 3, diamonds: 2 };
        const ranks = { '2':0, '3':1, '4':2, '5':3, '6':4, '7':5, '8':6, '9':7, '10':8, 'J':9, 'Q':10, 'K':11, 'A':12 };
        const suit = suits[match[1]];
        const rank = ranks[match[2]];
        return (rank * 4) + suit;
    }

    function get_active_players() {
        let players = document.querySelectorAll('[class*="opponent___"]');
        if (players.length === 0) {
            players = document.querySelectorAll('[id*="player-"]');
        }
    
        let activePlayers = 0;
    
        if (players.length > 0) {
            players.forEach(player => {
                const playerText = player.textContent ? player.textContent.toLowerCase() : '';
                const isInactive = playerText.includes('sitting out') ||
                                   playerText.includes('waiting') ||
                                   playerText.includes('folded');
                if (!isInactive) {
                    activePlayers++;
                }
            });
        }
        return Math.max(activePlayers + 1, 2); 
    }

    
    loginButton.addEventListener('click', () => handleAuth('login'));
    registerButton.addEventListener('click', () => handleAuth('register'));
    logoutButton.addEventListener('click', handleLogout);
    saveConnectionButton.addEventListener('click', () => {
        chrome.storage.sync.set({
            chatChannel: channelInput.value.trim() || 'general'
        }, () => {
            saveStatus.textContent = 'Connection settings saved.';
            setTimeout(() => { saveStatus.textContent = ''; }, 3000);
        });
    });

    chatSendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } });
    chatToggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentState = button.textContent.toLowerCase();
            if (currentState === 'connect') { chrome.runtime.sendMessage({ type: "CONNECT_WEBSOCKET" }); } 
            else if (currentState === 'disconnect') { chrome.runtime.sendMessage({ type: "DISCONNECT_WEBSOCKET" }); }
        });
    });

    autoResetButton.addEventListener('click', () => handleGameAction(autoResetButton));
    requestUpdateButton.addEventListener('click', () => { chrome.runtime.sendMessage({ type: 'PROPAGATE_UPDATE_HANDS', payload: {type: 'update_hands'} }); });
    
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTabId = `tab-${button.dataset.tab}`;
            menuButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(tab => tab.classList.add('hidden'));
            myWindow.querySelector(`#${targetTabId}`).classList.remove('hidden');
        });
    });

    toggleButton.addEventListener('click', () => {
        const menu = myWindow.querySelector('.window-menu');
        const content = myWindow.querySelector('.window-content');
        menu.classList.toggle('hidden');
        content.classList.toggle('hidden');
        const isHidden = content.classList.contains('hidden');
        toggleButton.textContent = isHidden ? '+' : '-';
        if (isHidden) myWindow.style.height = 'auto';
    });

    let isDragging = false, dragOffsetX, dragOffsetY;
    header.addEventListener('mousedown', (e) => { if (e.target.id === 'toggle-button') return; isDragging = true; dragOffsetX = e.clientX - myWindow.getBoundingClientRect().left; dragOffsetY = e.clientY - myWindow.getBoundingClientRect().top; e.preventDefault(); });
    
    document.addEventListener('mousemove', (e) => { 
        if (!isDragging) return;
        const newX = e.clientX - dragOffsetX;
        const newY = e.clientY - dragOffsetY;
        myWindow.style.right = 'auto';
        myWindow.style.bottom = 'auto';
        myWindow.style.left = `${newX}px`;
        myWindow.style.top = `${newY}px`;
    });
    
    document.addEventListener('mouseup', () => { isDragging = false; });
    resizer.addEventListener('mousedown', function (e) { e.preventDefault(); const startX = e.clientX; const startY = e.clientY; const startWidth = myWindow.offsetWidth; const startHeight = myWindow.offsetHeight; function doResize(e) { myWindow.style.width = `${startWidth + e.clientX - startX}px`; myWindow.style.height = `${startHeight + e.clientY - startY}px`; } function stopResize() { document.documentElement.removeEventListener('mousemove', doResize, false); document.documentElement.removeEventListener('mouseup', stopResize, false); } document.documentElement.addEventListener('mousemove', doResize, false); document.documentElement.addEventListener('mouseup', stopResize, false); });

    chrome.runtime.onMessage.addListener((message) => {
        switch (message.type) {
            case "CHAT_MESSAGE_RECEIVED": if (message.payload) addMessageToChat(message.payload.user, message.payload.message); break;
            case "ACTIVE_GAME_RECEIVED": if (message.payload) render_active_game(message.payload.active_game); break;
            case "WEBSOCKET_STATUS": updateChatUI(message.status); break;
            case "UPDATE_HANDS": send_hand(); break;
        }
    });

    loadData();
    menuButtons[0].click(); 
}

createHelperWindow();