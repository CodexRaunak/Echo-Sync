const socket = new WebSocket('ws://localhost:8080');
let localFileContent = "";  // Stores the local file content
const clientId = Math.random().toString(36).substring(2, 15);  // Unique ID for this client

// When connected to WebSocket server
socket.onopen = () => {
    console.log('Connected to the WebSocket server');
};

// Handle incoming WebSocket messages
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received data:', data);

    if (data.type === 'file-diff' && data.clientId !== clientId) {
        // Handle incoming diffs (ignore changes from the same client)
        applyDiffs(data.diffs);
    }

    if (data.type === 'cursor-position' && data.clientId !== clientId) {
        // Handle incoming cursor positions (ignore the same client's position)
        updateCursorPosition(data.clientId, data.line, data.column);
    }
};

// Send messages to the server
const sendMessage = (message) => {
    socket.send(JSON.stringify(message));
};

// Send file changes (diffs) to the server
const sendFileEdit = (newContent) => {
    sendMessage({
        type: 'file-edit',
        content: newContent,
        clientId,
    });
};

// Track user input and send file changes (diff)
document.getElementById('messageInput').addEventListener('input', (e) => {
    const newContent = e.target.value;

    // Only send changes if the content has been modified
    if (newContent !== localFileContent) {
        localFileContent = newContent;
        sendFileEdit(localFileContent);
    }
});

// Track cursor position and send it to the server
document.getElementById('messageInput').addEventListener('keyup', (e) => {
    const cursorPosition = e.target.selectionStart;  // Get cursor position

    // Convert cursor position into line and column for easier tracking
    const { line, column } = getLineAndColumn(e.target, cursorPosition);

    // Send the cursor position to the server
    sendMessage({
        type: 'cursor-position',
        line,
        column,
        clientId,
    });
});

// Helper function to apply diffs to the local content
const applyDiffs = (diffs) => {
    let updatedContent = '';
    diffs.forEach(part => {
        if (part.added) {
            updatedContent += part.value;  // Added text
        } else if (!part.removed) {
            updatedContent += part.value;  // Unchanged text
        }
    });

    // Update the local file content
    localFileContent = updatedContent;

    // Update the text area with new content
    document.getElementById('messageInput').value = updatedContent;
};

// Helper function to update cursor position visually
const updateCursorPosition = (clientId, line, column) => {
    // Show cursor position visually for the specific client (can be color-coded)
    console.log(`Cursor position of client ${clientId}: Line ${line}, Column ${column}`);
    // You can implement color-coding or cursor markers in the text editor here
};

// Helper function to get line and column from cursor position
const getLineAndColumn = (textarea, position) => {
    const lines = textarea.value.substr(0, position).split("\n");
    const line = lines.length;
    const column = lines[lines.length - 1].length;
    return { line, column };
};



