from flask_wtf import FlaskForm
from wtforms.validators import DataRequired
from wtforms import SelectField, SubmitField

class EventForm(FlaskForm):
    # constructs the <select> tag of the form
    l = []
    l.append(("00:00:00.000", "midnight"))
    for i in range(1,12):
        val = str(i) + "am"
        l.append(('{:02d}:00:00.000'.format(i), val))
    l.append(('12:00:00.000', "12pm"))
    for i in range(13, 24):
        val = str(i-12) + "pm"
        l.append(('{:02d}:00:00.000'.format(i), val))
    l.append(('23:59:59.999'.format(i), "midnight"))

    start_time = SelectField(choices=l)
    end_time = SelectField(choices=l)