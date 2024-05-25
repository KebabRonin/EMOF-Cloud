
import http.server
import re
import json
from http import cookies

from Helpers.my_logging import Logger
from Handlers.html_handler import HtmlHandler
from Handlers.css_handler import CssHandler
from Handlers.js_handler import JsHandler
from Handlers.json_handler import JsonHandler
from Handlers.img_handler import ImgHandler
from Handlers.submit_handler import SubmitHandler

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):

        #prefix is empty for the moment
        prefix = ""

        self.routes = [
            # GET routes
            ('GET', r'/(?P<id>[\w\-]{16})\.html', HtmlHandler.handle),
            ('GET', r'/(?P<id>[\w\-]{16})\.json', JsonHandler.handle),
            ('GET', r'/style\.css$', CssHandler.handle),
            ('GET', r'/script\.js$', JsHandler.handle),
            ('GET', r'/background\.jpg', ImgHandler.handle),
            ('GET', r'/icon\.png', ImgHandler.handle),

            # POST routes
            ('POST', r'/submit/(?P<id>[\w\-]{16})', SubmitHandler.handle),
        ]
        super().__init__(*args, **kwargs)

    def do_GET(self):
        self.handle_request('GET')

    def do_POST(self):
        self.handle_request('POST')

    def handle_request(self, method):
        for route_method, pattern, handler in self.routes:
            if route_method == method:
                match = re.match(pattern, self.path)
                if match:
                    handler(self, **match.groupdict())
                    return
        self.send_response(404)
        self.end_headers()
        self.wfile.write(b"404 Not Found")

    def send_json_response(self, data, status=200):
        response_data_json = json.dumps(data)
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(response_data_json.encode())

    def send_html_response(self, data , status=200):
        self.send_response(200)

        self.send_header('Content-type','text/html')

        self.end_headers()
        self.wfile.write(bytes(data, "utf8"))
