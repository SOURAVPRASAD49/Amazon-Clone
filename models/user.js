//creating database with mongoose
const Order = require("../models/order");
const mongoose = require("mongoose");
const product = require("./product");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product'
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
});

//we can define methods here 
userSchema.methods.addToCart = function(product) {
    const cartProdutIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    let updatedCartItems = [...this.cart.items];
    if(cartProdutIndex >= 0){
        newQuantity = this.cart.items[cartProdutIndex].quantity + 1;
        updatedCartItems[cartProdutIndex].quantity = newQuantity;
    }
    else{
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        });
    }
    let updatedCart = {
        items: updatedCartItems
    }
    this.cart = updatedCart;
    
    return this.save();
}

userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(p => {
        return p.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = {items: []};
    return this.save();
}

module.exports = mongoose.model('User', userSchema);




// const Sequelize = require("sequelize");

// const sequelize = require("../util/database");

// const User = sequelize.define( 'user', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     name: {
//         type: Sequelize.STRING,
//     },
//     email: {
//         type: Sequelize.STRING,
//     }
// });

// module.exports = User;
//db using mongoDB
/*
const getdb = require("../util/database").getDb;
const mongodb = require("mongodb");
const { getDb } = require("../util/database");
const Product = require("../models/product");

class User {
    constructor(username, email, cart, id){
        this.name = username;
        this.email = email;
        this.cart = cart;//{items: []}
        this._id = id;
    }

    save() {
        const db = getDb();
        return db
        .collection('users')
        .insertOne(this)
        .then(result => {
            console.log('User created');
        })
        .catch(err => {
            console.log(err);
        });
    }

    addToCart(product){
        //if one product already allready exists, then findout that one
        const cartProdutIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString()  === product._id.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];
        if(cartProdutIndex >= 0){
            newQuantity = this.cart.items[cartProdutIndex].quantity + 1;
            updatedCartItems[cartProdutIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({
                productId: new mongodb.ObjectId(product._id), 
                quantity: newQuantity
            });
        }
        const updateCart = {items: updatedCartItems};
        //add that product to cart;
        const db = getDb();
        return db
        .collection('users')
        .updateOne({ _id: new mongodb.ObjectId(this._id) }, {
            $set: {cart: updateCart}
        });
    };

    getCart() {
        const db = getDb();
        const produtIds = this.cart.items.map(i => {
            return i.productId;
        });
        return db
        .collection('products')
        .find({_id: {$in: produtIds}})
        .toArray()
        .then(products => {
            return products.map(p => {
                return {...p, quantity: this.cart.items.find(i => {
                    return i.productId.toString() === p._id.toString()
                }).quantity};
            });
        })
        .catch(err => {
            console.log(err); 
        })
    }

    deleteItemFromCart(productId) {
        const db = getDb();
        const updatedCartItems = this.cart.items.filter(p => {
            return p.productId.toString() !== productId.toString();
        });
        return db
        .collection('users')
        .updateOne({ _id: new mongodb.ObjectId(this._id) }, {
            $set: {cart: {items: updatedCartItems}}
        });
    }

    addOrder() {
        const db = getDb();
        return this.getCart().then(products => {
            const order = {
                items: products,
                user: {
                    _id: new mongodb.ObjectId(this._id),
                    name: this.name
                }
            };
            return db.collection('orders').insertOne(order);
        })
        .then(reslt => {
            this.cart = {items: []};
            return db
            .collection('users')
            .updateOne(
                {_id: new mongodb.ObjectId(this._id)}, 
                {$set: {cart: {items: [] } } }
            )
        })
        .catch(err => {
            console.log(err);
        })
        
    }

    getOrder() {
        const db = getDb();
        return db
        .collection('orders')
        .find({'user._id': new mongodb.ObjectId(this._id)})
        .toArray();
    }

    static findById(userId){
        const db = getDb();
        return db
        .collection('users')
        .find({_id: new mongodb.ObjectId(userId)})
        .next()
        .then(user => {
            console.log(user);
            return user;
        })
        .catch(err => {
            console.log(err);
        });
    }
}

module.exports = User;
*/