var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var mongoose = require('mongoose');
var User = mongoose.model('User');


var localOpts = {
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true,
    session: false
};

passport.use(new LocalStrategy(localOpts, function(req, username, password, done) {
    User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, { message: 'Unable to log in with provided credentials.' });
        }
        if (!user.validatePassword(password)) {
            return done(null, false, { message: 'Unable to log in with provided credentials.' });
        }
        return done(null, user);
    });
}));


var jwtOpts = {};
jwtOpts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOpts.secretOrKey = 'jwt-secret';
// jwtOpts.issuer = 'accounts.flapper-news.com';
// jwtOpts.audience = 'flapper-news.com';
passport.use(new JwtStrategy(jwtOpts, function(jwt_payload, done) {
    User.findOne({_id: jwt_payload._id}, function(err, user) {
        if (err) { return done(err, false); }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

