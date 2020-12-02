const Product = require("../models/product");
const mongodb = require("mongodb");
const { validationResult } = require("express-validator/check");
const fileHelper = require("../util/file");
//for adding a product
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {   
        pageTitle: 'Add-product', 
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

//for sending the datas of the product to add
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const image = req.file;
    if(!image){
        return res.status(422).render('admin/edit-product', {    
            pageTitle: 'Add Product', 
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: 'Attach file is not an image',
            validationErrors: []
        });
    }
    const errors = validationResult(req);
    console.log(errors.array());
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', {    
            pageTitle: 'Add Product', 
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
    const imageUrl = image.path;
    //Now using mongodb
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        //we can simply pass the req.user also
        //mongoose will automatically extract the id
        userId: req.session.user
    });
    product.save()
        .then(result => {
            console.log('created product!');
            res.redirect('/admin/products');
        })
        .catch(err => {
            // res.redirect('/500');
            // console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

//for fetching all the products into the admin products
exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
        
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

//for editing the product
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode){
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId).then(
        product => {
            if(!product){
                return res.redirect('/');
            }
            res.render('admin/edit-product', {    
                pageTitle: 'Edit-product', 
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                errorMessage: null,
                hasError: false,
                validationErrors: []
            });
        }
    ).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

//for editing new fields of the product
exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const image = req.file;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const errors = validationResult(req);
    console.log(errors.array());
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', {    
            pageTitle: 'Edit Product', 
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription,
                _id: prodId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
    Product.findById(prodId).then(product => {
        if(product.userId.toString() !== req.user._id.toString()){
            return res.redirect('/');
        }
        product.title = updatedTitle, 
        product.price = updatedPrice, 
        product.description = updatedDescription
        if(image){
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path
        } 
        return product.save().then(result => {
            console.log('UPDATED PRODUCT');
            res.redirect('/admin/products');
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

//for deleting the produt 
exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId).then(
        product => {
            if(!product) {
                return next(new Error('Product not found'));
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({_id: prodId, userId: req.user._id})
        }
    )
    .then(result => {
        console.log('DESTROYED PRODCUT');
        res.status(200).json({
            message: 'Success!'
        })
    })
    .catch(err => {
        res.status(500).json({
            message: ' Deleting Product failed. '
        })
    });
}

/*
// req.user.createProduct({
    //     title: title,
    //     price: price,
    //     description: description,
    //     imageUrl: imageUrl,
    //     //instead this we can user another way
    //     //userId: req.user.id
    // })
    // .then(result => {
    //     //console.log(result);
    //     console.log('Created Product');
    //     res.redirect('/');
    // })
    // .catch(err => {
    //     console.log(err);
    // });
    // Product.create( {
    //     title: title,
    //     price: price,
    //     description: description,
    //     imageUrl: imageUrl,
    //     //instead this we can user another way
    //     //userId: req.user.id
    // })
    // .then(result => {
    //     //console.log(result);
    //     console.log('Created Product');
    //     res.redirect('/');
    // })
    // .catch(err => {
    //     console.log(err);
    // });
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode){
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findByPk(prodId).then(
        product => {
            if(!product){
                return res.redirect('/');
            }
            res.render('admin/edit-product', {    
                pageTitle: 'Edit-product', 
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            });
        }
    ).catch(err => {
        console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;

    Product.findByPk(prodId).then(
        product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.imageUrl = updatedImageUrl;
            product.description = updatedDescription
            return product.save();
        }
    )
    .then(result => {
        console.log('UPDATED PRODUCT');
        res.redirect('/admin/products');
    })
    .catch( err => console.log(err));
}

exports.postDeleteProducts = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findByPk(prodId).then(
        product => {
            return product.destroy();
        }
    )
    .then(result => {
        console.log('DESTROYED PRODCUT');
        res.redirect('/');
    })
    .catch(err => {
        console.log(err);
    });
}

exports.getProducts = (req, res, next) => {
    Product.findAll().then(
        product => {
            res.render('admin/products', {
                prods: product,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        }
    ).catch( err => {
        console.log(err);
    });
};
*/