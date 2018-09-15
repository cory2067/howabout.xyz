from flask import Flask
from flask import render_template
from flask_pymongo import PyMongo
import config

app = Flask(__name__)
app.config["MONGO_URI"] = config.MONGO_URI
mongo = PyMongo(app)

@app.route('/')
@app.route('/index')
def hello():
    online_users = mongo.db.users.find_one({})
    print(online_users)
    return 'Hello, World!'
    return render_template('index.html')

if __name__ == "__main__":
        app.run(host='127.0.0.1', port=8000)
