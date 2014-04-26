
//    r.comment('t3_23za7o'
var creds = require('./credentials'),
    nodewhal = require('nodewhal'),
    akb = require('./akb');

var worship = {
    'LaughableFalafel': {

    }
};

function addWorship(userName) {
    worship[userName] = {
        lastReply: '',
        commentsRepliedTo: []
    }
}

nodewhal('AssKissingBot/0.1 by frrrni').login(creds.user, creds.passwd).then(function(bot) {
    bot.listing('/r/friends/comments', {before: 't1_ch22i5d'}).then(function(comments) {
        console.log(JSON.stringify(comments));
    });

    /*setInterval(function() {
        //check friends comments

    }, 5000);*/
});