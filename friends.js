/**
 * Created by Fer on 14/06/2014.
 */

var _ = require('underscore')._;

module.exports = Friends = (function() {
    var bot, friends = [];
    //friend structure:
    /*
     - name (username)
     - id (full id)
     - date (int)
     */

    function updateFriends() {
        return bot.get('https://ssl.reddit.com/prefs/friends.json').then(function(f) {
            friends = f[0].data.children;
            console.log('My friends are now: ' + _.pluck(friends, 'name').toString());
        });
    }

    return {
        init: function(nodewhalUser) {
            bot = nodewhalUser;
            return updateFriends();
        },
        isFriend: function(username) {
            return _.any(friends, function(f) {
                return f.name === username;
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