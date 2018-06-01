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
  var workerToken = req.body.workerToken;
  request({
    method: "POST",
    url: managerAPIUrl + '/api/getTask',
    body: {workerToken: workerToken},
    json: true
  }, function (error, response) {
    if (error) {
      return console.log('something bad happened', error);
    }
    console.log('>>> get task successful with token: ' + workerToken);

    var resObject = response.body;
    // var resObject = JSON.parse(response.body);
    var start = resObject.start;
    var end = resObject.end;
    var hashes = resObject.hashes;
    var hashResult = [];
    var plains = [];
    var found = false;
    var responseJson = {};

    if (resObject.newTask) {
      for(var i = 0; i <= hashes.length - 1; i++){
        for (var j = start; j <= end; j++) {
          var text = Base62.encode(j);
          var hash = crypto.createHash('md5').update(text).digest('hex');
  
          if (hash == hashes[i].hash) {
            found = true;
            hashResult.push(hashes[i].hash);
            plains.push(text);
            break;
          }
        }
      }

      if(found) {
        responseJson = {
          workerToken: workerToken,
          taskId: resObject.taskId,
          answer: true,
          hashes: hashResult,
          plains: plains
        };
      } else {
        responseJson = {
          workerToken: workerToken,
          taskId: resObject.taskId,
          answer: false,
        };
      }
    }
    else {
      responseJson = {
        workerToken: workerToken,
        taskId: null,
      };
    }
    res.json(responseJson);
  });
});

app.listen(port, (err) => {
  if (err) {
    return console.log('>>> something bad happened', err);
  }

  console.log(`>>> server is listening on ${port}`);
});