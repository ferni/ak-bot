/**
 * Created by Fer on 16/06/2014.
 */

var Friends = require('./friends'),
    _ = require('underscore')._;

module.exports = lastReplies = (function() {
    var reps = [];

    return {
        init: function(bot) {
            //load last reply
            var self = this;
            return bot.listing('/r/friends/comments', {max: 1})
                .then(function(coms){
                    var c = _.first(_.values(coms));
                    if (c) {
                        console.log('adding ' + c.author + ' to last replies');
                        self.add(c.author, c.name);

                    }
                });
        },
        add: function(username, userCommentID) {
            console.log('added ' + username + ' to last replies');
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
