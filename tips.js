/**
 * Created by Fer on 15/06/2014.
 */

var _ = require('underscore')._,
    Comments = require('./comments');

module.exports = Tips = (function() {
    var unconfirmedTips = [],
        tips = [],
        userRegExp = /\/u\/[a-z|\-|_|0-9]+/gi;

    function itsATip(message) {
        var users = message.body.match(userRegExp);
        return message.author === 'changetip' &&
            users.length >= 2;
    }

    function itsAnUnconfirmedTip(message) {
        return message.author !== 'changetip' &&
            message.body.indexOf('/u/changetip') > -1;
    }

    function removeFromArray(array, item) {
        var index = array.indexOf(item);
        array.splice(index, 1);
    }

    function lookForMessageConfirmationMatch(last) {
        var tip = last.tip,
            unconfirmed = last.unconfirmed;
        if (tip) {
             unconfirmed = _.find(unconfirmedTips, function(ut) {
                return ut.author === tip.username;
            });
        } else {
            tip = _.find(tips, function(t) {
                return t.username === unconfirmed.author;
            })
        }
        if (tip && unconfirmed) {
            removeFromArray(tips, tip);
            removeFromArray(unconfirmedTips, unconfirmed);
            Comments.thankTip(unconfirmed.name, tip);
        }
    }

    return {
        tryParse: function(message) {
            if (itsAnUnconfirmedTip(message)) {
                console.log('I think ' + message.author + ' just tipped me. Waiting confirmation.');
                unconfirmedTips.push(message);
                lookForMessageConfirmationMatch({unconfirmed: message});
                return false;
            }
            if (itsATip(message)) {
                var text = message.body,
                    fullUser = text.match(userRegExp)[0],
                    words = text.substring(text.indexOf(fullUser)).split(' ', 5),
                    username = fullUser.substring(3),//(remove the /u/)
                    amount = words[3],
                    unit = words[4],
                    tip = {
                        username: username,
                        amount: amount,
                        unit: unit
                    };
                console.log('parsed tip: user: ' + username + '; amount: ' + amount + '; unit: ' + unit);
                tips.push(tip);
                lookForMessageConfirmationMatch({tip: tip});
                return tip;
            }else if (message.author === 'changetip') {
                console.log('WARNING: Got a message from changetip that' +
                    ' was not detected as a tip.');
            }
            return false;
        }
    };
}());
