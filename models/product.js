//using Mongoose for mongoDB

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports =  mongoose.model('Product', productSchema);

//in the database the collection would be 'all small letters and plural form'
//For Product it would be 'products'
//1. for saving the product in the database, we use save() method
//2. for fetchall the product in the database, we use find() method
//3. for fetching a single product in the database, we use findById() method
//4. for updating a product in the database, we use findById() method and make the changes
//5. for deleting a single , we user findByIdAndRemove() method


















/*

// const fs = require("fs");
// const path = require("path");
const Cart = require("./cart");
const db = require("../util/database");
// const p = path.join(
//     path.dirname(process.mainModule.filename),
//     'data',
//     'products.json'
// );

// const getProductsFromFile = (cb) => {
//     fs.readFile(p, (err, fileContent) => {
//         if(err){
//             cb([]);
//         }else{
//             cb(JSON.parse(fileContent));
//         }
//     });
// }

module.exports = class Product {
    constructor(id, title, imageUrl, price, description){
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price
    }

    //now we do not need the file system, we will connect the database;
    //using file system instead of database
    save() {
        getProductsFromFile( products => {
            if(this.id){
                const existingProductIndex = products.findIndex(prod => prod.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                    console.log(err);
                });
            } else{
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), (err) => {
                    console.log(err);
                });
            }
        });
    }

    static delete(id) {
        getProductsFromFile(products => {
            const product = products.find( prod => prod.id === id);
            const updatedProducts = products.filter(prod => prod.id !== id);
            fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                if(!err){
                    Cart.deleteProduct(id, product.price);
                }
            })
        });
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }
    
    static findById(id, cb){
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            cb(product);
        });
    }
    //using database that is mysql
    save(){
        return db.execute('INSERT INTO products(title, price, imageUrl, description) VALUES (?, ?, ?, ?)',
        [this.title, this.price, this.imageUrl, this.description]);
    }
    static fetchAll(){
        return db.execute( 'SELECT * FROM products');
    }

    static findById(id){
        return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
    }
}
*/

//using sequelize for database

// const Sequelize = require("sequelize");

// const sequelize = require("../util/database");

// const Product = sequelize.define( 'product', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     title: Sequelize.STRING,
//     price: {
//         type: Sequelize.INTEGER,
//         allowNull: false
//     },
//     imageUrl: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     description: {
//         type: Sequelize.STRING,
//         allowNull: false
//     }
// });

//Using MongoDB
/*
const mongodb = require("mongodb")
const getDb = require("../util/database").getDb;

class Product {
    constructor(title, price, description, imageUrl, id, userId){
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? new mongodb.ObjectId(id): null;
        this.userId = userId;
    }

    save() {
        const db = getDb();
        let dbOp;
        if(this._id){
            //update the product
            dbOp = db.collection('products').updateOne({_id: this._id}, {$set: this});
        } else {
            dbOp = db.collection('products').insertOne(this);
        }
        return dbOp.then( result => {
            console.log(result);
        }).catch(err => {
            console.log(err)
        });
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products')
            .find()
            .toArray()
            .then( products => {
                return products;
            })
            .catch(err => {
                console.log(err);
        });
    }

    static findById(prodId) {
        const db = getDb();
        return db.collection('products').find({_id: new mongodb.ObjectId(prodId)}).next().then(
            product => {
                return product;
            }
        ).catch(err => {
            console.log(err);
        })
    }

    static deleteById(prodId){
        const db = getDb();
        return db
        .collection('products')
        .deleteOne({_id: new mongodb.ObjectId(prodId)})
        .then(result => {
            console.log('Product Deleted');
        })
        .catch(err => {
            console.log(err);
        });
    }
}

module.exports = Product;
*/