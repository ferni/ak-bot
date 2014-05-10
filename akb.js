var akb = {};
var footer = '\n\n \n\n***\n\n' +
    '^(^Tip ^with )' +
    '[^(^changetip )](https://www.changetip.com/tip-online/reddit) ' +
    '^(^to ^get ^this ^bot ^worship ^you. ^Cancel ^by ^sending ) ' +
    '[^(^this ^message)](http://www.reddit.com)^^.';
akb.replies = {
    standard: [
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
        'You are a gentleman and a scholar.',
        'LOL!',
        'You\'re an inspiration to me.',
        'This should be the top comment.',
        'To the top with you!',
        'Best comment, hands down.',
        '/thread'],
    whenTipping: [
        'Thanks! We\'re best friends now!',
        'You made my day, I hope you don\'t mind if I tag along.',
        'Thank you! Wanna hang out?',
        'I\'ll follow you till the end!',
        '(name), you\'re the best.',//generous tip
        'No, you\'re the best!',//when improving generous tip
        'Thank you (name). Pretty cool username btw.',
        'You\'re pretty cool! Friended you :).',
        'You\'re my new idol.'
    ]
};

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

akb.random = function(stringArray) {
    var index = randomIntFromInterval(0, stringArray.length - 1);
    return stringArray[index];
};

akb.getComment = function(parent) {
    var comment = akb.random(akb.replies.standard);
    comment+= footer;
    return comment;
};

module.exports = akb;