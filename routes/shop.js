const express = require("express");
const rootDir = require("../util/path");
const path = require("path");
const shopController = require("../controllers/shop");
const router = express.Router();
const isAuth = require("../middleware/is-auth");

router.get( '/', shopController.getIndex);

router.get( '/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get( '/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteItem);

router.get('/check-out', isAuth, shopController.getCheckout);

router.post('/create-order', isAuth, shopController.postOrder);

router.get( '/orders', isAuth, shopController.getOrders);

router.get( '/orders/:orderId', isAuth, shopController.getInvoice);


module.exports = router;