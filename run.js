const cron = require('node-cron');
const request = require('request');
const crypto = require('crypto');
const Base62 = require('base62');

var managerAPIUrl = 'http://127.0.0.1:3500';

String.prototype.padding = function (n) {
    return new Array(n).join('0').slice((n || 2) * -1) + this;
}

function getToken() {
    var register = new Promise((resolve, reject) => {
        request(managerAPIUrl + '/api/worker/registration', (err, res) => { // register to get token
            if (err) {
                reject(err);
            } else {
                // var workerToken = res.body.workerToken;
                var workerToken = JSON.parse(res.body).workerToken;
                resolve(workerToken);
            }
        });
    });

    return register;
}

getToken().then((workerToken) => {
    if(workerToken.success === false) {
        return console.log('>>> no token');
    }
    
    console.log('>>> get token succesful, token: ' + workerToken + '\n');

    var count = 0;
    var loopTime = 3; // seconds

    cron.schedule(`*/${loopTime} * * * * *`, function () { // run every loopTime
        request({
            method: "POST",
            url: managerAPIUrl + '/api/getTask',
            body: { workerToken: workerToken },
            json: true
        }, function (error, res) {
            if (error) {
                return console.log('something bad happened', error);
            }
            console.log('>>> get task successful with token: ' + workerToken);

            var resObject = res.body;
            // var resObject = JSON.parse(response.body);
            var start = resObject.start;
            var end = resObject.end;
            var hashes = resObject.hashes;
            var hashResult = [];
            var plains = [];
            var found = false;
            var responseJson = {};

            if (resObject.newTask) {
                for (var i = 0; i <= hashes.length - 1; i++) {
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

                if (found) {
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

                request({
                    method: "POST",
                    url: managerAPIUrl + '/api/submitTask',
                    // headers: {
                    //     "Content-Type": "application/json"
                    // },
                    body: responseJson,
                    json: true
                }, (error, response, body) => {
                    if (error) {
                        console.log(`>>> [${count}] submit failed`, err, '\n');
                    } else {
                        console.log(`>>> [${count}] task submitted`, body, '\n');
                    }
                });
            }
            else {
                responseJson = {
                    workerToken: workerToken,
                    taskId: null,
                };
            }
        });
    });
}, (err) => {
    console.log('>>> get token failed, error: ', err);
});
