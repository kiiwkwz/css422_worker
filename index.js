const express = require('express');
const crypto = require('crypto');
const Base62 = require('base62');
const request = require('request');

const app = express();
const port = 3000;
var managerAPIUrl = 'http://127.0.0.1:3500';

app.use(express.json());

app.post('/getBase62', (req, res) => {
  res.send({ answer: Base62.decode(req.body.text) });
});

app.post('/getMd5', (req, res) => {
  res.send({ answer: crypto.createHash('md5').update(req.body.text).digest("hex") });
});

app.get('/mockGetTask', (req, res) => {
  
});

app.listen(port, (err) => {
  if (err) {
    return console.log('>>> something bad happened', err);
  }

  console.log(`>>> server is listening on ${port}`);
});