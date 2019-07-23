var express = require('express');
var router = express.Router();


router.get('/partials/:name', function(req, res, next) {
        res.render('partials/' + req.params.name, {
            title: 'Express'
        });
    });

module.exports = router;
