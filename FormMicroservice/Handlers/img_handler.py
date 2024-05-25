import http.server

class ImgHandler:
    @staticmethod
    def handle(handler):
        
        if handler.path.endswith("background.jpg"):
            handler.path = '/Static/background.jpg'
        elif handler.path.endswith("icon.png"):
            handler.path = '/Static/icon.png'
        else:
            handler.path = ''
        return http.server.SimpleHTTPRequestHandler.do_GET(handler)