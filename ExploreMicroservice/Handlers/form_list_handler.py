from Database.db_handler import DatabaseHandler
from Config.config import get_config
import html

class ExploreListHandler:
    select_skeleton = """SELECT f.id, f.name, image, questions, total_responses(f.id), u.username, f.published_at, f.closed_at
            FROM forms f JOIN users u ON u.id = id_creator WHERE status='active' AND public=TRUE"""
    @staticmethod
    def format_response(rez):
        forms = []
        for i in rez:
            nr_qs = 0
            
            for q in i[3]["questions"].keys():
                if q.isdigit():
                    nr_qs+=1

            forms.append(
                {"id":i[0], "title":html.escape(i[1]), "image":i[2],
                 "nr_questions":nr_qs,"nr_responses":i[4], "description":html.escape(i[3]["description"]), "author":html.escape(i[5])}
            )
        return forms

    @staticmethod
    def handle_popular(handler):
        forms = []
        config = get_config()

        db_config = config['database']        
        db = DatabaseHandler.getInstance(db_config['host'], db_config['dbname'], db_config['user'], db_config['password'],db_config['port'])
        
        forms_of_user = db.fetch_query(ExploreListHandler.select_skeleton + """ ORDER BY total_responses(f.id) DESC LIMIT 10;""")
        forms = ExploreListHandler.format_response(forms_of_user)

        handler.send_json_response(forms)

    
    @staticmethod
    def handle_new(handler):
        forms = []
        config = get_config()

        db_config = config['database']        
        db = DatabaseHandler.getInstance(db_config['host'], db_config['dbname'], db_config['user'], db_config['password'],db_config['port'])
        
        forms_of_user = db.fetch_query(ExploreListHandler.select_skeleton + """ ORDER BY f.published_at DESC LIMIT 10;""")
        forms = ExploreListHandler.format_response(forms_of_user)

        handler.send_json_response(forms)