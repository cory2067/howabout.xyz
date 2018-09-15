from flask import Flask
from flask import render_template, redirect, url_for
from flask_pymongo import PyMongo
from flask_dance.contrib.google import make_google_blueprint, google
import config
import os
import json

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'


app = Flask(__name__)
app.config["MONGO_URI"] = config.MONGO_URI
app.secret_key = config.SECRET_KEY
mongo = PyMongo(app)

blueprint = make_google_blueprint(
    client_id=config.CLIENT_ID,
    client_secret=config.CLIENT_SECRET,
    scope=[
        "https://www.googleapis.com/auth/plus.me",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/calendar.readonly"
    ]
)

app.register_blueprint(blueprint, url_prefix="/login")

@app.route('/')
@app.route('/index')
def index():
    return 'Hello world'

@app.route ('/login')
def login():
    if not google.authorized:
        return redirect(url_for("google.login"))
    resp = google.get("/oauth2/v2/userinfo")
    print("You are {email} on Google".format(email=resp.json()["email"]))
    return render_template('index.html')

@app.route('/getCalendars')
def getCalendars():
    if not google.authorized:
        return 'Not logged in'

    resp = google.get("/calendar/v3/users/me/calendarList")

    json_response = {}
    for cal in resp.json().get('items', []):
        summary = cal['summary']
        id = cal['id']
        json_response[summary] = id
    return json.dumps(json_response)

if __name__ == "__main__":
        app.run(host='127.0.0.1', port=8000)
