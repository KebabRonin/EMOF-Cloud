from Database.db_handler import DatabaseHandler
from Config.config import get_config

class JsHandler:
    @staticmethod
    def get_id_from_sid(handler):
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
        
        user_id = None
        while not user_id:
            user_id = db.fetch_query("""SELECT id FROM users WHERE sid = %s;""", (str(sid),))

        if len(user_id) != 1:
            print("found no/multiple users with same sid!!", len(user_id), sid)
            return None
        else:
            return user_id[0][0]



    @staticmethod
    def handle(handler):
        # handler.path = '/Static/admin.js'

        user_id = JsHandler.get_id_from_sid(handler)
        if user_id is None:
            return
        
        with open('Static/admin.js') as myFile:
            content = myFile.read()
            content = str(content).replace("${{{user_id}}}", str(user_id))
            handler.send_response(200)
            handler.send_header('Content-type', 'application/javascript')
            handler.end_headers()
            handler.wfile.write(bytearray(content, 'utf-8'))
        return