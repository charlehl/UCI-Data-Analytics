from flask import Flask, render_template, redirect
from flask_pymongo import PyMongo
import mission_to_mars


app = Flask(__name__)


mongo = PyMongo(app, uri="mongodb://localhost:27017/mars_app_db")


@app.route('/')
def index():
    mars = mongo.db.mars_data.find_one()
    return render_template('index.html', mars=mars)


@app.route('/scrape')
def scrape():
    mars_data = mongo.db.mars_data
    data = mission_to_mars.scrape()
    mars_data.update(
        {},
        data,
        upsert=True
    )
    return redirect("/", code=302)


if __name__ == "__main__":
    app.run(debug=True)