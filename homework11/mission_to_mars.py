# Dependencies
import os
from bs4 import BeautifulSoup as bs
import requests
from splinter import Browser
import pandas as pd
import time

def init_browser():
    executable_path = {'executable_path': 'chromedriver.exe'}
    #return Browser('chrome', **executable_path, headless=False)
    return Browser('chrome', **executable_path, headless=True)

def scrape():
    browser = init_browser()
    # create mars data dict that we can insert into mongo
    mars_data_dict = {}
    
    mars_news_url = 'https://mars.nasa.gov/news'
    browser.visit(mars_news_url)
    # Add sleep since sometimes web browser doesn't load quickly enough before returning html data for soup
    time.sleep(1)
    html = browser.html
    soup = bs(html, 'html.parser')
    # find first element which will be latest news
    news_latest = soup.find('li', class_='slide')
    #print(news_latest.prettify())
    news_title = news_latest.find('div', class_="content_title").text
    news_p = news_latest.find('div', class_="article_teaser_body").text
    #news_p
    mars_data_dict['news_title'] = news_title
    mars_data_dict['news_p'] = news_p

    mars_image_url = "https://www.jpl.nasa.gov/spaceimages/?search=&category=Mars"
    browser.visit(mars_image_url)
    # Add sleep since sometimes web browser doesn't load quickly enough before returning html data for soup
    time.sleep(1)
    full_image_button = browser.find_by_id("full_image")
    full_image_button.click()
    # Add sleep since sometimes web browser doesn't load quickly enough before returning html data for soup
    time.sleep(1)
    # Unable to figure out how to click button 'more info' on website so used bs to create link
    html = browser.html
    soup = bs(html, 'html.parser')
    image_url = 'https://www.jpl.nasa.gov' + soup.find('div', class_="buttons").find('a', class_="button")['href']
    browser.visit(image_url)
    time.sleep(1)
    # Get the large image
    html = browser.html
    soup = bs(html, 'html.parser')
    featured_image_url = 'https://www.jpl.nasa.gov' + soup.find('figure').find('a')['href']
    #featured_image_url
    mars_data_dict['featured_image_url'] = featured_image_url

    twitter_mars_weather_url = "https://twitter.com/marswxreport?lang=en"
    browser.visit(twitter_mars_weather_url)
    # Add sleep since sometimes web browser doesn't load quickly enough before returning html data for soup
    time.sleep(1)
    html = browser.html
    soup = bs(html, 'html.parser')

    weather_tweets = soup.findAll('li', {"class": ["js-stream-item", "stream-item", "stream-item"]})
    # sometimes first tweet isn't always weather so search through tweets
    for weather_tweet in weather_tweets:
        tweet = weather_tweet.find('p').text
        if(tweet):
            x = tweet.split()
            if(x[0] == 'Sol'):
                break
    
    mars_weather = tweet
    mars_data_dict['mars_weather'] = mars_weather

    mars_facts_url = "https://space-facts.com/mars"
    facts_table = pd.read_html(mars_facts_url)
    #facts_table[0]
    mars_facts_df = facts_table[0]
    mars_facts_df.columns = ['Description', 'Values']
    mars_facts_df = mars_facts_df.set_index('Description')
    mars_facts_html_table = mars_facts_df.to_html(border=1, classes="mars_facts_table")
    mars_facts_html_table = mars_facts_html_table.replace("\n", " ")
    #mars_facts_html_table
    mars_data_dict['mars_facts_html_table'] = mars_facts_html_table

    mars_hemispheres_url = "https://astrogeology.usgs.gov/search/results?q=hemisphere+enhanced&k1=target&v1=Mars"
    browser.visit(mars_hemispheres_url)
    time.sleep(1)
    html = browser.html
    soup = bs(html, 'html.parser')
    image_hrefs = soup.find_all('div', class_="item")

    hemisphere_image_urls = []
    for image_href in image_hrefs:
        browser.visit("https://astrogeology.usgs.gov/" + image_href.find('a')['href'])
        time.sleep(1)
        html = browser.html
        soup = bs(html, 'html.parser')
        image_dict = {}
        image_dict['title'] = soup.find('h2', class_="title").text
        image_dict['img_url'] = soup.find('a', text="Sample")['href']
        hemisphere_image_urls.append(image_dict)
    #hemisphere_image_urls
    mars_data_dict['hemisphere_image_urls'] = hemisphere_image_urls

    browser.quit()
    return mars_data_dict   

