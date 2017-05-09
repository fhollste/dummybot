#### Description ####
Twitter bot tweeting dummy text based on words/sentences found in Twitter search results. Packed as a Serverless function configured with AWS Lamdba + CloudWatch cron trigger. 

#### Functionality ####
Searches for tweets based on a hashtag and uses obtained tweet texts to create [Markov chains](https://rednoise.org/rita/reference/RiMarkov.php) and adds the hashtag used for the search.

#### Getting started ####
1. Install nodejs and [Serveless framework](https://serverless.com/) (`npm install -g serveless`)
2. Install dependencies `npm install`
3. Copy *config.example.json* to *config.json* and insert Twitter app credentials + hashtag used for searches and tweets
4. Modify function details (such as tweeting interval) if needed in *serverless.yml*
5. Deploy function with `serverless deploy`
