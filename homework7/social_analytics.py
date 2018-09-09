
# coding: utf-8

# In[ ]:


# Dependencies
import tweepy
import numpy as np
import pandas as pd
from datetime import datetime
import matplotlib.pyplot as plt
from matplotlib import style
style.use('ggplot')
import re
import time

# Import and Initialize Sentiment Analyzer
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
analyzer = SentimentIntensityAnalyzer()

# Twitter API Keys
from config import (consumer_key, 
                    consumer_secret, 
                    access_token, 
                    access_token_secret)

# Setup Tweepy API Authentication
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)
api = tweepy.API(auth, parser=tweepy.parsers.JSONParser())

prevTwitterFile = "Resources/past_twitter_analysis.txt"
imageAnalysisFile = "Images/sentiment.png"
myTwitterHandle = "@elev8r_music"
tweetBotPhrase = "analyze:"
my_since_id = None

# List for tweets to analysis
tweetTextArray = []
# Twitter Handle to analyze
twitterToAnalyze = ""
# Twitter Handle of requester
twitterRequester = ""

# Global lists for sentiment analysis
compound_list = []
positive_list = []
negative_list = []
neutral_list = []
# global data frame for sentiment analysis
sentiment_df = None


# In[ ]:


# Checks against list of twitter handles previously analyzed.
# Returns None if previously analyzed, otherwise return twitter handle to analyze
def checkTwitterAccount(user):
    userToAnalyze = user.replace("@", "")
    userToAnalyze = userToAnalyze.strip()
    with open(prevTwitterFile, "a+") as file:
        file.seek(0)
        for line in file:
            line = line.strip() # preprocess line for string comparison
            # check if twitter handle has been analyzed previously
            if(userToAnalyze == line):
                userToAnalyze = None
                #print("Twitter account previously analyzed.")
                break
        # If never been analyzed add to list
        if(userToAnalyze != None):
            file.write(f"{userToAnalyze}\n")
            return(user)
    return None
# end function checkTwitterAccount

#print(checkTwitterAccount("@cnn"))


# In[ ]:


# Parses tweet to look for pattern to begin bot analysis
# Phrase struct is "@{myTwitterHandle} {tweetBotPhrase} {twitter_handle_to_analyze}"
# Returns none if pattern doesn't match, otherwise return twitter handle to analyze
def parseTweet(tweet):
    #print(tweet)
    # split on spaces...allow multiple spaces between words
    tweet_split = re.split('\s+', tweet)
    # check length
    if(len(tweet_split) < 3):
        return None
    # make sure they specified a twitter handle
    elif(tweet_split[2] == ""):
        return None
    # check for correct pattern format and return twitter handle to analyze
    elif(tweet_split[0].lower() == myTwitterHandle and 
       tweet_split[1].lower() == tweetBotPhrase
      ):
        return tweet_split[2].strip().lower()
    else:
        return None
# end function parseTweet

#test_text = "@elev8r_music analyze: @CNN"
#print(parseTweet(test_text))


# In[ ]:


# Requests last 500 tweets from twitterHandle
# Returns None if error else returns number of tweets recorded
def getTwitterData(twitterHandle):
    global tweetTextArray
    oldest_tweet_id = None
    counter = 1
    # Clear previous tweets from global
    tweetTextArray.clear()
    #print(twitterHandle)
    # Get last 500 tweets
    for x in range(5): 
        try:
            # Get all tweets from home feed
            public_tweets = api.user_timeline(twitterHandle, count=100, page=x, max_id = oldest_tweet_id)
        except tweepy.TweepError:
            return None
        # collect tweets for VADAR Analysis
        for tweet in public_tweets:
            #print(f"{counter}: {tweet['text']}")
            tweetTextArray.append(tweet['text'])
            counter += 1
            # assign tweet id to make sure we don't get overlapping tweets
            oldest_tweet_id = tweet['id'] - 1
    # return the number of tweets analyzed
    return (len(tweetTextArray))
# end function getTwitterData

#tweetCount = getTwitterData("@CNN")
#print(tweetCount)


# In[ ]:


#print(len(tweetTextArray))
#print(tweetTextArray[0])


# In[ ]:


# Performs VADAR analysis on tweet texts gathered in tweetTextArray
def performVadarAnalysis():
    global compound_list, positive_list, negative_list, neutral_list, tweetTextArray
    # Clear lists of previous analysis
    compound_list.clear()
    positive_list.clear()
    negative_list.clear()
    neutral_list.clear()
    
    # Add results to lists
    for tweetText in tweetTextArray:
        results = analyzer.polarity_scores(tweetText)
        compound_list.append(results['compound'])
        positive_list.append(results['pos'])
        negative_list.append(results['neg'])
        neutral_list.append(results['neu'])
        
    # Reverse so that when graphing it will correspond to time passing
    compound_list.reverse()
    positive_list.reverse()
    negative_list.reverse()
    neutral_list.reverse()
# End of performSentimentAnalyze

#performVadarAnalysis()
#sentiment_df.head()


# In[ ]:


# Function to create color array for bar graph
def createColorArray(sentiment):
    #For sentiment greater than or zero use green
    if(sentiment >= 0):
        return 'g'
    else:
        return 'r'
# End of createColorArray

# Function to plot the analysis and create picture
def plotSentimentAnalysis():
    global compound_list, positive_list, negative_list, neutral_list, sentiment_df
    # Create a dataframe of analysis
    sentiment_df = pd.DataFrame({
        "Compound": compound_list,
        "Positive": positive_list,
        "Negative": negative_list,
        "Neutral": neutral_list})
    # Create x_axis
    x_axis = np.arange(-len(sentiment_df), 0)
    # Create y_axis
    y_axis = sentiment_df['Compound']
    # Create color array
    colors = [createColorArray(sentiment) for sentiment in y_axis]
    # plot bar graph
    plt.bar(x_axis, y_axis, color=colors, width=2)
    # Incorporate the other graph properties
    now = datetime.now()
    now = now.strftime("%Y-%m-%d %H:%M")
    plt.title(f"VADAR Analysis of Tweets of {twitterToAnalyze} ({now})")
    plt.ylabel("Tweet Polarity")
    plt.xlabel("Tweets Ago")
    plt.xlim(-len(sentiment_df), 1)
    plt.tight_layout()
    plt.savefig(imageAnalysisFile)
    #plt.show()
# End of plotSentimentAnalysis
    
#plotSentimentAnalysis()


# In[ ]:


# Function to check my timeline for new tweets
def checkMyTimeline():
    global my_since_id
    try:
        my_tweets = api.home_timeline(since_id = my_since_id, count=100)
    except tweepy.TweepError:
        return None
    # Check if new tweets retrieved
    if(len(my_tweets) > 0):
        my_since_id = my_tweets[0]['id']
        return my_tweets
    else:
        return None
# End of checkMyTimeline

#tweets = checkMyTimeline()
#for tweet in tweets:
#    print(tweet['user']['screen_name'])


# In[ ]:


# Posts results to my timeline with analysis figure
def postResultsToTimeline():
    tweet = api.update_with_media(imageAnalysisFile,
                          f"New tweet analysis: {twitterToAnalyze} (For: @{twitterRequester})")
    return tweet
# End of postResultsToTimeline

#postTweet = postResultsToTimeline()


# In[ ]:


#api.destroy_status(postTweet['id'])


# In[ ]:


# Main logic for twitter bot execution
def twitterBotMain():
    global twitterRequester, twitterToAnalyze
    # check my timeline for new tweets
    myTweets = checkMyTimeline()
    if(myTweets != None):
        # Look through tweeets for matching pattern
        for tweet in myTweets:
            twitterHandle = parseTweet(tweet['text'])
            if(twitterHandle != None):
                # Check if twitter handle was previously analyzed
                twitterToAnalyze = checkTwitterAccount(twitterHandle)
                if(twitterToAnalyze != None):
                    # Do analysis
                    twitterRequester = tweet['user']['screen_name']
                    print(f"Analyze: {twitterToAnalyze} for {twitterRequester}")
                    tweetCount = getTwitterData(twitterToAnalyze)
                    performVadarAnalysis()
                    plotSentimentAnalysis()
                    postTweet = postResultsToTimeline()
                    #print(postTweet['id'])
                else:
                    print("Twitter previously handled")
            else:
                print("No Handle returned")
    else:
        print("No new tweets")
    #check again in 5 minutes
    time.sleep(300)    
# End of twitterBotMain


# In[ ]:


# Executing main
while True:
    twitterBotMain()

