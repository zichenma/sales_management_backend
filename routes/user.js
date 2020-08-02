var express = require('express');
var router = express.Router();

// 1.设置 （子路由）
router.post('/login', function(req, res, next) {
    // 因为用了 express.json()
  const { username, password } = req.body;
  res.json({
      errno: 0,
      data: {
          username,
          password
      }
  })
});

module.exports = router;
