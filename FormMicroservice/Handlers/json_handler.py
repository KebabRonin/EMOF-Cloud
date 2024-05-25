import http.server
import json

from http import cookies
from Config.config import get_config
from Database.db_handler import DatabaseHandler
from Helpers.json_response import JsonResponse

class JsonHandler:
    @staticmethod
    def handle(handler, id=None):
        
        if id is None:
            handler.send_json_response(JsonResponse.error("Form ID is empty") , 400 )
            return

        #TODO : ADD SOME MORE VERIFICATION HERE

        config = get_config()

        db_config = config['database']
        db = DatabaseHandler.getInstance(db_config['host'], db_config['dbname'], db_config['user'], db_config['password'],db_config['port'])

        # Selectați formularul corespunzător din baza de date
        query = "SELECT id, id_creator, name, created_at, closed_at, public, questions, status, published_at, tags, image FROM public.forms WHERE id = %s"
        form = db.fetch_query(query, (id,))

        #TODO : TREBUIE SA TRIMIT UN ALT JSON CE NU CONTINE SI DATE CONFIDENTIALE , CI NUMAI MINIMUL NECESAR

        if form:
            #TODO : trebuie verificat daca formularul este live sau nu
            data_to_send = form[0][6] # form[0] deoarece fetch_query returnează o listă de rezultate
            image = {"image": form[0][10]}
            name = {"name": form[0][2]}
            data_to_send.update(image)
            data_to_send.update(name)
            handler.send_json_response(data_to_send)
        else:
            handler.send_json_response(JsonResponse.error("There is no form with this ID") , 400 )