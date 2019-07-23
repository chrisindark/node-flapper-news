var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var expressValidator = require('express-validator');

var PostSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    usersWhoUpvoted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    usersWhoDownvoted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

PostSchema.methods.readOnlyFields = function() {
    return ['timestamps', 'user', 'comments'];
};

PostSchema.methods.upvote = function(user, callback) {
    // If this user hasn't upvoted yet:
    if (this.usersWhoUpvoted.indexOf(user._id) === -1) {
        this.usersWhoUpvoted.push(user._id);
        this.upvotes += 1;

        // If this user has downvoted, revert the downvote:
        if (this.usersWhoDownvoted.indexOf(user._id) !== -1) {
            this.usersWhoDownvoted.splice(this.usersWhoDownvoted.indexOf(user._id), 1);
            this.downvotes -= 1;
        }

        this.save(callback);
    } else {
        // TODO this violates idempotency of PUT, we should have another PUT method for reverting an upvote - or does it?
        this.usersWhoUpvoted.splice(this.usersWhoUpvoted.indexOf(user._id), 1);
        this.upvotes--;

        this.save(callback);
    }
};

PostSchema.methods.downvote = function(user, callback) {
    if (this.usersWhoDownvoted.indexOf(user._id) === -1) {
        this.usersWhoDownvoted.push(user._id);
        this.downvotes++;

        // If this user has upvoted, revert the upvote:
        if (this.usersWhoUpvoted.indexOf(user._id) !== -1) {
            this.usersWhoUpvoted.splice(this.usersWhoUpvoted.indexOf(user._id), 1);
            this.upvotes--;
        }

        this.save(callback);
    } else {
        // TODO this violates idempotency of PUT, we should have another PUT method for reverting an upvote
        this.usersWhoDownvoted.splice(this.usersWhoDownvoted.indexOf(user._id), 1);
        this.downvotes--;

        this.save(callback);
    }
};

PostSchema.methods.isValid = function(req) {
    req.checkBody({
        'title': {
            notEmpty: true,
            errorMessage: 'This field is required.',
            isLength: {
                options: { max: 255 },
                errorMessage: 'Ensure this field has no more than 255 characters.'
            }
        },
        'link': {
            optional: true,
            isLength: {
                options: { max: 255 },
                errorMessage: 'Ensure this field has no more than 255 characters.'
            }
        }
    });

    return req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            return result.mapped();
        }
    });
};

mongoose.model('Post', PostSchema);
