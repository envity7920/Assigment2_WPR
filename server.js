const express = require('express');
const mongodb = require('mongodb');
const app = express();
const api = require('./routes/api.js');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());






// start server 
let database = null;
async function startServer() {
    const client = await mongodb.MongoClient.connect("mongodb://localhost:27017/a2-wpr-database");
    database = client.db();

    function setDatabase(req, res, next) {
        req.database = database;
        next();
    }

    app.use(setDatabase)
    app.use(api);

    await app.listen(5000);
    console.log('listening....');

}








startServer();