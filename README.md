# Private Notary Service

Project #4 of Udacity Blockchain Developer Nanodegree (ND1309)


### Summary

This project built on Node with the help of ExpressJS sets up a RESTful private notary service. **The blockchain ID validation & star registration flow** for the notary service is as follows -

1. **POST /requestValidation** - Notify server that you'd like to whitelist a wallet address
  ```
  curl -X "POST" "http://localhost:8000/requestValidation" \
       -H 'Content-Type: application/json; charset=utf-8' \
       -d $'{"address": "1F8R6PkAzBwjSN7L9bXDLC3CX7cQnfLsCC"}'

  {"address":"1F8R6PkAzBwjSN7L9bXDLC3CX7cQnfLsCC", "message":"1F8R6PkAzBwjSN7L9bXDLC3CX7cQnfLsCC:1540932546:starRegistry", "timestamp":1540932546, "validationWindow":300}
  ```
2. **POST /message-signature/validate** - Verify that you have the credentials for the wallet address by signing the message in the above response
  ```
  curl -X "POST" "http://localhost:8000/message-signature/validate" \
       -H 'Content-Type: application/json; charset=utf-8' \
       -d $'{"address": "1F8R6PkAzBwjSN7L9bXDLC3CX7cQnfLsCC", "signature": "HzELun5FbMPhPa+djhwZebjOOXpV+FOA/fDcM2LGzT2QKwy9cMtiwaCKSNCJhDj3vXK73vE0ToHpG+a6lGc1pRI="}'

  {"registerStar":true, "status":{"address":"1F8R6PkAzBwjSN7L9bXDLC3CX7cQnfLsCC", "requestTimeStamp":1540932546, "message":"1F8R6PkAzBwjSN7L9bXDLC3CX7cQnfLsCC:1540932546:starRegistry", "validationWindow":146, "messageSignature":"valid"}}
  ```
3. **POST /block** - Notify server that you'd like to whitelist a wallet address
  ```
  curl -X "POST" "http://localhost:8000/block" \
       -H 'Content-Type: application/json; charset=utf-8' \
       -d $'{"address": "1F8R6PkAzBwjSN7L9bXDLC3CX7cQnfLsCC",
    "star": {
      "dec": "-25° 24\' 23.9",
      "ra": "15h 59m 1.0s",
      "story": "Found star using https://www.random.com/sky/"
    }}'

  {"hash":"3af153e9e9a3339c02a82a592f7f9ae703c06ea6759ab03415d6764af8deccfc", "height":5, "body":{"address":"1F8R6PkAzBwjSN7L9bXDLC3CX7cQnfLsCC", "star":{"dec":"-25° 24' 23.9", "ra":"15h 59m 1.0s", "story":"466f756e642073746172207573696e672068747470733a2f2f7777772e72616e646f6d2e636f6d2f736b792f"}}, "time":"1540932935248", "previousBlockHash":"a70653c895e236cead18f6a20ae24bbde13855bbfad86fcb9fba36aae43263ae"}
  ```

Various search / **stars lookup** endpoints are as follows -

a. **GET /block/:height** - Fetch block at given height
  ```
  curl "http://localhost:8000/block/1"

  {"hash":"3af153e9e9a3339c02a82a592f7f9ae703c06ea6759ab03415d6764af8deccfc", "height":1, "body":{"address":"1F8R6PkAzBwjSN7L9bXDLC3CX7cQnfLsCC", "star":{"dec":"-25° 24' 23.9", "ra":"15h 59m 1.0s", "story":"466f756e642073746172207573696e672068747470733a2f2f7777772e72616e646f6d2e636f6d2f736b792f"}}, "time":"1540932935248", "previousBlockHash":"a70653c895e236cead18f6a20ae24bbde13855bbfad86fcb9fba36aae43263ae"}
  ```
b. **GET /stars/hash:hash** - Fetch stars by their block hash
  ```
  curl "http://localhost:8000/stars/hash:3af153e9e9a3339c02a82a592f7f9ae703c06ea6759ab03415d6764af8deccfc"

  {"hash":"3af153e9e9a3339c02a82a592f7f9ae703c06ea6759ab03415d6764af8deccfc", "height":1, "body":{"address":"1F8R6PkAzBwjSN7L9bXDLC3CX7cQnfLsCC", "star":{"dec":"-25° 24' 23.9", "ra":"15h 59m 1.0s", "story":"466f756e642073746172207573696e672068747470733a2f2f7777772e72616e646f6d2e636f6d2f736b792f"}}, "time":"1540932935248", "previousBlockHash":"a70653c895e236cead18f6a20ae24bbde13855bbfad86fcb9fba36aae43263ae"}
  ```
c. **GET /stars/address:address** - Fetch stars registered under a given wallet address
  ```
  curl "http://localhost:8000/stars/address:1F8R6PkAzBwjSN7L9bXDLC3CX7cQnfLsCC"

  [{"hash":"3af153e9e9a3339c02a82a592f7f9ae703c06ea6759ab03415d6764af8deccfc", "height":1, "body":{"address":"1F8R6PkAzBwjSN7L9bXDLC3CX7cQnfLsCC", "star":{"dec":"-25° 24' 23.9", "ra":"15h 59m 1.0s", "story":"466f756e642073746172207573696e672068747470733a2f2f7777772e72616e646f6d2e636f6d2f736b792f"}}, "time":"1540932935248", "previousBlockHash":"a70653c895e236cead18f6a20ae24bbde13855bbfad86fcb9fba36aae43263ae"}]
  ```

-----------------
### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the [Node.js® web site](https://nodejs.org/en/).

Use NPM to install all [dependencies](/package.json)
```
npm install
```


### Starting the server

You may start the API server with `npm start` or `node server.js`


### Testing

The test folder contains the relevant code for testing the API endpoints.

Please note that the tests currently **don't** use a separate test database!
```
npm test
```
