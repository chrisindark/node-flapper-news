var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var passport = require('passport');
var auth = passport.authenticate('jwt');


router.param('post', function(req, res, next, id) {
    console.log('here1');
    var query = Post.findById(id);
    query.exec(function(err, post) {
        if (err) { return next(err); }
        if (!post) { return next(new Error('can\'t find post')); }

        req.post = post;
        return next();
    });
});

router.route('/posts/:post/comments')
    // get comments for a post
    .get(function (req, res, next) {
        Comment.find({post: req.post}).populate({
            path: 'user',
            select: 'username'
        }).then(function(comments) {
            res.json({'comments': comments});
        }).catch(function (err) {
            return next(err);
        });
    })
    .post(auth, function(req, res, next) {
        var comment = new Comment();
        comment.isValid(req).then(function (result) {
            if (result) { return res.json(result); }
            comment.body = req.body.body;
            comment.post = req.post;
            comment.user = req.user._id;
            comment.upvotes = 1;
            comment.usersWhoUpvoted.push(req.user._id);

            comment.save(function (err, comment) {
                if (err) { return next(err); }

                req.post.save(function (err, post) {
                    if (err) { return next(err); }

                    Comment.findOne(comment).populate({
                        path: 'user',
                        select: 'username'
                    }).then(function (comment) {
                        res.json({'comment': comment});
                    });
                });
            });
        });
    });

// Map logic to route parameter 'comment'
router.param('comment', function(req, res, next, id) {
    console.log('here2');
    var query = Comment.findById(id);

    query.exec(function(err, comment) {
        if (err) { return next(err); }
        if (!comment) { return next(new Error('can\'t find comment')); }

        req.comment = comment;
        return next();
    });
});

router.route('/posts/:post/comments/:comment')
    .get(function (req, res, next) {
        Comment.findOne(req.comment).populate({
            path: 'user',
            select: 'username'
        }).exec(function (err, comment) {
            if (err) { return next(err); }
            res.json({'comment': comment});
        });
    })
    .put(auth, function (req, res, next) {
        // TODO better, more standard way to do this?
        if (req.comment.author !== req.payload._id) {
            res.statusCode = 401;
            return res.end('invalid authorization');
        }
        req.comment.isValid(req).then(function (result) {
            if (result) { return res.json(result); }
        });

        req.comment.save(function (err, comment) {
            if (err) { return next(err); }
            res.json({'comment': comment});
        });
    })
    .delete(auth, function(req, res, next) {
        // TODO better, more standard way to do this?
        if (req.comment.author !== req.payload._id) {
            res.statusCode = 401;
            return res.end('invalid authorization');
        }

        // TODO better way to handle this?
        req.post.comments.splice(req.post.comments.indexOf(req.comment), 1);
        req.post.save(function(err, post) {
            if (err) { return next(err); }

            req.comment.remove(function(err) {
                if (err) { return next(err); }
                res.statusCode = 204;
                res.send();
            });
        });
    });

router.route('/posts/:post/comments/:comment/upvote')
    .put(auth, function(req, res, next) {
        req.comment.upvote(req.payload, function(err, comment) {
            if (err) { return next(err); }

            Comment.populate(comment, {
                path: 'author',
                select: 'username'
            }).then(function(comment) {
                res.json(comment);
            });
        });
    });

router.route('/posts/:post/comments/:comment/downvote')
    .put(auth, function(req, res, next) {
        req.comment.downvote(req.payload, function(err, comment) {
            if (err) { return next(err); }

            Comment.populate(comment, {
                path: 'author',
                select: 'username'
            }).then(function(comment) {
                res.json(comment);
            });
        });
    });

module.exports = router;
