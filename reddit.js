var request = require('request').defaults({jar: true}),
    credentials = require('./credentials');

var cookie, modhash;

exports.login = function(callback) {
    request.post({
        url: 'http://www.reddit.com/api/login',
        form: {
            api_type: 'json',
            user: credentials.user,
            passwd: credentials.passwd,
            rem: true
        },
        headers: {
            'User-Agent': 'AssKissingBotTest 0.0.1',
        },
        proxy : "http://127.0.0.1:8888"
    }, function(error, response, body) {
        var json = JSON.parse(body).json;
        if (!error && response.statusCode == 200 && json.errors.length === 0) {
            modhash = json.data.modhash;
            cookie = json.data.cookie;
            console.log('Login to reddit successful. modhash: ' + modhash +
                '; cookie: ' + cookie);
            callback();

        }else {
            console.log('That\'s an error');
            console.log(error);
        }
    });

}

exports.comment = function(thingID, text) {
    request.cookie('reddit_session=' + cookie);
    request.post({
        url: 'http://www.reddit.com/api/comment',
        form: {
            api_type: 'json',
            text: text,
            thing_id: thingID
        },
        headers: {
            'User-Agent': 'AssKissingBotTest 0.0.1',
            'X-Modhash': modhash
        },
        proxy : "http://127.0.0.1:8888"
    }, function(error, response, body) {
        var json = JSON.parse(body).json;
        if (!error && response.statusCode == 200 && json.errors.length === 0) {
            console.log('Comment successful.');
            console.log(body);
        }else {
            console.log('That\'s an error');
            console.log(error);
        }
    });
};
