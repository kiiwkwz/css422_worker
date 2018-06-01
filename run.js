const cron = require('node-cron');
const request = require('request');

function getToken() {
    var register = new Promise((resolve, reject) => {
        request('http://127.0.0.1:3500/api/worker/registration', (err, res) => { // register to get token
            if (err) {
                reject(err);
            } else{
                var token = JSON.parse(res.body).workerToken;
                resolve(token);
            }
        });
    });

    return register;
}

getToken().then((token) => {
    console.log('get token succesful, token: ' + token);

    var count = 0;
    var loopTime = 30; // seconds

    cron.schedule(`*/${loopTime} * * * * *`, function () { // run every loopTime
        request('http://127.0.0.1:3000/mockGetTask', (err, res) => {
            if(count >= 10000) { // reset count when it over 10000
                count = 0;
            }
            count++;

            if (err) {
                return console.log(`[${count}] get task failed, ${err}`);
            }

            let resJson = JSON.parse(res.body);

            if (resJson.taskId !== null) { // have a new task
                request.post({
                    url: 'http://127.0.0.1:3500/api/submitTask',
                    // headers: {
                    //     "Content-Type": "application/json"
                    // },
                    body: resJson,
                    json: true
                }, (error, response, body) => {
                    if(error) {
                        console.log(`[${count}] submit failed`, err);
                    } else {
                        console.log(`[${count}] task submitted`, body);
                    }
                });
            } else { // don't have a new task
                console.log(`[${count}] no task`);
            }
        });
    });
}, (err) => {
    console.log('get token failed, error: ', err);
});


