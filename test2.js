const { openFile, startClient } = require('./src/cli/commands');

// Start the WebSocket client
startClient('ws://localhost:8080');

// Open a file (replace 'testfile.txt' with your file path)
openFile('Main.java',"notepad");
