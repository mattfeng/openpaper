#!/usr/bin/env python

from pymongo import MongoClient
import pprint

client = MongoClient("localhost", 27017)

db = client["openpaper"]
col = db.annotations

# anno = {
#     "x": 100,
#     "y": 100,
#     "title": "test annotation title",
#     "body": "test annotation body"
# }

# anno_id = col.insert_one(anno).inserted_id
# print(anno_id)

for doc in col.find():
    pprint.pprint(doc)