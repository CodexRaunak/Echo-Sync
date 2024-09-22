const WebSocket = require("ws");
const diff = require('diff');

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set();

// Track file contents for each client
let fileContents = "";

wss.on("connection", (ws) => {
  console.log("New client connected!");
  clients.add(ws);

  // When a message is received from a client
  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === 'file-update') {
    
      console.log(`Received: ${message}`);

      // Calculate the diff between the current file content and the new content
      const oldContent = fileContents;
      const newContent = parsedMessage.content;  // Assuming content is sent in the message

      // Generate diff between oldContent and newContent
      const diffs = diff.diffChars(oldContent, newContent);
      fileContents = newContent;  // Update file contents to the latest

      // Prepare the diff to send to other clients
      const diffMessage = {
        type: 'file-diff',
        diffs,
        clientId: parsedMessage.clientId,  // Assuming each client has a unique ID
      };

      // Broadcast the diff to other clients except the sender
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(diffMessage));
        }
      });
    }

    // Handle cursor position sync
    if (parsedMessage.type === 'cursor-position') {
      const cursorData = {
        type: 'cursor-position',
        line: parsedMessage.line,
        column: parsedMessage.column,
        clientId: parsedMessage.clientId,
      };

      // Broadcast cursor position to all clients except the sender
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(cursorData));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(ws);
  });
});

console.log("WebSocket server started on ws://localhost:8080");
