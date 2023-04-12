import math
from time import sleep
import pyautogui
pyautogui.FAILSAFE = False
from flask import send_from_directory, Flask, request, jsonify
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)


width, height = pyautogui.size()
sensitivity = 800;
max_dimension = max(width, height)

app = Flask(
  __name__,
)

@app.route('/api/sanity-check')
def check():
    return "app works"

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory('static', path)

@app.route('/api/mouse-vector', methods=['POST'])
def mouse_vector():
    vector = request.json
    x = math.floor(vector['x'] * sensitivity)
    y = math.floor(vector['y'] * sensitivity)

    pyautogui.moveRel(x, y)

    response = jsonify({'status': 'Mouse moved'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/api/mouse-click', methods=['GET'])
def mouse_click():
    pyautogui.click()

    response = jsonify({'status': 'Mouse clicked'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/api/mouse-right-click', methods=['GET'])
def mouse_right_click():
    pyautogui.rightClick()
    
    response = jsonify({'status': 'Mouse right clicked'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

    
if __name__ == '__main__':
  app.run(
	host='0.0.0.0',
	debug=False,
	port=80, 
)