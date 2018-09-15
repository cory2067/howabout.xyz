from flask_wtf import FlaskForm
from wtforms.validators import DataRequired
from wtforms import SelectField, SubmitField

class EventForm(FlaskForm):

    # constructs the <select> dropdown choices
    l = []
    l.append(("midnight", "midnight"))
    for j in ["am", "pm"]:
        for i in range(1,12):
            val = str(i) + j
            l.append((val, val))
    l.append(("midnight", "midnight"))

    from_time = SelectField(choices=l)
    to_time = SelectField(choices=l)
    submit = SubmitField("create event")

