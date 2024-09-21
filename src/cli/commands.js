const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:8080");
const clientId = Math.random().toString(36).substring(2, 15);
let socket;
let isRemoteUpdate = false; // Flag to distinguish between local and remote changes
let debounceTimer = null;   // Timer for debouncing file changes

const debounceDelay = 100; // Adjust this value as needed

const openFile = (filePath) => {
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`Editing file: ${fullPath}`);

    // Start watching for file changes with debounce
    fs.watch(fullPath, (eventType, filename) => {
      if (eventType === "change") {
        if (debounceTimer) clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
          if (!isRemoteUpdate) {
            // Only sync if it's a local update
            console.log(`File ${filename} has been locally modified.`);
            syncFileChanges(fullPath);
          } else {
            // Reset the flag after handling the remote update
            isRemoteUpdate = false;
          }
        }, debounceDelay);
      }
    });

    // Open the file in an editor (Notepad in this example)
    const vimProcess = spawn("vim", [fullPath], {
      stdio: "inherit" // Allows Vim to take control of the terminal
    });

    vimProcess.on("exit", (code) => {
      console.log(`Vim process exited with code ${code}`);
    });

    vimProcess.on("error", (err) => {
      console.error("Error opening file with Vim:", err);
    });
  } else {
    console.error("File does not exist!");
  }
};

// Sync file changes with collaborators (via WebSocket)
const syncFileChanges = (filePath) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    // Send the file changes to all connected clients
    const fileUpdate = {
      type: "file-update",
      clientId,
      filename: path.basename(filePath),
      content: data, // Send the whole file content for simplicity
    };

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(fileUpdate));
    }
  });
};

// Client-side WebSocket code to receive and apply changes
// const startClient = (serverURL) => {
//   socket = new WebSocket(serverURL);

//   socket.onopen = () => {
//     console.log("Connected to WebSocket server");
//   };

//   socket.onmessage = (event) => {
//     const message = JSON.parse(event.data);

//     if (message.type === "file-update" && message.clientId !== clientId) {
//       console.log(`Received update for file: ${message.filename}`);
//       console.log("Updated content:", message.content);

//       // Prevent infinite loop by marking this as a remote update
//       isRemoteUpdate = true;

//       // Overwrite the local file with the received content
//       fs.writeFile(message.filename, message.content, (err) => {
//         if (err) {
//           console.error("Error updating file:", err);
//         } else {
//           console.log(`File ${message.filename} updated successfully.`);
//         }
//       });
//     }
//   };
// };
const startClient = () => {
  const serverURL = 'ws://localhost:8080'; // Replace with your server URL
  const clientProcess = spawn('node', ['../src/network/client.js', serverURL], { stdio: 'inherit' });

  clientProcess.on('error', (err) => {
    console.error('Failed to start client:', err);
  });

  clientProcess.on('exit', (code) => {
    console.log(`WebSocket client exited with code ${code}`);
  });
};

module.exports = { openFile, syncFileChanges, startClient };
