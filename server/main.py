#!/usr/bin/env python

from flask import Flask, request
from flask.json import jsonify
from flask_mongoengine import MongoEngine
from flask_cors import CORS

# https://pythonbasics.org/flask-mongodb/

app = Flask(__name__)
app.config["MONGODB_SETTINGS"] = {
    "db": "openpaper",
    "host": "localhost",
    "port": 27017
}
db = MongoEngine()
db.init_app(app)
cors = CORS(app)

class Annotation(db.Document):
    x = db.IntField()
    y = db.IntField()
    title = db.StringField()
    body = db.StringField()

@app.route("/all")
def all():
    objs = Annotation.objects()
    return jsonify(objs)

@app.route("/add", methods=["POST"])
def add():
    print(request.form)
    try: 
        x = request.form["x"]
        y = request.form["y"]
        title = request.form["title"]
        body = request.form["body"]
    except Exception as e:
        print(e)
        return "bad request", 400

    anno = Annotation(x=x, y=y, title=title, body=body)
    anno.save()
    return jsonify(anno)

@app.route("/")
def home():
    return "openpaper"

if __name__ == "__main__":
    app.run(debug=True)