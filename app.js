
//    r.comment('t3_23za7o'
var creds = require('./credentials'),
    nodewhal = require('nodewhal'),
    akb = require('./akb'),
    _ = require('underscore')._;



var lastCommentRepliedTo = 't1_ch33hcb',
    subscriptions = [],
    lastCheckTime = new Date(),
    timeBetweenChecks = 30500;

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

function dealWithComments(bot) {
    return function(comments) {
        var count = _.size(comments),
            dealtWith = 0;
        if (count > 0) {
            console.log('Found ' + count + '!');
        } else {
            console.log('Found none.');
            checkComments();
        }
        console.log(JSON.stringify(comments));
        _.each(comments, function(c, thingID) {
            console.log('CommentID: ' + thingID + '; Comment text:' + c.body);
            bot.comment(thingID, akb.random(akb.replies.standard)).then(function(c1) {
                console.log('Comment function returns: ' + JSON.stringify(c1));
                console.log('I think I replied: ' + c1.body);
                lastCommentRepliedTo = thingID;
                dealtWith++;
                if (dealtWith >= count) {
                    checkComments();
                }
            }, function(error) {
                console.log('There was a problem trying to comment: ' + error);
                dealtWith++;
                if (dealtWith >= count) {
                    checkComments();
                }
            });

        });
    }
}

function checkComments(bot) {
    var wait = timeBetweenChecks - (new Date() - lastCheckTime);
    if (wait < 0) {
        wait = 0;
    }
    console.log('Waiting ' + wait + ' before checking again.');
    setTimeout(function() {
        lastCheckTime = new Date();
        console.log('Checking new comments. Time:' + lastCheckTime);
        bot.listing('/r/friends/comments', {before: lastCommentRepliedTo}).then(dealWithComments(bot));
    }, wait);
}

function getFriends(bot) {
    return bot.get('https://ssl.reddit.com/prefs/friends.json').then(function (friends) {
        return friends[0].data.children;
    });
}

function initSubscriptions(bot) {

}

nodewhal('AssKissingBot/0.1 by frrrni').login(creds.user, creds.passwd).then(function(bot) {
    getFriends(bot).then(function(friends) {
        console.log(JSON.stringify(friends));
    });
    //checkComments(bot);
});