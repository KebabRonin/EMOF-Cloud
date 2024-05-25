import http.server
import requests
import urllib.parse
import json
import time
import redis
import logging
import datetime

from http.server import ThreadingHTTPServer
from http.cookies import SimpleCookie
from Config.config import get_config
from Database.db_handler import DatabaseHandler

# acest gateway va prelua cererea clientului si va trimite cererea catre serviciul aferent , gateway ul asteapta
# raspunsul de la serviciul aferent si dupa ce il primeste il trimite inapoi la client
#
# de ex :
# clientul face request la http://127.0.0.1:8050/forms-microservice (8050 fiind portul acestui gateway , forms-microservice e serviciul aferent la care vrem sa trimitem request)
# acest gateway va prelua cererea cererea clientului si o va trimite catre http://127.0.0.1:8088 (acesta este URL-ul la care serviciul aferent a fost pornit)
# , gateway ul va returna automat catre client raspunsul de la http://127.0.0.1:8088

SERVICE_URLS = {
    'forms-microservice': 'http://127.0.0.1:8088',  # asta inseamna ca de acum requesturile catre http://127.0.0.1:8050/forms-microservice vor fi redirectate catre  http://127.0.0.1:8088
    'admin-forms-microservice' : "http://127.0.0.1:8100" ,
    'admin': 'http://127.0.0.1:8090',
    'explore': 'http://127.0.0.1:8091',
    'service2': 'http://127.0.0.1:5002',
    'authentication': 'http://127.0.0.1:8084',
    'statistics': 'http://127.0.0.1:8083'
    # etc...
}

CONFIG = get_config()
DB_CONFIG = CONFIG['database']

db = DatabaseHandler.getInstance(DB_CONFIG['host'], DB_CONFIG['dbname'], DB_CONFIG['user'], DB_CONFIG['password'],DB_CONFIG['port'])
cache = redis.StrictRedis(host='emof-cache-redis-STP-resource-group.redis.cache.windows.net',port=6380,password="qYAi3rCq5wit971HZeEcvLLMV0dN1XZzQAzCaDHD79o=",ssl=True)

class GatewayRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.handle_request(requests.get)

    def do_POST(self):
        self.handle_request(requests.post)

    def do_PATCH(self):
        self.handle_request(requests.patch)

    def do_DELETE(self):
        self.handle_request(requests.delete)

    def do_PUT(self):
        self.handle_request(requests.put)

    def handle_request(self, request_method):
        url = urllib.parse.urlparse(self.path)
        segments = url.path.split('/')[1:]  # split by / and remove the first empty string

        if len(segments) == 0 or len(segments[0]) == 0: # daca am intrat pe emof.com/
            self.send_response(301)
            self.send_header('Location','/explore')
            self.end_headers()
            return

        service = segments[0]

        #get cookie data
        data = {}
        cookie_raw = self.headers.get('Cookie')
        if cookie_raw:
            #print(cookie_raw)
            cookie = SimpleCookie()
            cookie.load(cookie_raw)
            #print(cookie)
            cookies = {k: v.value for k, v in cookie.items()}
            data.update({"cookie" : cookies})

        if 'Content-Length' in self.headers:
            content_length = int(self.headers['Content-Length'])  # Get the size of data
            raw_data = self.rfile.read(content_length)  # Get the data itself
            raw_data_decoded = raw_data.decode('utf-8')
            data_json = json.loads(raw_data_decoded)
            #combine cookie data with the data from client header request
            data.update(data_json)

        forward_data = bytearray(json.dumps(data),"utf-8")

        if service in SERVICE_URLS:
            target_url = SERVICE_URLS[service] + '/' + '/'.join(segments[1:])
            if url.query != "":
                target_url = target_url + "?" + url.query

            # GOD FORGIVE ME FOR MY SINS
            if "statistics" in service or ("admin" in service and not (".css" in target_url or ".png" in target_url or ".img" in target_url or "jpg" in target_url or "jpeg" in target_url)):
               send_error = False
               sessionId = None
               try:
                   sessionId = cookies['sessionId']
               except:
                   print("Nu are sessionID")
               if sessionId is None:
                   send_error = True
               elif cache.get(sessionId) is None:

                    print("Cache miss !!")
                    user_id = None
                    query = "SELECT id FROM public.users WHERE sid = %s"
                    try:
                        result = db.fetch_query(query, (sessionId,))
                        user_id = result[0][0] if result else None
                    except:
                        print("Nu s-a gasit utilizator cu aces sid")

                    if user_id is None:
                        send_error = True
                    else:
                        print("UTILIZATORUL EXISTA")
                        cache.set(sessionId,user_id)
               else:
                    print("Cache HIT <3")

               if send_error == True:

                    print("SE VA TRIMITE LA LOGIN !!!!")
                    print(target_url , forward_data )
                    data = {"message": "You need to login first", "status": "unauthorized"}
                    response_data_json = json.dumps(data)
                    self.send_response(403)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(response_data_json.encode())
                    return

            #print("UITE FRATE ::")
            #print(forward_data)
            response = request_method(target_url, data=forward_data)

            self.send_response(response.status_code)
            self.end_headers()
            self.wfile.write(response.content)

        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Service not found')

import os
PORT = int(os.environ['PORT'])

with ThreadingHTTPServer(("", PORT), GatewayRequestHandler) as httpd:
    print("Gateway service running at port", PORT)
    httpd.serve_forever()