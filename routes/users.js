var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var passport = require('passport');
var auth = passport.authenticate('jwt');


router.get('/users', auth, function(request, response, next) {
    User.find(function(err, users) {
        if (err) { return next(err); }

        response.json({'users': users});
    });
});

router.param('user', function(request, response, next, id) {
    var query = User.findById(id);

    query.exec(function(err, user) {
        if (err) { return next(err); }

        if (!user) { return next(new Error('can\'t find user')); }

        request.user = user;
        return next();
    });
});

router.get('/users/:user', auth, function(request, response, next) {
    response.json({'user': request.user});
});

module.exports = router;
