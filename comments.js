/**
 * Created by Fer on 16/06/2014.
 */

var lastReplies = require('./last-replies');

module.exports = Comments = (function() {
    var bot,
        cancelMessage = 'Hey man, can you please stop being so annoying?',
        footer = '\n\n \n\n***\n\n' +
            '^(^Tip )' +
            '[^(^bitcoin )](https://www.changetip.com/tip-online/reddit) ' +
            '^( ^to ^hire. ^Cancel )' +
            '[^(^here)](http://www.reddit.com/message/compose?' +
            'to=AssKissingBot&subject=Please%20stop&message=' +
            encodeURI(cancelMessage) + ')^^.',
        praises = [
            'Well put!',
            'Excellent comment, sir.',
            'I completely agree.',
            'I wish I could upvote you more than once!',
            'I wish I had your eloquence.',
            'You\'re so smart!',
            'You\'re so funny!',
            'Wow, you blew me away.',
            'I think this is your best comment yet.',
            'You have such wisdom.',
            'How I haven\'t thought of that?!',
            'If this doesn\'t deserve gold, I don\'t know what does.',
            'A smashing comment.',
            'You sir, are a gentleman and a scholar.',
            'LOL!',
            'You\'re an inspiration to me.',
            'This should be the top comment.',
            'To the top with you!',
            'Best comment, hands down.',
            '/thread'],
        thanksStandard = [
            'Thanks! We\'re best friends now!',
            'You made my day, hope you don\'t mind if I tag along.',
            'Thank you! Wanna hang out?',
            'I\'ll follow you till the end!',
            //'Thank you <name>. Pretty cool username btw.',
            'You\'re pretty cool! Friended you :).',
            'You\'re my new idol.'
        ],
        thanksGenerous = '<name>, you\'re the best.',
        thanksMoreGenerous = 'No, you\'re the best!';



    function randomIntFromInterval(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function pickRandom(stringArray) {
        var index = randomIntFromInterval(0, stringArray.length - 1);
        return stringArray[index];
    }

    function comment(thingID, message, username) {
        return bot.comment(thingID, message + footer).then(function() {
            lastReplies.add(username, thingID);
            console.log('@' + username + ': ' + message);
        });
    }

    return {
        init: function(nodewhalUser) {
            bot = nodewhalUser;
        },
        praise: function(commentID, username) {
            var reply = pickRandom(praises);
            return comment(commentID, reply, username);
        },
        thankTip: function(commentID, tip) {
            //if tip > x: pick generous targeted message
            var reply = pickRandom(thanksStandard);
            return comment(commentID, reply, tip.username);
        }
    };
}());