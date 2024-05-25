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
            self.connection = psycopg2.connect(host=self.host, dbname=self.dbname, user=self.user, password=self.password, port=self.port)
            self.cursor = self.connection.cursor()  # Create a new cursor
            DatabaseHandler.__instance = self

    def execute_query(self, query, params=None):
        if params is None:
            self.cursor.execute(query)
        else:
            self.cursor.execute(query, params)
        self.connection.commit()

    def fetch_query(self, query, params=None):
        if params is None:
            self.cursor.execute(query)
        else:
            self.cursor.execute(query, params)
        return self.cursor.fetchall()

    def close(self):
        self.cursor.close()
        self.connection.close()