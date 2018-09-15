from flask import Flask
from flask import render_template
from flask_pymongo import PyMongo
import config

app = Flask(__name__)
app.config["MONGO_URI"] = config.MONGO_URI
mongo = PyMongo(app)

@app.route('/')
def create():
	online_users = mongo.db.users.find_one({})
    print(online_users)
    return render_template('create.html')

@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == "__main__":
        app.run(host='127.0.0.1', port=8000)
