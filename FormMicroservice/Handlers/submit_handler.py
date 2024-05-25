import json
import secrets

from Config.config import get_config
from Database.db_handler import DatabaseHandler
from Helpers.json_response import JsonResponse

class SubmitHandler:
    @staticmethod
    def handle(handler , id=None):

        if id is None:
            handler.send_json_response(JsonResponse.error("Form ID is empty") , 400 )
            return

        #TODO : ADD SOME MORE VERIFICATION HERE

        content_length = int(handler.headers['Content-Length'])
        post_data = handler.rfile.read(content_length)
        post_data_decoded = post_data.decode('utf-8')
        post_data_json = json.loads(post_data_decoded)
        
        print(json.dumps(post_data_json, indent=4))  # Afiseaza datele JSON într-un format lizibil

        config = get_config()

        db_config = config['database']        
        db = DatabaseHandler.getInstance(db_config['host'], db_config['dbname'], db_config['user'], db_config['password'],db_config['port'])

        duration = post_data_json.pop("duration")
        cookies = post_data_json.pop("cookie", None)
        response_to_db = {
            'id_form': id,  # înlocuiți cu ID-ul formularului
            'response': post_data_json,  # înlocuiți cu răspunsul real
            'id': secrets.token_hex(16)[:16], # înlocuiți cu ID-ul utilizatorului
            'duration' : duration
        }

        # inserați datele în baza de date
        query = "INSERT INTO public.responses (response, id_form, submitted_at, id, duration) VALUES (%s, %s, NOW(), %s, %s)"
        db.execute_query(query, (json.dumps(response_to_db['response']), response_to_db['id_form'], response_to_db['id'], response_to_db['duration']))

        # Trimiterea raspunsului
        handler.send_json_response(JsonResponse.success("Data received and processed"))
