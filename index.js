const express = require('express')
const app = express()
const port = 3000
const Base62 = require('./base62');

app.get('/', (request, response) => {
  var base62 = new Base62();
  response.send(base62.encode(123))
})

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})