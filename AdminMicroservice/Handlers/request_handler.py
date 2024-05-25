import http.server
import re
import json

from Handlers.html_handler import HtmlHandler
from Handlers.css_handler import CssHandler
from Handlers.js_handler import JsHandler
from Handlers.img_handler import ImgHandler
from Handlers.form_list_handler import FormListHandler
from Database.db_handler import DatabaseHandler
from Config.config import get_config

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    cookies = {}
    bod = {}
    def __init__(self, *args, **kwargs):
        id_regex = r'([a-zA-Z0-9\-_]{16})'

        self.routes = [
            # GET routes
            ('GET', r'^/?$', HtmlHandler.handle),
            ('GET', r'^/([^\.]+)\.css$', CssHandler.handle),
            ('GET', r'^/admin\.js$', JsHandler.handle),
            ('GET', r'^/pictures/([^\.]+)\.jpg$', ImgHandler.handle),
            ('GET', r'^/pictures/([^\.]+)\.png$', ImgHandler.handle),

            # Microservice routes

            ('GET', f'^/admin-api/users/{id_regex}/forms/?(\\?(.*))?$', FormListHandler.handle_form_list),
            # DELETE routes
            ('DELETE', f'^/admin-api/forms/{id_regex}/?$', FormListHandler.handle_delete_form),
            # PATCH routes
            ('PATCH', f'^/admin-api/forms/{id_regex}/?$', FormListHandler.handle_update_form),
        ]
        super().__init__(*args, **kwargs)

    def has_valid_sid(self):
        #try:

            try:
                sid = self.cookies.get('sessionId')
                if sid is None:
                    raise Exception("No sid")
            except:
                print("No sid")
                return False

            config = get_config()

            db_config = config['database']
            db = DatabaseHandler.getInstance(db_config['host'], db_config['dbname'], db_config['user'], db_config['password'],db_config['port'])
            users = None
            while not users:
                users = db.fetch_query("""SELECT COUNT(*) FROM users WHERE sid = %s;""", (str(sid),))
            if users[0][0] == 1:
                return True
            else:
                if users:
                    print(sid, 'sid not ok', users[0][0]," users found")
                else:
                    print("No response from db")
                return False
        #except:
        #    print('not oka t alkl')
        #    return False

    def set_data_from_body(self):
        try:
            content_len = int(self.headers.get('Content-Length'))
        except:
            content_len = 0
        k = self.rfile.read(content_len)
        if k == b'':
            k = "{}"
        print(k)
        self.bod = json.loads(k)
        print(self.bod)
        ckies = self.bod.pop("cookie", None)
        if ckies:
            for cookie in ckies:
                self.cookies[cookie] = ckies[cookie]

    def do_GET(self):
        self.handle_request('GET')

    def do_POST(self):
        self.handle_request('POST')

    def do_DELETE(self):
        self.handle_request('DELETE')

    def do_PATCH(self):
        self.handle_request('PATCH')

    def handle_request(self, method):
        self.set_data_from_body()

        if not self.has_valid_sid():
            self.send_response(302)
            #self.send_header('Location','http://127.0.0.1:8050/authentication/')
            self.send_header('Location','/authentication/')
            self.end_headers()
            return

        for route_method, pattern, handler in self.routes:
            if route_method == method:
                match = re.match(pattern, self.path)
                if match:
                    #try:
                    handler(self, **match.groupdict())
                    #except Exception as e:
                    #    exc_type, _, exc_tb = sys.exc_info()
                    #    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                    #    print(exc_type, fname, exc_tb.tb_lineno)

                    #    self.send_response(500)
                    #    self.end_headers()
                    return
        self.send_response(404)
        self.end_headers()

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
