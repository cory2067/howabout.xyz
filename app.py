from flask import Flask
from flask import render_template, redirect, url_for, request, current_app, session, abort
from flask_pymongo import PyMongo
from flask_dance.contrib.google import make_google_blueprint, google
from oauthlib.oauth2.rfc6749.errors import InvalidClientIdError
import bson.json_util
import config
import os
import json
import forms
import datetime

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
    redirect_url="/login_success",
    offline=True
)

app.register_blueprint(blueprint, url_prefix="/login")

# online_users = mongo.db.users.find_one({})
# for c in mongo.db.collection_names():
#     print(c)

@app.route('/')
@app.route('/index')
def index():
    form = forms.EventForm()
    return render_template('create.html', form=form)

@app.route('/test')
def test():
    return render_template('test.html')

@app.route('/login')
def login():
    # sketchy way of redir back to original caller
    session['redir'] = request.args.get('redir') if 'redir' in request.args else '/'
    if not google.authorized:
        return redirect(url_for("google.login"))
    return redirect('/login_success')

@app.route('/login_success')
def login_success():
    resp = google.get("/oauth2/v2/userinfo")
    session['uid'] = resp.json()['email']
    session['given_name'] = resp.json()['given_name']
    print(resp.json())
    print("You are {email} on Google".format(email=resp.json()["email"]))
    return redirect(session['redir'])

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/event/<eid>')
@app.route('/e/<eid>')
def event(eid):
    if not google.authorized:
        return redirect(url_for('login', redir=request.path))

    res = mongo.db['events'].find_one({'eid': eid})
    return render_template('event.html', uid=session['uid'], event=res)

@app.route('/event_test/<eid>')
def event_test(eid):
    res = mongo.db['events'].find_one({'eid': eid})
    return render_template('event_test.html', uid=session['uid'], name=res['name'], given_name=session['given_name'])

@app.errorhandler(InvalidClientIdError)
def token_expired(e):
    del current_app.blueprints['google'].token
    return redirect(url_for("google.login"))

### API

'''
    GET /api/calendars
    Returns list of calendars for given user
'''
@app.route('/api/calendars')
def get_calendars():
    if not google.authorized:
        return 'Not logged in'

    resp = google.get("/calendar/v3/users/me/calendarList")
    for cal in resp.json()['items']:
        print (cal)
        # print('cal {} is {}'.format(cal['id'], cal['summary']))
        continue

    json_response = {}
    for cal in resp.json().get('items', []):
        summary = cal['summary']
        id = cal['id']
        selected = 'selected' in cal
        json_response[summary] = {
            'id': id,
            'selected': selected
        }
    return json.dumps(json_response)


'''
    GET /api/calendar
    Returns Google calendar info from current user

    eid: Event ID
    calendars[]: List of ID for desired calendars
'''
@app.route('/api/calendar')
def get_calendar():
    if not google.authorized:
        return 'Not logged in'

    res = mongo.db['events'].find_one_or_404({'eid': request.args['eid']})
    calendars = request.args.getlist('calendars[]')
    days = res['dates']
    set_of_days = set(days)
    start_time = res['start_time']
    end_time = res['end_time']

    params = {
        'timeMax': '{}T{}Z'.format(days[-1], end_time),
        'timeMin': '{}T{}Z'.format(days[0], start_time),
        'singleEvents': True
    }

    print(params)

    events_list = []
    for cal in calendars:
        url = "/calendar/v3/calendars/{id}/events".format(id=cal)
        print (url, params)
        resp = google.get(url, params=params)
        events = []
        for event in resp.json().get('items', []):
            summary = event['summary']
            start = event['start']
            end = event['end']
            events_list.append({'name':summary, 'start':start, 'end':end})

    initial = datetime.datetime.strptime(start_time,"%H:%M:%S.%f")
    final = datetime.datetime.strptime(end_time,"%H:%M:%S.%f")
    duration = final-initial
    intervals = int(duration.total_seconds() / 60 / 15 + 0.5)
    availability = [[1] * intervals for x in days]

    for event in events_list:
        event_start = None
        event_end = None
        if 'dateTime' in event['start']:
            time = event['start']['dateTime'][:-6]
            # direction = event['start']['dateTime'][-6]
            # offset = event['start']['dateTime'][-5:]
            event_start = datetime.datetime.strptime(time, "%Y-%m-%dT%H:%M:%S")
            # delta = datetime.timedelta(hours=int(offset[:2]), minutes=int(offset [3:]))
            # event_start += -1**(direction == '-') * delta
        if 'dateTime' in event['end']:
            time = event['end']['dateTime'][:-6]
            # direction = event['end']['dateTime'][-6]
            # offset = event['end']['dateTime'][-5:]
            event_end = datetime.datetime.strptime(time, "%Y-%m-%dT%H:%M:%S")
            # delta = datetime.timedelta(hours=int(offset[:2]), minutes=int(offset[3:]))
            # event_end += -1**(direction == '-') * delta
        if not event_start or not event_end:
            continue
        if event_start.date() != event_end.date():
            print(event_start.date(), event_end.date())
            print('BAD DATA')
        else:
            print (event, event_start, event_end)
            stringer = convertToString(event_start)
            if stringer in set_of_days:
                indexer = days.index(stringer)
                day = availability[indexer]
                delta_days =  (event_start - initial).days
                initial_delay = event_start - initial - datetime.timedelta(days=delta_days)
                slot = int(initial_delay.total_seconds() / 60 / 15 + 0.5)
                counter = 0

                while (slot < len(day) and event_start + datetime.timedelta(minutes=15*counter) < event_end):
                    day[slot + counter] = 0
                    counter += 1

            else:
                print('EVENT NOT  IN  LIST', event)
    return json.dumps(availability)

def convertToString(DateTime):
    return "{:04d}-{:02d}-{:02d}".format(DateTime.year, DateTime.month, DateTime.day)

'''
    GET /api/event/<eid>
    Returns json object of event

    eid: Event ID
'''
@app.route('/api/event/<eid>')
def get_event(eid):
    res = mongo.db['events'].find_one({'eid': eid})
    return json.dumps(bson.json_util.dumps(res))

'''
    POST /api/event
    Inserts the given event into the database

    eid: Event ID
    name: User-friendly name of event
    host: Email of event creator
    start_time: Time string(?)
    end_time: Time string(?)
    dates: List of date strings(?)
'''
@app.route('/api/event', methods=['POST'])
def post_event():
    print("DEBUG: request.json is \n" + str(request.json))
    event = {
        'eid': request.json['eid'],
        'name': request.json['uid'],
        'host': request.json['host'],
        'start_time': request.json['start_time'],
        'end_time': request.json['end_time'],
        'dates': request.json['dates'],
    }

    mongo.db['events'].insert(event)
    return 'ok'

'''
    GET /api/availability
    Get a user's availability for the event

    eid: Event ID
    uid: User ID
'''
@app.route('/api/availability')
def get_availability():
    db_filter = {
        'eid': request.args.get('eid'),
        'uid': request.args.get('uid'),
    }

    res = mongo.db['avail'].find_one(db_filter)
    return json.dumps(bson.json_util.dumps(res))

'''
    GET /api/availabilities
    Get all user availabilities for the event
    Returns a list:
      response[date][slots] is a list of users who can attend that slot

    eid: Event ID
'''
@app.route('/api/availabilities')
def get_availabilities():
    db_filter = {
        'eid': request.args.get('eid')
    }

    res = mongo.db['avail'].find(db_filter)

    if not res.count():
        abort(404)

    res = list(res)
    dates = len(res[0]['times'])
    slots = len(res[0]['times'][0])

    avail = [
              [
                [user['uid'] for user in res if user['times'][date][slot]]
                for slot in range(slots)
              ]
              for date in range(dates)
            ]

    return json.dumps(avail)

'''
    POST /api/availability
    Insert a user's availability into the database

    eid: Event ID
    (temporarily removed) uid: User ID
    times: 2d array of booleans representing availability
'''
@app.route('/api/availability', methods=['POST'])
def post_availability():
    avail = {
        'eid': request.json['eid'],
        'uid': session['uid'],
        'times': request.json['times']
    }

    mongo.db['avail'].insert(avail)
    return 'ok'

'''
    PUT /api/availability
    Update a user's availability

    eid: Event ID
    (temporarily removed) uid: User ID
    times: 2d array of booleans representing availability
'''
@app.route('/api/availability', methods=['PUT'])
def put_availability():
    db_filter = {
        'eid': request.json['eid'],
        'uid': session['uid'],
    }

    db_update = {
        '$set': {
            'times': request.json['times']
        }
    }

    mongo.db['avail'].update_one(db_filter, db_update, upsert=True)
    return 'ok'


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8000)
