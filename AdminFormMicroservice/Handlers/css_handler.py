import http.server

class CssHandler:
    @staticmethod
    def handle(handler):
        handler.path = '/Static/style.css'
        return http.server.SimpleHTTPRequestHandler.do_GET(handler)