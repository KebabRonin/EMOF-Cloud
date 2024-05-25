import os
import socketserver
from http.server import ThreadingHTTPServer
from Handlers.request_handler import MyHttpRequestHandler

os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8091

with ThreadingHTTPServer(("", PORT), MyHttpRequestHandler) as httpd:
    
    print("serving at port", PORT)
    httpd.serve_forever()