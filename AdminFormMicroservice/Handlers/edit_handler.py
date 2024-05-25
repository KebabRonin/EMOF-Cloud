import json
import secrets

from Config.config import get_config
from Database.db_handler import DatabaseHandler
from Helpers.json_response import JsonResponse

class EditHandler:
    @staticmethod
    def handle(handler):

        #if id is None:
        #    handler.send_json_response(JsonResponse.error("Form ID is empty") , 400 )
        #    return

        #TODO : ADD SOME MORE VERIFICATION HERE

        content_length = int(handler.headers['Content-Length'])
        post_data = handler.rfile.read(content_length)
        post_data_decoded = post_data.decode('utf-8')
        post_data_json = json.loads(post_data_decoded)
        
        print(json.dumps(post_data_json, indent=4))  # Afiseaza datele JSON într-un format lizibil

        config = get_config()

        db_config = config['database']        
        db = DatabaseHandler.getInstance(db_config['host'], db_config['dbname'], db_config['user'], db_config['password'],db_config['port'])

        #TO BE DELETED
        name = post_data_json.pop("name")
        tags = post_data_json.pop("tags")
        form_id = post_data_json.pop('id')
        image = post_data_json.pop('image')
        cookie = post_data_json.pop("cookie")

        sessionID =  cookie['sessionId']

        query = "SELECT id FROM public.users WHERE sid = %s"
        result = db.fetch_query(query, (sessionID,))
        user_id = result[0][0] if result else None

        if user_id is None:
            handler.send_json_response(JsonResponse.error("User not found") ,status = 404)
            return
        
        query = "SELECT id_creator FROM public.forms WHERE id = %s"
        result = db.fetch_query(query, (form_id,))
        id_creator = result[0][0] if result else None

        if id_creator is None:
            handler.send_json_response(JsonResponse.error("Form not found") , status = 404)
            return
        
        print(id_creator ,  user_id)
        if id_creator != user_id:
            handler.send_json_response(JsonResponse.error("You are not authorised to edit this form") ,status = 403)
            return

        # user_id = "Mk6dpRgLGEahkC32"

        form_data = {
            'id': form_id,
            'id_creator': user_id, 
            'name': name,
            'questions': post_data_json,  
            'public': True,  # presupunem că formularul este public
            'tags':tags,
            'image': image
        }

        print("ASTA E JSONU FORM_DATA CE URMEAZA SA FACA UPDATE IN DB :")
        print(form_data)
        
        query = """
		UPDATE public.forms
		SET id_creator = %s, name = %s, questions = %s, public = %s, tags = %s, image = %s
		WHERE id = %s
		"""

        try:
            db.execute_query(query, (form_data['id_creator'], form_data['name'], 
                         json.dumps(form_data['questions']), form_data['public'], 
                         json.dumps(form_data['tags']), form_data['image'], form_data['id']))
            handler.send_json_response(JsonResponse.success("Data received and processed"))
        except Exception as err:
            print(f"Unexpected {err=}, {type(err)=}")
            handler.send_json_response(JsonResponse.error("Nu s-a putut edita formularul") , status=400)

