var creds = require('./credentials'),
    RSVP = require('rsvp'),
    nodewhal = require('nodewhal'),
    akb = require('./akb'),
    _ = require('underscore')._,
    friends = require('./friends');

var lastCommentRepliedTo = 't1_ch4w3kn',
    lastCheckTime = new Date(),
    timeBetweenChecks = 30500,
    unconfirmedTips = [];


RSVP.on('error', function(reason) {
    console.log('Uncaught error within RSVP promise:');
    console.assert(false, reason);
});

function handleComments(bot) {
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
            //c structure:
            /*
            - subreddit_id
            - link_title
            - link_author (String username)
            - likes (Array o null)
            - replies (Array o null)
            - saved (Bool)
            - id (sin el type prefix)
            - gilded
            - author (String username)
            - parent_id (full name)
            - approved_by
            - body (texto del comentario)
            - edited (Bool)
            - author_flair_css_class
            - downs
            - body_html
            - link_id (full name)
            - score_hidden (Bool)
            - name (full name, como id pero con prefix)
            - created (int)
            - author_flair_text
            - link_url
            - created_utc (int)
            - ups
            - num_reports
            - distinguished
            */
            var reply;
            console.log('CommentID: ' + thingID + '; Comment text:' + c.body);
            reply = akb.getComment(c);
            bot.comment(thingID, reply).then(function(botComment) {
                //botComment structure:
                /*
                botComment.json.data.things[0].data.
                (data tiene):
                - parent (thing id)
                - link (link id)
                - replies (array)
                - id ("t1_whatever")
                */
                console.log('@' + c.author + ': ' + reply);
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
        bot.listing('/r/friends/comments', {before: lastCommentRepliedTo}).then(handleComments(bot));
    }, wait);
}

function updateLastComment(bot) {
    return bot.listing('/user/AssKissingBot/comments', {max: 1}).then(function(comments) {
        lastCommentRepliedTo = _.values(comments)[0].parent_id;
        console.log('last comment: ' + lastCommentRepliedTo);
    })
}

function itsATip(message) {
    return message.author === 'changetip' &&
        message.body.indexOf('Hi AssKissingBot,\n\n**You received a Bitcoin tip via /r/changetip!**') === 0;
}

function itsAnUnconfirmedTip(message) {
    return message.author !== 'changetip' &&
        message.body.indexOf('/u/changetip') > -1;
}

function parseTip(text) {
    var words = text.substring(63).split(' ', 9),
        username = words[3].substring(3),//(remove the /u/)
        amount = words[6],
        unit = words[7];
    console.log('tip: user: ' + username + '; amount: ' + amount + '; unit: ' + unit);
    return {
        username: username,
        amount: amount,
        unit: unit
    };
}

function findUnconfirmedTip(username, callback) {
    var interval, tryNumber = 0;
    function find() {
        var tip = _.find(unconfirmedTips, function(t) {
            return t.author === username;
        });
        tryNumber++;
        if (tip) {
            callback(tip);
            clearInterval(interval);
        } else if (tryNumber > 5) {
            callback(false);
            clearInterval(interval);
        }
    }
    interval = setInterval(function() {
        find();
    }, 2000);
    find();
}

function handleTip(bot, tipMessage) {
    var tip = parseTip(tipMessage.body);
    friends.friend(tip.username);
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
            console.log(JSON.stringify(m));
            if (m.subject === 'Please stop') {
                //cancel subscription (unfriend)
                friends.unfriend(m.author);
            } else {
                /*
                 if (itsAnUnconfirmedTip(m)) {
                 console.log('I think ' + m.author + ' just tipped me. Waiting confirmation.');
                 unconfirmedTips.push(m);
                 }*/

                if (itsATip(m)) {
                    console.log('I\'ve been totally tipped!');
                    handleTip(bot, m);
                } else if (m.author === 'changetip') {
                    console.log('WARNING: Got a message from changetip that' +
                        ' was not detected as a tip.');
                }
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
    friends.init(bot).then(function() {
        console.log('friends updated, checking replies');
        setInterval(function() {
            checkReplies(bot);
        }, 35000);
    });
    /*//updateLastComment(bot).then(function() {
        checkComments(bot);
    //});
    */
}).catch(function(error) {
    console.log('Something went wrong');
    console.error(error.stack || error);
    throw error;
});