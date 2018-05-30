const express = require('express');
const crypto = require('crypto');
const Base62 = require('./base62');

const app = express();
const port = 3000;

app.use(express.json());

app.post('/getBase62', (req, res) => {
  var base62 = new Base62();
  res.send({ answer: base62.decode(req.body.text) });
});

app.post('/getMd5', (req, res) => {
  res.send({ answer: crypto.createHash('md5').update(req.body.text).digest("hex") });
});

app.post('/mockGetTask', (req, res) => {
  var base62 = new Base62();
  var start = req.body.start;
  var end = req.body.end;
  var hashResult = req.body.hashes;
  var found = false;

  if (req.body.newTask) {
    for (var i = start; i <= end; i++) {
      var text = base62.encode(i);
      var hash = crypto.createHash('md5').update(text).digest('hex');

      if (hash == hashResult) {
        found = true;
        res.send(text);
      }
    }

    if (!found) {
      res.send('not found');
    }
  }
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});