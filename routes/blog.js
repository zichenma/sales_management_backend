var express = require('express');
var router = express.Router();

// 1.设置 （子路由）
router.get('/list', function(req, res, next) {
    // 相当于：  JSON.stringify(resData) 
    // 并且自动加上了： res.setHeader('Content-type', 'application/json')
  res.json({
      errno: 0,
      data: [1, 2, 3]
  })
});

router.get('/detail', function(req, res, next) {
    res.json({
        errno: 0,
        data: 'OK'
    })
});

module.exports = router;
