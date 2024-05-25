from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import re
import psycopg2
import yaml

hostName = "0.0.0.0"
serverPort = 8083

def escapeHTML(string):
    return str(string).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("\'", "&#039;")

def get_db_connection():
    with open('config.yaml', 'r') as config_file:
        config = yaml.safe_load(config_file)

    conn = psycopg2.connect(
        database=config['database'],
        user=config['user'],
        password=config['password'],
        host=config['host'],
        port=config['port']
    )
    return conn
con = get_db_connection()

#Extinde SimpleHTTPRequestHandler
class MyServer(SimpleHTTPRequestHandler):
    def do_GET(self):
        if re.match("^/([a-zA-Z0-9-_]{16})/?$",self.path): #verifica daca am /{id_form}
            id_form = self.path.split("/")[1] #Imi ia id_form-ul
            print(id_form)
            user_name = self.get_username_from_sid(id_form)
            if user_name is None:
                self.send_response(403)
                self.end_headers()
                return
            #Deschide pe pagina de statistici si inlocuieste placeholder-ul din HTML cu adevarul id_form
            with open('static/statistics.html') as myFile:
                content = myFile.read()
                content = str(content).replace("${{{id_form}}}", str(id_form))
                content = str(content).replace("${{{user_name}}}", escapeHTML(user_name))
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(bytearray(content, 'utf-8'))
            return
        elif re.match("^/data/([a-zA-Z0-9-_]{16})/?$",self.path):
            id_form = self.path.split("/data/")[1]
            data = self.retrieve_data_from_database(id_form)
            response = json.dumps(data).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0') #Previne caching-ul 
            self.end_headers()
            self.wfile.write(response)
            return
        
        return SimpleHTTPRequestHandler.do_GET(self) #Daca nu intra in niciun if codul se intoarce la comportamentul default al lui do_GET
 
    def retrieve_data_from_database(self, id_form):
        cur = con.cursor()
        sql = "SELECT name, questions, published_at, closed_at FROM forms WHERE id = %s"
        cur.execute(sql, (id_form,))
        result = cur.fetchone()
        cur.close()
        
        if result:
            form_name = result[0]
            form_data = result[1]
            published_at = result[2]
            closed_at = result[3]

            questions = form_data['questions']
            
            cur = con.cursor()
            sql = "SELECT response, duration, submitted_at FROM responses WHERE id_form = %s"
            cur.execute(sql, (id_form,))
            response_rows = cur.fetchall()
            cur.close()
            
            answers = []
            for response_row in response_rows:
                response = response_row[0]
                response_duration = response_row[1]
                submitted_at = response_row[2]
                
                info = response.pop("userInfo")

                answer_data = {
                    'response': response,
                    'user_info': info,
                    'duration': str(response_duration),
                    'submitted_at': str(submitted_at)
                }
                
                answers.append(answer_data)
            
            published_at_str = published_at.strftime("%Y-%m-%d %H:%M:%S")
            closed_at_str = closed_at.strftime("%Y-%m-%d %H:%M:%S")

            last_key, requested = questions.popitem()
            
            return {
                'form_name': form_name,
                'published_at': published_at_str,
                'closed_at': closed_at_str,
                'answers': answers,
                'questions':questions,
                'requested': requested
            }
        else:
            return None
        
    def get_username_from_sid(self, id_form):
        try:
            content_len = int(self.headers.get('Content-Length'))
        except:
            content_len = 0
        k = self.rfile.read(content_len)
        if k == b'':
            k = "{}"
        print(k)
        bod = json.loads(k)
        print(bod)
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
        cur = con.cursor()
        user_name = None
        con.rollback()
        cur.execute("""SELECT username FROM users u JOIN forms f on f.id_creator = u.id WHERE u.sid = %s AND f.id = %s;""", (str(sid), str(id_form)))
        user_name = cur.fetchall()
        print(user_name)
        cur.close()

        if len(user_name) != 1:
            print("found no/multiple users with same sid!!", len(user_name), sid)
            return None
        else:
            return user_name[0][0]

if __name__ == "__main__":
    webServer = ThreadingHTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))
    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
