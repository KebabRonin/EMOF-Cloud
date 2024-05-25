import datetime

class Logger:
    @staticmethod
    def log(client_address, request_line, status_code):
        current_time = datetime.datetime.now().strftime('%d/%b/%Y %H:%M:%S')
        log_message = f"RESPONSE {client_address} - - [{current_time}] {request_line} {status_code}"
        print(log_message)
