/**
 * Created by Fer on 15/06/2014.
 */

var _ = require('underscore')._;

module.exports = (function() {
    var unconfirmedTips = [];

    function itsATip(message) {
        return message.author === 'changetip' &&
            message.body.indexOf('Hi AssKissingBot,\n\n**You received a Bitcoin tip via /r/changetip!**') === 0;
    }

    return {
        itsAnUnconfirmedTip: function(message) {
            return message.author !== 'changetip' &&
                message.body.indexOf('/u/changetip') > -1;
        },
        tryParse: function(message) {
            if (itsATip(message)) {
                var words = message.body.substring(63).split(' ', 9),
                    username = words[3].substring(3),//(remove the /u/)
                    amount = words[6],
                    unit = words[7];
                console.log('parsed tip: user: ' + username + '; amount: ' + amount + '; unit: ' + unit);
                return {
                    username: username,
                    amount: amount,
                    unit: unit
                };
            } else if (message.author === 'changetip') {
                console.log('WARNING: Got a message from changetip that' +
                    ' was not detected as a tip.');
            }
        },
        findUnconfirmedTip: function(username, callback) {
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
    };
}());
