import http.server

class JsEditHandler:
    @staticmethod
    def handle(handler):
        handler.path = '/Static/edit.js'
        return http.server.SimpleHTTPRequestHandler.do_GET(handler)