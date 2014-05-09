
//    r.comment('t3_23za7o'
var creds = require('./credentials'),
    nodewhal = require('nodewhal'),
    akb = require('./akb'),
    _ = require('underscore')._;

var lastCommentRepliedTo = 't1_ch33hcb',
    lastCheckTime = new Date(),
    timeBetweenChecks = 30500;


function dealWithComments(bot) {
    return function(comments) {
        var count = _.size(comments),
            dealtWith = 0;
        if (count > 0) {
            console.log('Found ' + count + '!');
        } else {
            console.log('Found none.');
            checkComments(bot);
        }
        console.log(JSON.stringify(comments));
        _.each(comments, function(c, thingID) {
            console.log('CommentID: ' + thingID + '; Comment text:' + c.body);
            bot.comment(thingID, akb.getComment(c)).then(function(c1) {
                console.log('Comment function returns: ' + JSON.stringify(c1));
                console.log('I think I replied: ' + c1.json.data.things[0].data.contentText);
                lastCommentRepliedTo = thingID;
                dealtWith++;
                if (dealtWith >= count) {
                    checkComments(bot);
                }
            }, function(error) {
                console.log('There was a problem trying to comment: ' + error);
                dealtWith++;
                if (dealtWith >= count) {
                    checkComments(bot);
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
    setTimeout(function() {
        lastCheckTime = new Date();
        bot.listing('/r/friends/comments', {before: lastCommentRepliedTo}).then(dealWithComments(bot));
    }, wait);
}

function getFriends(bot) {
    return bot.get('https://ssl.reddit.com/prefs/friends.json').then(function (friends) {
        return friends[0].data.children;
    });
}

function updateLastComment(bot) {
    return bot.listing('/user/AssKissingBot/comments', {max: 1}).then(function(comments) {
        lastCommentRepliedTo = _.values(comments)[0].parent_id;
        console.log('last comment: ' + lastCommentRepliedTo);
    })
}

function itsATip(message) {
    return message.author === 'changetip' &&
        message.body.indexOf('Hi AssKissingBot,\n\n**You\'ve been tipped with /r/changetip!**') === 0;
}

function parseTip(text) {
    var words = text.substring(63).split(' ', 9),
        user = words[2].substring(3),
        amount = words[5],
        unit = words[6];
    console.log('tip: user: ' + user + '; amount: ' + amount + '; unit: ' + unit);
}

function checkReplies(bot) {
    bot.listing('/message/unread').then(function(messages) {
        var ids = '',
            first = true;
        _.each(messages, function(m, id) {
            if (!first) {
                ids += ',';
            }
            first = false;
            console.log(m.author + ': "' + m.body + '"');
            if (itsATip(m)) {
                console.log('I\'ve been totally tipped!');
                parseTip(m.body);
            } else if (m.author === 'changetip') {
                console.log('WARNING: Got a message from changetip that' +
                    ' was not detected as a tip.');
            }

            ids += id;
        });
        if (_.size(messages) > 0) {
            console.log('marking as read: ' + ids);
            bot.post('http://www.reddit.com/api/read_message', {
                form: {
                    id: ids,
                    uh: bot.session.modhash
                }
            }).then(function() {
                console.log('messages marked as read.');
            }, function(error) {
                console.log('Error reading messages: ' + error);
            });
        }

    });
}

nodewhal('AssKissingBot/0.1 by frrrni').login(creds.user, creds.passwd).then(function(bot) {
    updateLastComment(bot).then(function() {
        checkComments(bot);
    });
    setInterval(function() {
        checkReplies(bot);
    }, 35000);
});
