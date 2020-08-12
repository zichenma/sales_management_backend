var express = require('express');
var router = express.Router();

const ctrl = require('../controllers');

const routes = require('./routes');


router.get(routes.GET_PRODUCTS_BY_ORDER_ID, ctrl.getProductsByOrderId);

module.exports = router;
