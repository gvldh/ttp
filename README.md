This is a Google Chrome browser extension designed to assist poker players on Torn.com. It provides real-time analytics for the current hand, including equity (chances of winning) and combination probabilities, and also features a built-in chat for team coordination.

Key Features Real-time Analytics: Automatically reads your and your team cards to calculate statistics.

Equity Calculation: Shows your probability of winning the hand against opponents.

Combination Predictions: Displays the likelihood of forming various poker hands.

Installation

Download the repository: On the main page of the GitHub repository, click the green <> Code button and then select Download ZIP.

Unzip the archive: Extract the downloaded Torn-Poker-Helper-main.zip file to a folder of your choice.

Open Chrome Extensions: In Google Chrome, navigate to the extensions management page at chrome://extensions.

Enable Developer Mode: In the top-right corner of the page, toggle the "Developer mode" switch on.

Install the extension: Click the "Load unpacked" button and select the folder you extracted in step 2.

After these steps, the extension icon will appear in your Chrome toolbar, and it will be ready to use.

Configuration and Usage Go to the torn poker page.

Open the settings: The extension window will appear on the game page. Navigate to the Settings tab.

Default Channel: Enter a name for the chat and data synchronization channel (e.g. team_alpha).

Save the settings: Click the Save Settings button. The extension will verify your API key and display your username and ID.

Sign in or sign up

Connect to the server: Go to the Poker or Chat tab and click the green Connect button. The status should change to Connected.

Start playing:

Click Start Game to notify the backend that a new hand has begun.

The Request Update button forces a data refresh from all members in the channel.

Disclaimer This is a third-party tool. Use it at your own risk.

This extension requires a running backend server to handle game logic and WebSocket connections. This repository contains only the client-side extension.
