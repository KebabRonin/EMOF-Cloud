import http.server
from Config.config import get_config
from Database.db_handler import DatabaseHandler
import json
import html

class HtmlHandler:
    @staticmethod
    def handle(handler):
        user_name = HtmlHandler.get_username_from_sid(handler)
        user_name = html.escape(user_name)
        with open('Static/index.html') as myFile:
            content = myFile.read()
            content = str(content).replace("${{{user_name}}}", str(user_name))
            handler.send_response(200)
            handler.send_header('Content-type', 'text/html')
            handler.end_headers()
            handler.wfile.write(bytearray(content, 'utf-8'))
        return
    
    def get_username_from_sid(self):
        try:
            content_len = int(self.headers.get('Content-Length'))
        except:
            content_len = 0
        k = self.rfile.read(content_len)
        if k == b'':
            k = "{}"
        bod = json.loads(k)
        ckies = bod.pop("cookie", None)
        mycookies = {}
        if ckies:
            for cookie in ckies:
                mycookies[cookie] = ckies[cookie]
        
        try:
            sid = mycookies['sessionId']
        except:
            print("No sid")
            self.send_response(400)
            self.end_headers()
            return None

        config = get_config()

        db_config = config['database']        
        db = DatabaseHandler.getInstance(db_config['host'], db_config['dbname'], db_config['user'], db_config['password'],db_config['port'])
        con = db.connection
        cur = con.cursor()

        user_name = None
        while not user_name:
            con.rollback()
            cur.execute("""SELECT username FROM users WHERE sid = %s;""", (str(sid),))
            user_name = cur.fetchall()
        cur.close()

        if len(user_name) != 1:
            print("found no/multiple users with same sid!!", len(user_name), sid)
            return None
        else:
            return user_name[0][0]