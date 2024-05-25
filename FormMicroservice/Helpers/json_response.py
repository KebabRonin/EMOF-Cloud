class JsonResponse:
    @staticmethod
    def success(message="Data received successfully"):
        return {"message": message, "status": "success"}

    @staticmethod
    def error(message="An error occurred"):
        return {"message": message, "status": "error"}

    @staticmethod
    def not_found(message="Requested resource not found"):
        return {"message": message, "status": "not_found"}

    @staticmethod
    def unauthorized(message="Unauthorized access"):
        return {"message": message, "status": "unauthorized"}