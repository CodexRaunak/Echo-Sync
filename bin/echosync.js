const { program } = require("commander");
const figlet = require('figlet');
const {
  openFile,
  syncFileChanges,
  startClient,
} = require("../src/cli/commands"); // Ensure the path is correct
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function handleCommand(command) {
  const [cmd, ...args] = command.split(" ");

  switch (cmd) {
    case "start":
      console.log("Starting WebSocket client...");

      figlet('Echo Sync', function (err, data) {
        if (err) {
          console.log('Something went wrong...');
          console.dir(err);
          return;
        }
        console.log(data);
      });

      startClient("ws://localhost:8080"); // Replace with your WebSocket logic
      break;

    case "open":
      if (args.length > 0) {
        const file = args[0];
        const editor = args[1] || "vim"; // Use 'vim' as default editor

        rl.pause(); // Pause readline to allow the editor to take control

        // Open the file with specified editor
        openFile(file, editor);

        // Resume readline after the editor process ends
        setTimeout(() => {
          rl.resume();
        }, 100); // Resume after a small delay to ensure everything is closed.
      } else {
        console.log("Please specify a file to open.");
      }
      break;

    case "sync":
      console.log("Syncing changes...");
      syncFileChanges("ws://localhost:8080");
      break;

    case "exit":
      rl.close();
      break;

    default:
      console.log(`Unknown command: ${cmd}`);
  }
}

// Keep prompting for commands
function prompt() {
  rl.question("> ", (input) => {
    handleCommand(input);
    prompt(); // Recursively call to keep it interactive
  });
}

// Start the interactive prompt
console.log("Welcome to EchoSync ... , Type start to connect with the server");
prompt();
