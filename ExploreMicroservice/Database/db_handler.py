import psycopg2
from psycopg2 import sql
import threading

class DatabaseHandler:
    __instance = None
    __lock = threading.Lock()

    @staticmethod
    def getInstance(host, dbname, user, password,port):
        DatabaseHandler.__lock.acquire()
        if DatabaseHandler.__instance is None:
            DatabaseHandler.__instance = DatabaseHandler(host, dbname, user, password,port)
        DatabaseHandler.__lock.release()
        return DatabaseHandler.__instance

    def __init__(self, host, dbname, user, password,port):
        if DatabaseHandler.__instance != None:
            raise Exception("This class is a singleton!")
        else:
            self.host = host
            self.dbname = dbname
            self.user = user
            self.password = password
            self.port = port
            self.connection = psycopg2.connect(host=self.host, dbname=self.dbname, user=self.user, password=self.password , port =self.port)
            DatabaseHandler.__instance = self

    def execute_query(self, query, params=None):
        cursor = self.connection.cursor()
        if params is None:
            cursor.execute(query)
        else:
            cursor.execute(query, params)
        self.connection.commit()
        cursor.close()

    def fetch_query(self, query, params=None):
        cursor = self.connection.cursor()
        if params is None:
            cursor.execute(query)
        else:
            cursor.execute(query, params)
        ret = cursor.fetchall()
        cursor.close()
        return ret

    def close(self):
        self.connection.close()