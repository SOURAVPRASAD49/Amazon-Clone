const express = require("express");
const path = require("path");
const adminController = require("../controllers/admin");
const router = express.Router();
const rootDir = require("../util/path");
const isAuth = require("../middleware/is-auth")
const { body } = require("express-validator/check")

// /admin/add-product => get
router.get('/add-product', isAuth, adminController.getAddProduct);

//this middleware uses for both get and post request
// app.use('/product', (req, res, next) => {
//     console.log(req.body);
//     res.redirect('/');
// });

//for only get request, we use app.get()
//for only post request, we use app.post()


// /admin/add-product => post
router.post('/add-product',
    [
        body('title')
            .isString()
            .isLength({ min: 3 })
            .trim()
        ,
        body('price').isFloat(),
        body('description')
            .isLength({ min: 5, max: 400 })
            .trim()
    ],
    isAuth,
    adminController.postAddProduct
);

router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product',
    [
        body('title')
            .isString()
            .isLength({ min: 3 })
            .trim()
        ,
        body('price').isFloat(),
        body('description')
            .isLength({ min: 5, max: 400 })
            .trim()
    ],
    isAuth,
    adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;