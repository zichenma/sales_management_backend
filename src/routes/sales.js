var express = require('express');
var router = express.Router();

// Controllers
const ctrl = require('../controllers');
// ROUTES
const routes = require('./routes');

router.get(routes.GET_SALES_GROUP_BY_PERSON, ctrl.getSalesGroupByPerson);
router.get(routes.GET_SALES, ctrl.getSalesTable);
router.get(routes.GET_ORDER_BY_ORDER_ID, ctrl.getOrderByOrderId);



module.exports = router;
