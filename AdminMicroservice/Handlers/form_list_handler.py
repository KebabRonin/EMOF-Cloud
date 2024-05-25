import html
from Database.db_handler import DatabaseHandler
from Config.config import get_config

class FormListHandler:

    def is_valid_img(img):
        if not img:
            return False
        elif img.startswith("data:image/"):
            return True
        return False

    select_skeleton = "SELECT id, name, public, image, status, questions, total_responses(id), published_at, closed_at, tags FROM forms "
    @staticmethod
    def format_response(rez):
        forms = []
        for i in rez:
            nr_qs = 0
            
            for q in i[5]["questions"].keys():
                if q.isdigit():
                    nr_qs+=1
            forms.append(
                {"id":i[0], "title":html.escape(i[1]), "public":i[2], "image":i[3] if FormListHandler.is_valid_img(i[3]) else None, "status":html.escape(i[4]),"nr_questions":nr_qs,"nr_responses":i[6], "description":html.escape(i[5]["description"]),
        "published_at":i[7].strftime("%d-%m-%Y %H:%M") if i[7] else None, "closed_at":i[8].strftime("%d-%m-%Y %H:%M") if i[8] else None, "tags":i[9]}
            )
        return forms

    @staticmethod
    def handle_form_list(handler):
        user_id = (handler.path.split("/users/")[1])[0:16]
        
        forms_of_user = []
        where_clause = ""
        if handler.path.find("?") != -1:
            qstr = handler.path.split("?")[1]
            for i in qstr.split("&"):
                if i == "filter=draft":
                    where_clause = " AND status='draft'"
                elif i == "filter=active":
                    where_clause = " AND status='active'"
                elif i == "filter=closed":
                    where_clause = " AND status='closed'"

                else:
                    # Daca intalnesc un parametru necunoscut
                    handler.send_json_response([])
                    return
        
        config = get_config()

        db_config = config['database']        
        db = DatabaseHandler.getInstance(db_config['host'], db_config['dbname'], db_config['user'], db_config['password'],db_config['port'])
        
        forms_of_user = FormListHandler.format_response(
            db.fetch_query(FormListHandler.select_skeleton + """WHERE id_creator = %s""" + where_clause + " ORDER BY created_at DESC;", (str(user_id),))
            )

        handler.send_json_response(forms_of_user)
    

    @staticmethod
    def handle_delete_form(handler):
        form_id = handler.path.split("/forms/")[1][0:16]
        config = get_config()

        db_config = config['database']        
        db = DatabaseHandler.getInstance(db_config['host'], db_config['dbname'], db_config['user'], db_config['password'],db_config['port'])
        
        c = db.connection.cursor()
        c.execute("""DELETE FROM forms WHERE id = %s;""", (str(form_id),))
        if(c.rowcount > 0):
            db.connection.commit()
            handler.send_response(200)
            handler.end_headers()
        else:
            db.connection.rollback()
            handler.send_response(409) #Conflict
            handler.end_headers()
        c.close()

    def handle_update_form(handler):
        patch_data_json = handler.bod
        
        newStatus = None
        newPublicStatus = None
        
        for i in patch_data_json:
            if i == "status":
                if patch_data_json[i] in {"active", "closed"}:
                    newStatus = patch_data_json[i]
            elif i == "public":
                newPublicStatus = bool(patch_data_json[i])
                print(patch_data_json[i], newPublicStatus)
        
        form_id = handler.path.split("/forms/")[1][0:16]
        config = get_config()

        db_config = config['database']        
        db = DatabaseHandler.getInstance(db_config['host'], db_config['dbname'], db_config['user'], db_config['password'],db_config['port'])

        if newStatus:
            c = db.connection.cursor()
            c.execute("""UPDATE forms SET status=%s WHERE id = %s;""", (str(newStatus),str(form_id),))
            if(c.rowcount > 0):
                db.connection.commit()
                handler.send_response(200)
                handler.end_headers()
            else:
                db.connection.rollback()
                handler.send_response(409) #Conflict
                handler.end_headers()
            c.close()
        if newPublicStatus is not None:
            c = db.connection.cursor()
            c.execute("""UPDATE forms SET public=%s WHERE id = %s;""", (bool(newPublicStatus),str(form_id),))
            if(c.rowcount > 0):
                db.connection.commit()
                handler.send_response(200)
                handler.end_headers()
            else:
                db.connection.rollback()
                handler.send_response(409) #Conflict
                handler.end_headers()
            c.close()
