var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var commentSchema = new Schema({
    content  : String,
    date  : Date,
    author : String
});

module.exports.commentSchema = mongoose.model('Comment', commentSchema);

var exceptionSchema   = new Schema({
    name: String,
    pictureurl: String,
    description: String,
    date  : Date,
    author : String,
    comments  : [commentSchema]
});

module.exports.exceptionSchema = mongoose.model('Exception', exceptionSchema);