var akb = {};
akb.replies = {
    standard: [
        'Well put!',
        'Excellent comment, sir.',
        'I completely agree.',
        'I wish I could upvote you more than once!',
        'I wish I had your eloquence.',
        'You\'re so smart!',
        'Wow, you blew me away.',
        'I think this is your best comment yet.',
        'You have such wisdom.',
        'How I haven\'t thought of that?!',
        'If this commnet doesn\'t deserve gold, I don\'t know which does.',
        'A smashing comment.']
};

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

akb.random = function(stringArray) {
    var index = randomIntFromInterval(0, stringArray.length - 1);
    return stringArray[index];
};

module.exports = akb;