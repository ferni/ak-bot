
//    r.comment('t3_23za7o'
var creds = require('./credentials'),
    nodewhal = require('nodewhal'),
    akb = require('./akb'),
    _ = require('underscore')._;



var lastCommentRepliedTo = 't1_ch33hcb';

function Reply() {
    this.parentID;
    this.replyIndex;
}

function Subscription() {
    this.username;
    this.replies;
    //should only reply to comments after the subscription date
    this.date;
}



nodewhal('AssKissingBot/0.1 by frrrni').login(creds.user, creds.passwd).then(function(bot) {
    var options = {};
    if (lastCommentRepliedTo) {
        options.before = lastCommentRepliedTo;
    }
    setInterval(function() {
        console.log('Checking new comments');
        bot.listing('/r/friends/comments', {before: lastCommentRepliedTo}).then(function(comments) {
            if (_.size(comments) > 0) {
                console.log('Found ' + _.size(comments) + '!');
            } else {
                console.log('Found none.');
                return;
            }
            console.log(JSON.stringify(comments));
            _.each(comments, function(c, thingID) {
                console.log('CommentID: ' + thingID + '; Comment text:' + c.body);
                bot.comment(thingID, akb.random(akb.replies.standard)).then(function(c1) {
                    console.log('Comment function returns: ' + c1);
                    console.log('I think I replied: ' + c1.body);
                    lastCommentRepliedTo = thingID;
                });

            });
        });
    }, 15000);


    /*setInterval(function() {
        //check friends comments

    }, 5000);*/
});