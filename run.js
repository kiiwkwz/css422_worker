const cron = require('node-cron');
const request = require('request');

var managerAPIUrl = 'http://127.0.0.1:3500';
var localAPIUrl = "http://127.0.0.1:3000"

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
    if(!workerToken) {
        return console.log('>>> no token');
    }
    
    console.log('>>> get token succesful, token: ' + workerToken + '\n');

    var count = 0;
    var loopTime = 3; // seconds

    cron.schedule(`*/${loopTime} * * * * *`, function () { // run every loopTime
        request({
            method: "GET",
            url: localAPIUrl + '/mockGetTask',
            body: {workerToken: workerToken},
            json: true
        }, (err, res) => {
            if(count >= 10000) { // reset count when it over 10000
                count = 0;
            }
            count++;

            if (err) {
                return console.log(`>>> [${count}] get task failed, ${err}\n`);
            }

            let resJson = res.body;
            // let resJson = JSON.parse(res.body);

            if (resJson.taskId !== null) { // have a new task
                request({
                    method: "POST",
                    url: managerAPIUrl + '/api/submitTask',
                    // headers: {
                    //     "Content-Type": "application/json"
                    // },
                    body: resJson,
                    json: true
                }, (error, response, body) => {
                    if(error) {
                        console.log(`>>> [${count}] submit failed`, err, '\n');
                    } else {
                        console.log(`>>> [${count}] task submitted`, body, '\n');
                    }
                });
            } else { // don't have a new task
                console.log(`>>> [${count}] no task\n`);
            }
        });
    });
}, (err) => {
    console.log('>>> get token failed, error: ', err);
});


