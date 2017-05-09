'use strict';

const rita = require('rita');
const Twit = require('twit');

const config = require('./config.json');
require('./env')(config);


module.exports.tweet = (event, context, callback) => {

    const hashtag = process.env.hashtag;

    const T = new Twit({
      consumer_key:         process.env.consumer_key,
      consumer_secret:      process.env.consumer_secret,
      access_token:         process.env.access_token,
      access_token_secret:  process.env.access_token_secret,
      timeout_ms:           30*1000,  // optional HTTP request timeout to apply to all requests. 
    });
    
    function hasNoStopWords(token){
        let stopwords = ['http', 'RT'];
        return stopwords.every((sw) => !token.includes(sw));
    }
    
    function cleanText(text) {
        return rita.RiTa.tokenize(text, ' ')
    	.filter(hasNoStopWords)
    	.join(' ')
    	trim();
    }

    function limitlength(text) {  
        let limit = 140; //tweet length limit

        if(text.length <= limit) return text;
    
        let a = text.split(' '), words = [], length = 0, hashtagAdded = false;

        limit -= (hashtag.length+2); //word length + '#' + ' '

        for(let i=0; i<a.length; i++) {
            if(length + a[i].length+1 <= limit) {
                if(a[i] == '#'+hashtag) {
                    limit += hashtag.length+2;
                    hashtagAdded = true;
                }
                words.push(a[i]);
                length += a[i].length+1;
            }
            else {
                if(!hashtagAdded) words.push('#'+hashtag);
                return words.join(' ').trim();
            }
        }
    }
    
    //random end date to vary content
    let d = new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random()*8)));
    let until = d.toISOString().slice(0,10);
    
    T.get('search/tweets', { q: hashtag+' -filter:retweets', count: 100, result_type: 'mixed', until: until}, function(err, data, response) {
        if(err) {
            console.log(err);
            return;
        }
        let inputText = data.statuses.map((tweet) => tweet.text.trim()).join(', ').replace(/\s+/g,' ').replace(/& amp;/g,'&');
    
        //create Markov chain
        let m = new rita.RiMarkov(2);
        m.loadText(cleanText(inputText));
        let sentence = m.generateSentences(1)[0].replace(/#\s+/g,'#').replace(/@\s+/g,'@');
        if(sentence.indexOf('#'+hashtag) === -1) sentence += ' #'+hashtag;
        sentence = limitlength(sentence);

        T.post('statuses/update', { status: sentence }, function(err, data, response) {
            if(err) {
                console.log(err);
                return;
            }
            console.log(sentence)
        })
    });
};
