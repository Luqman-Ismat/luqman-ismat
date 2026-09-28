from mpp_parser import app
app.config['MAX_CONTENT_LENGTH'] = 8 * 1024 * 1024
app.run(host='127.0.0.1', port=3188, threaded=False)
