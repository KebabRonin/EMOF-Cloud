import http.server
from Config.config import get_config
from Database.db_handler import DatabaseHandler
def form_exists(f_id):
    config = get_config()

    db_config = config['database']
    db = DatabaseHandler.getInstance(db_config['host'], db_config['dbname'], db_config['user'], db_config['password'],db_config['port'])

    # Selectați formularul corespunzător din baza de date
    query = "SELECT * FROM public.forms WHERE id = %s"
    form = db.fetch_query(query, (f_id,))
    if len(form) > 0:
        return True
    return False

class HtmlHandler:
    @staticmethod
    def handle(handler , id = None):
        html_template = """<!DOCTYPE html>
<html>

<head>
	<title>Complete Form</title>
    <link href="style.css" rel="stylesheet" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body>
	<div id="ID">{{!@#$}}</div>
	<div id="container">
		<div id="content">
            <h2 id="create-title"></h2>
			<div id="question">  </div>
        	<div id="image-container">
                <img id="form-image" src="">
            </div>
            <div id="description-box">
                <label class="form-label">Description:</label>
                <p id="description"></p>
            </div>
            <div id="user-info-container">
                <legend>To analyze the statistics at the time of closing the form, the creator requested the following information. <br> If you don't want to fill them in, you can skip them.</legend>
            </div>
			<div id="answer-container" class="">
				<div id="wheel-container"> <canvas id="wheel-canvas"></canvas> </div>
				<div>
					<div id="howyoufeel-form-container">
                        
						<form id="howyoufeel-form"> 
                        <div id="howyoufeel-header2" class="flex-container-centered drop-shadow-effect" style="display: flex;"> Express yourself in words
						</div>
                        <textarea
						id="howyoufeel-textarea" class="flex-container-centered drop-shadow-effect"></textarea> </form>
					</div>
					<div id="howyoufeel-container" class="rounded-div drop-shadow-effect">
						<div id="howyoufeel-header" class="flex-container-centered drop-shadow-effect"> What you feel
						</div>
						<div id="howyoufeel-tags-container"></div>
					</div>
				</div>
			</div>
			<div id="next-btn" class="rounded-div" onclick="proceedToQuestions()"> <a>Next</a> </div>
			<div id="back-explore" class="rounded-div"> <button onclick="location.href='/explore';" id="back-explore-button"> Back to Explore </button>
			</div>
            <div id="butoane">
                <button id="back-btn" class="rounded-div" onclick="back()">Back</button>
                <button id="next-button" class="rounded-div" onclick="nextPage()">Next</button>
            </div>
        </div>
	</div>
    <script src="script.js"></script>
</body>

</html>"""
        
        
        if id is not None:
            if form_exists(id):
                html_content = html_template.replace("{{!@#$}}",id)
                handler.send_html_response(html_content)
                return
        
        #id is empty
        handler.send_response(400)
        handler.end_headers()
        return