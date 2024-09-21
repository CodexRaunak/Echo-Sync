const { program } = require('commander');
const { openFile, syncChanges , startClient} = require('../src/cli/commands'); // Ensure the path is correct

// Command to open a file for editing
program
  .command('open <file>')
  .description('Open a file for editing')
  .action((file) => {
    console.log(`Opening file: ${file}`);
    openFile(file); // Call the function to open the file
  });

// Command to sync changes with collaborators
program
  .command('sync')
  .description('Sync changes with collaborators')
  .action(() => {
    console.log('Syncing changes with collaborators...');
    syncChanges(); // Call the function to sync changes
  });

// Command to start the WebSocket client
program
  .command('start')
  .description('Start the WebSocket client')
  .action(() => {
    console.log('Starting WebSocket client...');
    startClient('ws://localhost:8080'); 
  });

// Parse the command line arguments
program.parse(process.argv);
