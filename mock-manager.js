const express = require('express');
const crypto = require('crypto');
// const Base62 = require('base62');

const app = express();
const port = 3500;

app.use(express.json());

app.get('/api/worker/registration', (req, res) => {
    res.send({ workerToken: 123 });
});

app.post('/api/getTask', (req, res) => {
    console.log('>>> ' + req.body.workerToken + " has requested to get task\n");
    res.json({
        "newTask": true,
        "taskId": 1,
        "algo": "md5",
        "start": 0,
        "end": 14776335,
        "timeout": 180,
        "hashes": [{"hash":"cc8c0a97c2dfcd73caff160b65aa39e2"}, {"hash":"b7a8bfd76f59da423f6d08d2f6c52668"}]
    });
});

app.post('/api/submitTask', (req, res) => {
    console.log('>>> submitted task: \n', req.body , '\n');
    res.send(req.body);
});

app.listen(port, (err) => {
    if (err) {
        return console.log('>>> something bad happened', err);
    }

    console.log(`>>> server is listening on ${port}`);
});