var r = require('./reddit');

r.login(function() {
    r.comment('t3_23za7o', 'Pero vete al pingo hombre!');
});
