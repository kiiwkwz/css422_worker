const express = require('express');
const crypto = require('crypto');
const Base62 = require('base62');
const request = require('request');

const app = express();
const port = 3000;

app.use(express.json());

app.post('/getBase62', (req, res) => {
  res.send({ answer: Base62.decode(req.body.text) });
});

app.post('/getMd5', (req, res) => {
  res.send({ answer: crypto.createHash('md5').update(req.body.text).digest("hex") });
});

app.get('/mockGetTask', (req, response) => {
  request('http://127.0.0.1:3500/getTask', function (err, res) {
    if (err) {
      return console.log('something bad happened', err);
    }

    var resObject = JSON.parse(res.body);
    var start = resObject.start;
    var end = resObject.end;
    var hashResult = resObject.hashes;
    var found = false;

    if (resObject.newTask) {
      for (var i = start; i <= end; i++) {
        var text = Base62.encode(i);
        var hash = crypto.createHash('md5').update(text).digest('hex');

        if (hash == hashResult) {
          found = true;
          response.send(text);
        }
      }

      if (!found) {
        response.send('not found');
      }
    }
    else {
      response.send('don\'t have new task');
    }
  });
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});