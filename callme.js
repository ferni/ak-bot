request = require('request');

module.exports = {
	init: function(callmeurl, siteurl) {
		setInterval(function() {
			request(callmeurl + '?url=' + siteurl, function (error, response, body) {
			if (error) {
				return console.log('error calling ' + callmeurl);
			}
		});
		}, 1750000)
	}
}