import os
import socketserver
from http.server import ThreadingHTTPServer
from Handlers.request_handler import MyHttpRequestHandler

os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8100

with ThreadingHTTPServer(("", PORT), MyHttpRequestHandler) as httpd:
    hostName = "127.0.0.1"
    print("Server started http://%s:%s" % (hostName, PORT))
    httpd.serve_forever()