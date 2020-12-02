// const mysql = require("mysql2");

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: 'SOUrav1234@@##'
// });

// module.exports = pool.promise();

//using sequelize

// const Sequelize = require("sequelize");

// const sequelize = new Sequelize('node-complete', 'root', 'SOUrav1234@@##', 
// {dialect : 'mysql',
//  host: 'localhost'
// });

// module.exports = sequelize;

//Using MongoDB
//one user password: iyKeiS3m9r6TWMbR
//link to connect to db: mongodb://sourav_prasad:iyKeiS3m9r6TWMbR@cluster0-shard-00-00.tt7v4.mongodb.net:27017,cluster0-shard-00-01.tt7v4.mongodb.net:27017,cluster0-shard-00-02.tt7v4.mongodb.net:27017/<dbname>?ssl=true&replicaSet=atlas-1xrblo-shard-0&authSource=admin&retryWrites=true&w=majority
//mongodb://sourav_prasad:iyKeiS3m9r6TWMbR@cluster0-shard-00-00.tt7v4.mongodb.net:27017,cluster0-shard-00-01.tt7v4.mongodb.net:27017,cluster0-shard-00-02.tt7v4.mongodb.net:27017/shop?ssl=true&replicaSet=atlas-1xrblo-shard-0&authSource=admin&retryWrites=true&w=majority
const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

//let's connect to the database
let _db;

const mongoConnect = (callback) => {
    MongoClient
    .connect('mongodb://127.0.0.1:27017/shop?authSource=admin',
    { useNewUrlParser: true, useUnifiedTopology: true}) 
    .then( client => {
        console.log('Connected!');
        _db = client.db();
        callback();
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
};

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'no database found!'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;