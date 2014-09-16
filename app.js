var creds = require('./credentials'),
    RSVP = require('rsvp'),
    nodewhal = require('./nodewhal.js'),
    _ = require('underscore')._,
    Friends = require('./friends'),
    Tips = require('./tips'),
    Comments = require('./comments'),
    lastReplies = require('./last-replies'),
    userThreadRegistry = {};

var lastCheckTime = new Date(),
    timeBetweenChecks = 30500;


RSVP.on('error', function(reason) {
    console.log('Uncaught error within RSVP promise:');
    console.assert(false, reason);
});

function shouldReply(comment) {
    return !userThreadRegistry[comment.link_id] ||
        !userThreadRegistry[comment.link_id][comment.author];
}

function registerComment(comment) {
    var thread;
    if (!userThreadRegistry[comment.link_id]) {
        userThreadRegistry[comment.link_id] = {};
    }
    thread = userThreadRegistry[comment.link_id];
    if (!thread[comment.author]) {
        thread[comment.author] = 1;
    } else {
        thread[comment.author]++;
    }
}

function handleComments(bot) {
    return function(comments) {
        comments = _.filter(comments, function(c) {
            return Friends.isFriend(c.author) &&
                !(c.body.indexOf('/u/changetip') > -1);
        });
        var count = _.size(comments),
            dealtWith = 0;
        if (count <= 0) {
            checkComments(bot);
        }
        _.each(comments, function(c) {
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
            console.log(c.author + ': ' + c.body);
            if (shouldReply(c)) {
                Comments.praise(c.name, c.author).then(function(botComment) {
                    //botComment structure:
                    /*
                     botComment.json.data.things[0].data.
                     (data tiene):
                     - parent (thing id)
                     - link (link id)
                     - replies (array)
                     - id ("t1_whatever")
                     */
                    registerComment(c);
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
            } else {
                dealtWith++;
                if (dealtWith >= count) {
                    checkComments(bot);
                }
            }

        });
    }
}

function checkComments(bot) {
    var wait = timeBetweenChecks - (new Date() - lastCheckTime);
    if (wait < 0) {
        wait = 0;
    }
    setTimeout(function() {
        var options;
        if (lastReplies.getLast()) {
            options = {before: lastReplies.getLast()};
        } else {
            options = {max: 1};
        }
        lastCheckTime = new Date();
        bot.listing('/r/friends/comments', options)
            .then(handleComments(bot));
    }, wait);
}

function checkReplies(bot) {
    bot.listing('/message/unread').then(function(messages) {
        var ids = '',
            first = true,
            tip;
        _.each(messages, function(m, id) {
            /*
             m structure: {
             "body":"asdfasdf",
             "link_title":"asdfsadf",
             "was_comment":true,
             "first_message":null,
             "name":"t1_ckjiq5x",
             "first_message_name":null,
             "created":1410863982,
             "dest":"AssKissingBot",
             "author":"frrrni",
             "created_utc":1410835182,
             "body_html":"&lt;!-- SC_OFF --&gt;&lt;div class=\"md\"&gt;&lt;p&gt;asdfasdf&lt;/p&gt;\n&lt;/div&gt;&lt;!-- SC_ON --&gt;",
             "subreddit":"dugroup",
             "parent_id":"t1_ci9cxab",
             "distinguished":null,
             "likes":null,
             "context":"/r/dugroup/comments/28bp2y/asdfsadf/ckjiq5x?context=3",
             "replies":null,
             "new":true,
             "id":"ckjiq5x",
             "subject":"respuesta a comentario"
             }
             */
            if (!first) {
                ids += ',';
            }
            first = false;
            console.log(m.author + ' @me: ' + m.body);
            if (m.subject === 'Please stop') {
                //cancel subscription (unfriend)
                Friends.unfriend(m.author);
            } else {
                tip = Tips.tryParse(m);
                if (tip) {
                    console.log('I\'ve been totally tipped!');
                    Friends.friend(tip.username);
                }
            }

            ids += id;
        });
        if (_.size(messages) > 0) {
            bot.post('http://www.reddit.com/api/read_message', {
                form: {
                    id: ids,
                    uh: bot.session.modhash
                }
            }).then(function() {
                //console.log('messages marked as read.');
            }, function(error) {
                console.log('Error reading messages: ' + error);
            });
        }

    });
}

nodewhal('AssKissingBot/0.2 by frrrni').login(creds.user, creds.passwd).then(function(bot) {
    Comments.init(bot);
    Friends.init(bot).then(lastReplies.init(bot).then(function() {
        console.log('friends updated, checking replies');
        setInterval(function() {
            checkReplies(bot);
        }, 35000);
        checkComments(bot);
    }));
}).catch(function(error) {
    console.log('Something went wrong');
    console.error(error.stack || error);
    throw error;
});

require('http').createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello World\n');
    console.log('someone requested the site!')
}).listen(8080);