const fs = require('fs');
const http = require('http');

const body = fs.readFileSync('./last_message.json');

const req = http.request(
  {
    hostname: 'localhost',
    port: 11434,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length
    }
  },
  res => {
    res.on('data', chunk => {
      fs.appendFileSync('./last_message2.json', chunk);
    });
  }
);

req.write(body);
req.end();