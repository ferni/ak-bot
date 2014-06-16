/**
 * Created by Fer on 16/06/2014.
 */

var _ = require('underscore')._;

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
        thanksStandard = [
            'Thanks! We\'re best friends now!',
            'You made my day, I hope you don\'t mind if I tag along.',
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


    function comment(thingID, message) {
        message += footer;
        return bot.comment(thingID, message);
    }

    return {
        init: function(nodewhalUser) {
            bot = nodewhalUser;
        },
        thankTip: function(commentID, tip) {
            //if tip > x: pick generous targeted message
            var reply = pickRandom(thanksStandard);
            return comment(commentID, reply);
        }
    };
}());