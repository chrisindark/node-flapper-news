var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var Post = mongoose.model("Post");
var Comment = mongoose.model("Comment");
var User = mongoose.model("User");
var passport = require('passport');
var auth = passport.authenticate('jwt');


router.route('/posts')
    .get(function(req, res, next) {
        Post.find({})
            // .populate('user', 'username')
            .populate({
                // Load the user objects, but only the id and username, for security reasons
                path: 'user',
                select: 'username'
            })
            .exec(function(err, posts) {
                if (err) { return next(err); }
                res.json({'posts': posts});
            });
    })
    .post(auth, function(req, res, next) {
        var post = new Post();
        post.isValid(req).then(function (result) {
            if (result) { return res.json(result); }
            post.title = req.body.title;
            post.link = req.body.link;
            post.user = req.user._id;
            post.upvotes = 1;
            post.usersWhoUpvoted.push(req.user._id);

            post.save(function (err, post) {
                if (err) { return next(err); }

                Post.findOne(post).populate({
                    path: 'user',
                    select: 'username'
                }).exec(function (err, post) {
                    if (err) { return next(err); }
                    res.json({'post': post});
                });
            });
        });
    });

// Map logic to route parameter 'post'
router.param('post', function(req, res, next, id) {
    var query = Post.findById(id);

    query
        .populate('user', 'username')
        .populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: 'username'
            }
        })
        .exec(function (err, post){
            if (err) { return next(err); }
            if (!post) { return next(new Error('can\'t find post')); }
            console.log(post.comments);
            // post.comments.populate({
                // path: 'user',
                // select: 'username'
            // }).exec(function(err, comments) {
                // if (err) { return next(err); }
                req.post = post;
                return next();
            // });
        });
});

router.route('/posts/:post')
    .get(function(req, res, next) {
        res.json({'post': req.post});
    })
    .delete(auth, function(req, res, next) {
        // TODO better, more standard way to do this?
        if (req.post.author !== req.payload._id) {
            res.statusCode = 401;
            return res.end('invalid authorization!');
        }

        // TODO: I wonder if there is a way to define a cascade strategy
        Comment.remove({ post: req.post }, function(err) {
            if (err) { return next(err); }

            req.post.remove(function(err) {
                if (err) { return next(err); }
                res.statusCode = 204;
                res.send();
            });
        });
    })
    .put(auth, function(req, res, next) {
        if (req.post.author !== req.payload._id) {
            res.statusCode = 401;
            return res.end('invalid authorization!');
        }

        req.post.isValid(req).then(function (result) {
            if (result) { return res.json(result); }

            req.post.save(function (err, post) {
                if (err) { return next(err); }
                res.json({'post': post});
            });
        });
    });

// Upvote post
router.route('/posts/:post/upvote')
    .put(auth, function(req, res, next) {
        req.post.upvote(req.payload, function(err, post) {
            if (err) { return next(err); }

            Post.populate(post, {
                path: 'author',
                select: 'username'
            }).then(function(post) {
                res.json({'post': post});
            });
        });
    });

// Downvote post
router.route('/posts/:post/downvote')
    .put(auth, function(req, res, next) {
        req.post.downvote(req.payload, function(err, post) {
            if (err) { return next(err); }

            Post.populate(post, {
                path: 'author',
                select: 'username'
            }).then(function(post) {
                res.json({'post': post});
            });
        });
    });

module.exports = router;
