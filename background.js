let socket = null;
let currentStatus = 'disconnected';
const backendAddress = 'wss://tornteampoker.com';

function connectWebSocket() {
    if (socket) return;

    broadcastStatus('connecting');

    chrome.storage.sync.get(['chatChannel', 'authToken'], (result) => {
        if (chrome.runtime.lastError || !result.authToken) {
            console.error("Connection failed: Missing auth token.");
            disconnectWebSocket();
            return;
        }

        const channel = result.chatChannel || 'general';
        const fullUrl = `${backendAddress}/ws/chat/${channel}/${result.authToken}/`;

        console.log(`Connecting to WebSocket: ${fullUrl}`);
        socket = new WebSocket(fullUrl);

        socket.onopen = () => {
            broadcastStatus('connected');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs || tabs.length === 0) return;
                console.log('WebSocket сообщение:', data);

                const messageMap = {
                    'chat_message': { type: "CHAT_MESSAGE_RECEIVED", payload: data },
                    'recv_active_game': { type: "ACTIVE_GAME_RECEIVED", payload: data },
                    'update_hands': { type: "UPDATE_HANDS" }
                };
                
                const messageToSend = messageMap[data.type];
                
                if (messageToSend) {
                    tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, messageToSend, () => chrome.runtime.lastError && 0));
                }
            });
        };

        socket.onerror = (error) => {
            console.error('Ошибка WebSocket:', error);
        };

        socket.onclose = () => {
            socket = null;
            broadcastStatus('disconnected');
        };
    });
}

function disconnectWebSocket() {
    if (socket) {
        socket.onclose = null;
        socket.close();
        socket = null;
    }
    broadcastStatus('disconnected');
}

function broadcastStatus(status) {
    currentStatus = status;
    chrome.tabs.query({}, (tabs) => { 
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { type: "WEBSOCKET_STATUS", status: status }, () => {
                if (chrome.runtime.lastError) {} 
            });
        });
    });
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case "AUTH_REQUEST":
            (async () => {
                const { endpoint, username, password } = message.payload;
                const httpAddress = backendAddress.replace(/^ws/, 'http');
                const apiUrl = `${httpAddress}/api/v1/auth/${endpoint}`;

                try {
                    console.log(apiUrl);
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'ngrok-skip-browser-warning': 'true'
                        },
                        body: JSON.stringify({ name: username, password: password })
                    });
                    const data = await response.json();
                    sendResponse(data);
                } catch (e) {
                    sendResponse({ error: "Network request failed. Check backend URL." });
                }
            })();
            return true; 

        case "CONNECT_WEBSOCKET":
            connectWebSocket();
            break;
        case "DISCONNECT_WEBSOCKET":
            disconnectWebSocket();
            break;
        case "GET_WEBSOCKET_STATUS":
            if (sender.tab) {
                chrome.tabs.sendMessage(sender.tab.id, { type: "WEBSOCKET_STATUS", status: currentStatus });
            }
            break;

        case "SEND_MESSAGE":
        case "START_GAME":
        case "END_GAME":
        case "RECEIVE_HANDS":
        case "PROPAGATE_UPDATE_HANDS":
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(message.payload));
            } else {
                console.error(`Failed to send ${message.type} message: WebSocket is not open.`);
            }
            break;
    }
    return true;
});