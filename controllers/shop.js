//These all methods are using MongoDB
const Product = require("../models/product");
const user = require("../models/user");
const Order = require("../models/order");
const fs = require("fs");
const path = require('path');
const { Stream } = require("stream");
const PDFDocumentation = require("pdfkit");
const product = require("../models/product");
const ITEMS_PER_PAGE = 2;
//for shop
exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.countDocuments()
        .then(numproducts => {
            totalItems = numproducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                currentPage: page,
                totalProducts: totalItems,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

//for products
exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.countDocuments()
        .then(numproducts => {
            totalItems = numproducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Proucts',
                path: '/products',
                currentPage: page,
                totalProducts: totalItems,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

//for fectching a single product
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

//for getting the cart products
exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: products
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

//for posting the product to add to cart
exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

//for deleting the cart item
exports.postCartDeleteItem = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.removeFromCart(prodId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

//for checking out the products
exports.getCheckout = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            let total = 0;
            products.forEach(p => {
                total += p.quantity * p.productId.price;
            })
            res.render('shop/checkout', {
                pageTitle: 'Checkout',
                path: '/checkout',
                products: products,
                totalSum: total
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

//for posting the products from cart to order
exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            });
            const order = new Order({
                user: {
                    name: req.session.user.name,
                    email: req.session.user.email,
                    userId: req.session.user
                },
                products: products
            });
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};


exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error('No order found.'));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'));
            }
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);
            const pdfDoc = new PDFDocumentation();
            res.setHeader('Content-type', 'application/pdf');
            res.setHeader('Content-disposition', 'inline; filename="' + invoiceName);
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc
                .fontSize(26)
                .text('Invoices', {
                    underline: true
                });
            pdfDoc.fontSize(10).text('            ');
            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += (prod.quantity * prod.product.price);
                pdfDoc
                    .fontSize(14)
                    .text('Title: ' + prod.product.title);
                pdfDoc
                    .fontSize(14)
                    .text('Product Quantity and Price: ' +
                        prod.quantity +
                        ' x ' +
                        '$' +
                        prod.product.price
                    );
                pdfDoc.text('            ');
            });
            pdfDoc.fontSize(26).text('----------------------------------');
            pdfDoc.fontSize(20).text('Total Price is $' + totalPrice);

            pdfDoc.end();
            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         return next(err);
            //     }
            //     res.setHeader('Content-disposition', 'inline; filename="' + invoiceName);
            //     res.setHeader('Content-type', 'application/pdf');
            //     res.send(data);
            // })
            // const file = fs.createReadStream(invoicePath);
            // res.setHeader('Content-type', 'application/pdf');
            // res.setHeader('Content-disposition', 'inline; filename="' + invoiceName);
            // file.pipe(res);
        })
        .catch(err => {
            next(err);
        });
}

/* These all logics are using MySQL
approach -2
    Product.findAll( {where: { id: prodId }})
        .then( products => {
            res.render('shop/product-details' , {
                product: products[0],
                pageTitle: products[0].title,
                path: '/products'
            });
        })
        .catch(err => {
            console.log(err);
        })


exports.getCart = (req, res, next) => {
    req.user.getCart().then(
        cart => {
            return cart.getProducts().then(
                products => {
                    res.render('shop/cart', {
                        pageTitle: 'Your Cart',
                        path: '/cart',
                        products: products
                    });
                }
            ).catch(err => {
                console.log(err);
            })
        }
    ).catch(err => {
        console.log(err);
    });

    // Cart.getCart( cart => {
    //     const cartPrice = cart.totalPrice;
    //     Product.fetchAll(products => {
    //         const cartProducts = [];
    //         for(product of products) {
    //             const cartProductData = cart.products.find( prod => prod.id === product.id);
    //             if(cartProductData){
    //                 cartProducts.push({productData: product, qty: cartProductData.qty});
    //             }
    //         }
    //         res.render('shop/cart', {
    //             pageTitle: 'Your Cart',
    //             path: '/cart',
    //             products: cartProducts,
    //             price: cartPrice
    //         });
    //     });
    // });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart().then(
        cart => {
            fetchedCart = cart;
            return cart.getProducts({where: {id: prodId}})
        }
    )
    .then( products => {
        let product;
        if(products.length > 0){
            product = products[0];
        }
        if(product){
            const oldQuantity = product.cartItem.quantity;
            newQuantity = oldQuantity + 1;
            return product;
        }
        return Product.findByPk(prodId);
    })
    .then(
        product => {
            return fetchedCart.addProduct(product, { through: { quantity: newQuantity} });
        }
    )
    .then(
        () => {
            res.redirect('/cart');
        }
    ).catch( err => {
        console.log(err);
    });
}

exports.postCartDeleteItem = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.getCart().then(
        cart => {
            return cart.getProducts( {where: {id: prodId} } );
        }
    )
    .then( products => {
        const product = products[0];
        return product.cartItem.destroy();
    })
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => {
        console.log(err);
    });
    // Product.findById(prodId, product =>{
    //     Cart.deleteProduct(prodId, product.price);
    //     res.redirect('/cart');
    // });
}

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user
        .getCart()
        .then( cart => {
            fetchedCart = cart;
            return cart.getProducts()
        })
        .then( products => {
            req.user.createOrder()
                .then( order => {
                    return order.addProducts(products.map( product => {
                        product.orderItem = { quantity: product.cartItem.quantity };
                        return product;
                    }))
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .then(result => {
            return fetchedCart.setProducts(null);
        })
        .then( result => {
            res.redirect('/orders');
        })
        .catch(err => {
            console.log(err);
        })
}

exports.getOrders = (req, res, next) => {
    req.user
        .getOrders( {include: ['products']})
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => {
            console.log(err);
        })
};

*/

