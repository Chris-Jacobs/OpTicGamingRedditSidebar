from flask import Flask
from flask_cors import CORS
from flask import jsonify
from flask import request
from flask import Response
import json
import redditUtil

app = Flask(__name__)
CORS(app)



@app.route('/', methods=['GET', 'POST'])
def root():
    if request.method == 'GET':
        schedule = redditUtil.getSchedule()
        return jsonify(schedule)
    elif request.method == 'POST':
        print(request)
        data = request.json
        result = redditUtil.editSchedule(data)
        if result:
            msg = "Updated Sidebar!"
            code = 200
        else:
            msg = "Sidebar too long (over 8000)"
            code = 406
        return msg, code
@app.route('/css', methods=['GET'])
def css():
    stylesheet = redditUtil.getStylesheet()
    return Response(stylesheet, mimetype='text/css')
