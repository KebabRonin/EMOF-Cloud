import http.server

class CssEmofHandler:
    @staticmethod
    def handle(handler):
        handler.path = '/Static/emof.css'
        return http.server.SimpleHTTPRequestHandler.do_GET(handler)