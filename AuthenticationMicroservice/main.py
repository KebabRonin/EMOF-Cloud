import hashlib
from http.server import BaseHTTPRequestHandler, HTTPServer, ThreadingHTTPServer
from pyisemail import is_email
import psycopg2
import yaml
import random
import string
import json
import psycopg2.extras
from datetime import datetime
from urllib.parse import parse_qs
from azure.communication.email import EmailClient

hostName = "127.0.0.1"
serverPort = 8084

print(__file__)

def send_confirmation_mail(email, username):
    try:
        connection_string = open("secret", "rt").read()
        client = EmailClient.from_connection_string(connection_string)

        message = {
            "senderAddress": "DoNotReply@c146f9fa-2c0a-4e0a-9173-777535133fff.azurecomm.net",
            "recipients":  {
                "to": [{"address": email}],
            },
            "content": {
                "subject": "Confirmation Email",
                "plainText": f"Thanks for signing up, {username}!",
            }
        }

        poller = client.begin_send(message)
        result = poller.result()

    except Exception as ex:
        print(ex)



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

def check_if_email_already_exists(email):
    cur = con.cursor()
    sql = "SELECT COUNT(*) FROM users WHERE email = %s"
    cur.execute(sql, (email,))
    result = cur.fetchone()[0]
    cur.close()
    return result > 0

def check_if_username_already_exists(username):
    cur = con.cursor()
    sql = "SELECT COUNT(*) FROM users WHERE username = %s"
    cur.execute(sql, (username,))
    result = cur.fetchone()[0]
    cur.close()
    return result > 0

def check_if_email_match_password(email,password):
    cur = con.cursor()
    sql = "SELECT password FROM users WHERE email = %s"
    cur.execute(sql, (email,))
    account_password = cur.fetchone()[0]
    cur.close()
    if account_password == password:
        return True
    else:
        return False

def check_if_username_match_password(username,password):
    cur = con.cursor()
    sql = "SELECT password FROM users WHERE username = %s"
    cur.execute(sql, (username,))
    account_password = cur.fetchone()[0]
    cur.close()
    if account_password == password:
        return True
    else:
        return False

def login_user(username_or_email, password):
    hashed_password = hash_password(password)
    if check_if_email_already_exists(username_or_email):
        if check_if_email_match_password(username_or_email, hashed_password) == False:
            raise ValueError("Your password is incorrect. Please re-enter your information.")
    elif check_if_username_already_exists(username_or_email):
        if check_if_username_match_password(username_or_email, hashed_password) == False:
            raise ValueError("Your password is incorrect. Please re-enter your information.")
    else:
        raise ValueError("Your username, email, or password is incorrect. Please re-enter your information.")

    session_id = generate_session_id()

    insert_session_id(username_or_email, session_id)

    return session_id

def insert_session_id(username_or_email, session_id):
    sql = "UPDATE users SET sid = %s WHERE username = %s OR email = %s"
    cursor = con.cursor(cursor_factory=psycopg2.extras.DictCursor) #parametrul din paranteza e optional si e folosit doar ca sa returneze dict in loc de lista de tuple cum era default
    cursor.execute(sql, (session_id, username_or_email, username_or_email))
    con.commit()
    cursor.close()

def generate_session_id(length=10):
    characters = string.ascii_letters + string.digits
    session_id = ''.join(random.choices(characters, k=length))
    return session_id

def insert_user(email, username, password):
    if not is_email(email, allow_gtld=False):
        raise ValueError("Invalid email address.")
    if check_if_email_already_exists(email):
        raise ValueError("Email address already exists.")
    if check_if_username_already_exists(username):
        raise ValueError("Username already exists.")

    session_id = generate_session_id()
    now = datetime.now()
    hashed_password = hash_password(password)
    sql = "INSERT INTO users (email, username, password, created_at, updated_at, sid) " \
          "VALUES (%(email)s, %(username)s, %(password)s, %(created_at)s, %(updated_at)s, %(sid)s)"
    params = {
        'email': email,
        'username': username,
        'password': hashed_password,
        'created_at': now,
        'updated_at': now,
        'sid': session_id
    }
    cur = con.cursor()
    cur.execute(sql, params)
    con.commit()
    cur.close()
    return session_id

#Foloseste algoritmul SHA-256 pentru criptare
def hash_password(password):
    sha256_hash = hashlib.sha256()
    sha256_hash.update(password.encode('utf-8'))
    hashed_password = sha256_hash.hexdigest() #hexdigest returneaza string-ul cu valoarea hashuita
    return hashed_password

def verify_password(password, hashed_password):
    sha256_hash = hashlib.sha256()
    sha256_hash.update(password.encode('utf-8'))
    entered_password_hashed = sha256_hash.hexdigest()
    return entered_password_hashed == hashed_password

class MyServer(BaseHTTPRequestHandler):
    #Apelata cand serverul primeste un request GET
    def do_GET(self):
        if self.path == '/':
            filename = 'static/landing.html'
        elif self.path == '/logout':
            # logout user
            content_length = int(self.headers['Content-Length']) #Ca sa stie dimensiunea a ceea ce primeste
            body = self.rfile.read(content_length) #Citeste continutul din request si il baga in body
            bodyDecoded = body.decode('utf-8') #Decodeaza din bytes in String
            data = json.loads(bodyDecoded) #Parseaza ceea ce a primit ca JSON
            print(data)
            cookies = data.get('cookie', None)
            if cookies is not None:
                sessionId = cookies.get('sessionId', None)
                if sessionId is not None:
                    cur = con.cursor()
                    sql = "UPDATE users set sid = NULL where sid = %s"
                    cur.execute(sql,(sessionId,))
                    print(cur.rowcount, " sessionIds removed (",sessionId, ")")
                    con.commit()

            filename = 'static/logout.html'
        else:
            filename = self.path[1:] # '/' initial e eliminat ca sa obtinem numele fisierului

        try:
            with open(filename, 'rb') as f:
                content = f.read()
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(content) # contentul fisierului e scris ca raspuns
        except FileNotFoundError:
            self.send_error(404, 'File not found')

    def do_POST(self):
        content_length = int(self.headers['Content-Length']) #Ca sa stie dimensiunea a ceea ce primeste
        body = self.rfile.read(content_length) #Citeste continutul din request si il baga in body
        bodyDecoded = body.decode('utf-8') #Decodeaza din bytes in String
        data = json.loads(bodyDecoded) #Parseaza ceea ce a primit ca JSON

        if self.path == '/signup':
            email = data['email']
            username = data['username']
            password = data['password']

            try:
                session_id = insert_user(email, username, password)
                response_data = {
                    'result': 'Success',
                    'sessionId': session_id
                }
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8')) #Raspunsul ca JSON este serializat intr-un String si codat folosind utf-8 si e trimis ca raspuns
                send_confirmation_mail(email, username)
            except ValueError as e:
                self.send_response(400)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(str(e).encode('utf-8')) #Daca nu e ceva corect trimite ca raspuns un mesaj de eroare
        elif self.path == '/login':
            username_email = data['emailUsername']
            password = data['password']

            try:
                session_id = login_user(username_email, password)
                response_data = {
                    'result': 'Success',
                    'sessionId': session_id
                }
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
            except ValueError as e:
                self.send_response(400)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(str(e).encode('utf-8'))
        else:
            self.send_error(404, 'Page not found')

#Conditia verifica daca scriptul e rulat direct ca main
if __name__ == "__main__":
    webServer = ThreadingHTTPServer((hostName, serverPort), MyServer) #Creeaza o instanta cu host si port si specifica handler-ul MyServer care sa se ocupe de request-uri
    print("Server started http://%s:%s" % (hostName, serverPort))
    try:
        webServer.serve_forever() #Porneste server pe termen nedefinit, gestionand cererile in thread-uri diferite. Asta permite ca cererile sa fie procesate in acelasi timp.
    except KeyboardInterrupt: #Cand primeste CTRL+C se inchide
        pass

    webServer.server_close()
    print("Server stopped.")
