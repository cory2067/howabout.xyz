from flask import Flask
from flask import render_template, redirect, url_for
from flask_pymongo import PyMongo
from flask_dance.contrib.google import make_google_blueprint, google
import config
import os
import json
import forms

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
    ],
    offline=True
)

app.register_blueprint(blueprint, url_prefix="/login")

online_users = mongo.db.users.find_one({})
for c in mongo.db.collection_names():
    print(c)

@app.route('/')
@app.route('/index')
def index():
    form = forms.EventForm()
    return render_template('create.html', form=form)

@app.route ('/login')
def login():
    if not google.authorized:
        return redirect(url_for("google.login"))
    resp = google.get("/oauth2/v2/userinfo")
    print("You are {email} on Google".format(email=resp.json()["email"]))
    return redirect('/')

@app.route('/getCalendars')
def getCalendars():
    if not google.authorized:
        return 'Not logged in'

    resp = google.get("/calendar/v3/users/me/calendarList")
    for cal in resp.json()['items']:
        print('cal {} is {}'.format(cal['id'], cal['summary']))
    
    json_response = {}
    for cal in resp.json().get('items', []):
        summary = cal['summary']
        id = cal['id']
        json_response[summary] = id
    return json.dumps(json_response)

@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8000)
