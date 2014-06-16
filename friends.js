/**
 * Created by Fer on 14/06/2014.
 */

var _ = require('underscore')._;

module.exports = Friends = (function() {
    var bot, friends = [];

    function printFriends() {
        var friendList = '';
        _.each(friends, function(f2) {
            //f2 structure:
            /*
             - name (username)
             - id (full id)
             - date (int)
             */
            friendList += f2.name + ' ';
        });
        console.log('My friends are now: ' + friendList);
    }

    function updateFriends() {
        return bot.get('https://ssl.reddit.com/prefs/friends.json').then(function(f) {
            friends = f[0].data.children;
            printFriends();
        });
    }

    return {
        init: function(nodewhalUser) {
            bot = nodewhalUser;
            return updateFriends();
        },
        isFriend: function(fullID) {
            return _.any(friends, function(f) {
                return f.id === fullID;
            });
        },
        unfriend: function(username) {
            return bot.post('http://www.reddit.com/api/unfriend', {
                form: {
                    name: username,
                    container: 't2_fwctc',//AKB fullname
                    type: 'friend',
                    uh: bot.session.modhash
                }
            }).then(function() {
                console.log(username + ' is no longer my friend');
                return updateFriends();
            }).catch(function(error) {
                console.error('Error unfriending ' + username + (error.stack || error));
            });
        },
        friend: function(username) {
            return bot.post('http://www.reddit.com/api/friend', {
                form: {
                    name: username,
                    container: 't2_fwctc',//AKB fullname
                    type: 'friend',
                    uh: bot.session.modhash
                }
            }).then(function() {
                console.log(username + ' is now my friend!');
                return updateFriends();
            }).catch(function(error) {
                console.error('Error friending ' + username + (error.stack || error));
            });
        }
    };
}());