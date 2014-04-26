/*var r = require('./reddit');

r.login(function() {
    r.comment('t3_23za7o', 'Pero vete al pingo hombre!');
});*/
var creds = require('./credentials'),
    nodewhal = require('nodewhal');

nodewhal('AssKissingBot/0.1 by frrrni').login(creds.user, creds.passwd).then(function(bot) {
    bot.comment('t3_23za7o', 'Hola, first post as an actual bot!');
});