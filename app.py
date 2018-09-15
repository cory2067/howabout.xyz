from flask import Flask
from flask import render_template
from flask_pymongo import PyMongo
from flaskext.sass import sass
import config

app = Flask(__name__)
app.config["MONGO_URI"] = config.MONGO_URI
mongo = PyMongo(app)
sass(app, input_dir='static/scss', output_dir='static/css') # turns *.scss into *.css

@app.route('/')
def about():
    online_users = mongo.db.users.find_one({})
    print(online_users)
    return render_template('about.html')

if __name__ == "__main__":
        app.run(host='127.0.0.1', port=8000)
