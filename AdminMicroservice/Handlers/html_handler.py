from Database.db_handler import DatabaseHandler
from Config.config import get_config
import html


class HtmlHandler:
    @staticmethod
    def get_username_from_sid(handler):
        try:
            sid = handler.cookies.get('sessionId')
        except:
            print("No sid")
            handler.send_response(400)
            handler.end_headers()
            return None
        
        config = get_config()

        db_config = config['database']
        db = DatabaseHandler.getInstance(db_config['host'], db_config['dbname'], db_config['user'], db_config['password'],db_config['port'])
        
        user_name = None
        while not user_name:
            user_name = db.fetch_query("""SELECT username FROM users WHERE sid = %s;""", (str(sid),))

        if len(user_name) != 1:
            print("found no/multiple users with same sid!!", len(user_name), sid)
            return None
        else:
            return user_name[0][0]



    @staticmethod
    def handle(handler):
        # handler.path = '/Static/admin.js'

        user_name = HtmlHandler.get_username_from_sid(handler)
        if user_name is None:
            return
        
        with open('Static/admin.html') as myFile:
            content = myFile.read()
            content = str(content).replace("${{{user_name}}}", html.escape(str(user_name)))
            handler.send_response(200)
            handler.send_header('Content-type', 'text/html')
            handler.end_headers()
            handler.wfile.write(bytearray(content, 'utf-8'))
        return