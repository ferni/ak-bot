/**
 * Created by Fer on 16/06/2014.
 */

var Friends = require('./friends');

module.exports = lastReplies = (function() {
    var reps = [];

    return {
        add: function(username, userCommentID) {
            reps.unshift({username: username, userCommentID: userCommentID});
            while (reps.length > 500) {
                reps.pop();
            }
        },
        getLast: function() {
            //remove replies to non friends
            while (reps[0] && !Friends.isFriend(reps[0].username)) {
                reps.shift();
            }
            if (reps[0]) {
                return reps[0].userCommentID;
            }
        }
    };
}());
