const express = require('express');
const crypto = require('crypto');
const Base62 = require('./base62');

const app = express();
const port = 3500;

app.use(express.json());

app.post('/api/worker/registration', (req, res) => {
    res.send({ workerToken: 123 });
});

app.get('/getTask', (req, res) => {
    res.json({
        "newTask": true,
        "taskId": 1,
        "algo": "md5",
        "start": 1,
        "end": 100000,
        "timeout": 180,
        "hashes": "4124bc0a9335c27f086f24ba207a4912"
    });
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);
});