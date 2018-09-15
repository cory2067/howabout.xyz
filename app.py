from flask import Flask
from flask import render_template, redirect, url_for, request, current_app
from flask_pymongo import PyMongo
from flask_dance.contrib.google import make_google_blueprint, google
from oauthlib.oauth2.rfc6749.errors import InvalidClientIdError
import bson.json_util
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
    ],
    offline=True
)

app.register_blueprint(blueprint, url_prefix="/login")

# online_users = mongo.db.users.find_one({})
# for c in mongo.db.collection_names():
#     print(c)

@app.route('/')
@app.route('/index')
def index():
    return render_template('create.html')

@app.route ('/login')
def login():
    if not google.authorized:
        return redirect(url_for("google.login"))
    resp = google.get("/oauth2/v2/userinfo")
    print("You are {email} on Google".format(email=resp.json()["email"]))
    return redirect('/')

@app.route('/calendars')
def get_calendars():
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

@app.route('/availability')
def get_availability():
    if not google.authorized:
        return 'Not logged in'

    start_date = '2018-09-07T00:29:07.000Z'
    end_date = '2018-09-20T00:29:07.000Z'
    params = {
        'timeMax': end_date,  # '2011-06-03T10:00:00-07:00',
        'timeMin': start_date # '2011-06-03T10:00:00-07:00'
    }

    calendars = [
    ]
    events = []
    for cal in calendars:
        url = "/calendar/v3/calendars/{id}/events".format(id=cal)
        resp = google.get(url, params=params)
        print('\n\n\n', cal, '\n', resp.json().get('items', []))
        for event in resp.json().get('items', []):
            summary = event['summary']
            start_time = event['start']
            end_time = event['end']
            events.append({summary: [start_time, end_time]})
    return json.dumps(events)

'''
    GET /event_info/<eid>
    Returns json object of event

    eid: Event ID
'''
@app.route('/event_info/<eid>')
def get_event(eid):
    res = mongo.db['events'].find_one({'eid': eid})
    return json.dumps(bson.json_util.dumps(res))

'''
    POST /event_info
    Inserts the given event into the database

    eid: Event ID
    name: User-friendly name of event
    host: Email of event creator
    times: List of {"start_time": xxx, "end_time": xxx}, where
           dates are in milliseconds since 1/1/1970
'''
@app.route('/event_info', methods=['POST'])
def insert_event():
    print(request.json)
    return 'ok'

'''
    POST /availability
    Insert a user's availability into the database

    eid: Event ID
    uid: User ID
    times: 2d array of booleans representing availability
'''
@app.route('/availability', methods=['POST'])
def post_availability():
    avail = {
        'eid': request.json['eid'],
        'uid': request.json['uid'],
        'times': request.json['times']
    }

    mongo.db['avail'].insert(avail)
    return 'ok'

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/event_test/<eid>')
def event_test(eid):
    res = mongo.db['events'].find_one({'eid': eid})
    return render_template('event_test.html', name=res['name'])

@app.errorhandler(InvalidClientIdError)
def token_expired(e):
    del current_app.blueprints['google'].token
    return redirect(url_for("google.login"))

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8000)
