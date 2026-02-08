const readline = require('readline');

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to send JSON to stdout
const send = (data) => console.log(JSON.stringify(data));

// 1. Send Init on startup (Simulating Gemini CLI behavior)
send({ 
  type: 'init', 
  session_id: 'mock-session-' + Date.now() 
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  const input = line.trim();
  if (!input) return;

  // Ignore internal commands/noise if any, respond to messages
  
  // 2. Simulate "thinking"
  await delay(200);

  // 3. Stream response
  const responseText = `[Mock] You said: "${input}"`;
  
  // Stream character by character or word by word
  const chunks = responseText.split(/(?=[ \n])/); // Split keeping delimiters roughly
  
  for (const chunk of chunks) {
    send({
      type: 'message',
      role: 'assistant',
      content: chunk,
      delta: true
    });
    await delay(30); // Typing speed
  }

  // 4. Send Completion
  send({ 
    type: 'result', 
    status: 'success' 
  });
});
