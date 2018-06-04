const cron = require('node-cron');
const request = require('request');
const crypto = require('crypto');
const Base62 = require('base62');

var managerAPIUrl = 'http://hen.in.th/css422_manager/public/';

String.prototype.padding = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
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

    var loopTime = 20; // seconds

    cron.schedule(`*/${loopTime} * * * * *`, function () { // run every loopTime
        request({
            method: "POST",
            url: managerAPIUrl + '/api/getTask',
            body: { workerToken: workerToken },
            json: true
        }, function (error, res) {            
            if (error) {
                return console.log('something bad happened:\n', error);
            }

            var resObject = res.body;

            if(typeof resObject.success !== 'undefined' && !resObject.success) {
                return console.log('>>> get a task false (problem occured with manager)');
            } else if(resObject.newTask){
                console.log('>>> get a task successful:\n', resObject);
            } else {
                console.log('>>> get a task successful');
            }

            // var resObject = JSON.parse(response.body);
            var start = Number(resObject.start);
            var end = Number(resObject.end);
            var hashes = resObject.hashes;
            var range = resObject.range;
            var algo = resObject.algo;
            var hashResult = [];
            var plains = [];
            var found = false;
            var responseJson = {};
            var tick = 0;
            var progress = 0;
            var progressRange = 1; // update every x%

            if (resObject.newTask) {
                process.stdout.write(">>> progress: 0%");

                for (var i = start; i <= end; i++) {
                    var text = Base62.encode(i);
                    if (text.length != range) {
                        text = text.padding(range);
                    }
                    var hash = crypto.createHash(algo).update(text).digest('hex');
                    for (var j = 0; j <= hashes.length - 1; j++) {
                        if (hash == hashes[j].hash) {
                            found = true;
                            hashResult.push(hashes[j].hash);
                            plains.push(text);
                            break;
                        }
                    }
                    // progress bar
                    progress = Math.floor((i - start) / (end - start) * 100);
                    if (progress % progressRange == 0 && progress == tick) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(">>> progress: " + tick.toString() + "%");
                        tick += progressRange;
                    }
                }
                process.stdout.write("\n");

                if (found) {
                    responseJson = { // answer found
                        workerToken: workerToken,
                        taskId: resObject.taskId,
                        answer: true,
                        hashes: hashResult,
                        plains: plains
                    };
                } else {
                    responseJson = { // answer not found
                        workerToken: workerToken,
                        taskId: resObject.taskId,
                        answer: false,
                    };
                }
            }
            else { // no task
                responseJson = {
                    workerToken: workerToken,
                    taskId: null,
                };
            }

            if (responseJson.taskId !== null) { // have a new task
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
                        console.log(`>>> submit failed:\n`, error, '\n');
                    } else {
                        if(typeof body.success !== 'undefined' && !body.success) {
                            return console.log('>>> task submit false (problem occured with manager)\n');
                        } else {
                            return console.log('>>> task submitted:\n', responseJson, '\n');
                        }
                    }
                });
            } else { // don't have a new task
                console.log(`>>> no task\n`);
            } 
        });
    });
}, (err) => {
    console.log('>>> get token failed, error: ', err);
});
