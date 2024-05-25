import http.server
from Config.config import get_config
from Database.db_handler import DatabaseHandler
import json
import html

class HtmlEditHandler:
    @staticmethod
    def handle(handler , id = None):
        html_template = """
        <!DOCTYPE html>
<html>
  <head>
    <title>Edit</title>
    <link href="emof.css" rel="stylesheet" />
    <link href="style.css" rel="stylesheet" />
    <link rel="icon" href="/admin-forms-microservice/icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>

  <body>
	  <div id="FORM_ID" style="display:none;">{{!@#$}}</div>
    <div class="landing-section-header">
      <header
        id="landing-header-id"
        class="landing-header"
        role="banner"
        itemscope=""
      >
        <div class="landing-header-elements">
          <a href="/admin/" class="logo-link">
            <img alt="" src="/admin-forms-microservice/logo.png" class="logo_landing" />
          </a>
          <nav
            id="landing-header_menu"
            class="landing-header_menu landing-header_menu--microsite"
            aria-label="Navigation"
            data-translated="1"
            itemscope=""
          >
            <ul
              id="menu-landing-header_menu-left"
              class="landing-header_menu-left"
            >
              <li
                id="menu-item-92366"
                class="menu-item menu-item-type-custom menu-item-object-custom menu-item-92366"
              >
                <a><span class="your-formulars">Edit</span></a>
              </li>
              <li id="menu-item-92365"
                class="back-button menu-item menu-item-type-custom menu-item-object-custom menu-item-92365">
                <a href="/admin/" data-tracking-id="sign-up-top-bar" itemprop="url">Back</a>
              </li>
            </ul>
            <ul class="landing-header_menu-right first-in-focus">
              <li class="icon-before-nav">
                <a><span class="menu-item-text">${{{user_name}}}</span></a>
              </li>
              <li class="landing-button logout_button">
                <a id="logout-btn" href="/authentication/logout" itemprop="url">Log out</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </div>

    <div id="container">
      <div id="centered-box" class="centered-box">
        <h2 id="create-title">Edit</h2>
        <div class="image-upload-container">
          <div class="image-preview">
            <img id="preview-image" src="">
            <span id="placeholder-text" class="placeholder-text">Form Image</span>
          </div>
          <label for="image-upload-input" class="image-label">
            <span class="custom-file-input">Choose Picture</span>
          </label>
          <input type="file" id="image-upload-input" class="form-file-input" onchange="previewImage(event)" accept="image/*" />
          <button id="remove-image" class="remove-image-button" onclick="removeImage()">Remove</button>
        </div>
        
        <form id="first-page-form">
          <div class="form-fields">
            <label class="form-label" for="title">Title</label>
            <input
              id="form-name-input"
              class="question-input"
            />
            <label class="form-label" for="title">Description</label>
            <input
              id="form-description-input"
              class="question-input"
            />
            <label class="form-label" for="title">Ending Message</label>
            <input
              id="form-ending-input"
              class="question-input"
            />
            <label class="form-label" for="title">Tags Separated by commas(Optional)</label>
            <input
              id="form-tags-input"
              class="question-input"
            />
          </div>
        </form>
        <button id="add-questions-btn">Add Questions</button>
      </div>

      <div id="questions-container">
        <div id="questions-box">
          <h2 id="questions-title">Questions</h2>
          <label class="question-label" for="question">1.</label>
          <input
            id="first-question"
            class="add-question-input"
          />
        </div>
        <div class="flex-container-centered">
          <button
            id="add-btn"
            class=""
            onclick="addQuestion()"
          >
            Add Question
          </button>
          <button
            id="del-btn"
            class=""
            onclick="deleteQuestion()"
          >
            Delete Question
          </button>
        </div>
        <fieldset id="questions-about-user-info-container">
          <legend>Aspects followed in completing the form:</legend>

          <div id="about-user-1">
            <input type="checkbox" />
            <label for="Age">Age</label>
          </div>

          <div id="about-user-2">
            <input type="checkbox" />
            <label for="Sex">Sex</label>
          </div>

          <div id="about-user-3">
            <input type="checkbox" />
            <label for="Location">Location</label>
          </div>

          <div id="about-user-4">
            <input type="checkbox" />
            <label for="Occupation">Occupation</label>
          </div>

          <div id="about-user-5">
            <input type="checkbox" />
            <label for="Platform">Platform</label>
          </div>

          <div id="about-user-6">
            <input type="checkbox" />
            <label for="Relationship Status">Relationship Status</label>
          </div>
        </fieldset>
        <div class="create-button" >
          <button id="back-button" onclick="back()">Back</button>
          <button id="create-button" onclick="create()">Save</button>
        </div>
      </div>
    </div>
  </body>
  <script src="edit.js"></script>
</html>

        """
        if id is not None:
            user_name = HtmlEditHandler.get_username_from_sid(handler, id)
            if user_name is None:
              handler.send_response(403)
              handler.end_headers()
              return
            html_content = html_template.replace("{{!@#$}}",id)
            html_content = html_content.replace("${{{user_name}}}", html.escape(user_name))
            handler.send_html_response(html_content)
            return
        
        #id is empty
        handler.path = '/Static/error.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(handler)
    
    def get_username_from_sid(self, form_id):
        try:
            content_len = int(self.headers.get('Content-Length'))
        except:
            content_len = 0
        k = self.rfile.read(content_len)
        if k == b'':
            k = "{}"
        bod = json.loads(k)
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

        config = get_config()

        db_config = config['database']        
        db = DatabaseHandler.getInstance(db_config['host'], db_config['dbname'], db_config['user'], db_config['password'],db_config['port'])
        con = db.connection
        cur = con.cursor()

        user_name = None
        con.rollback()
        cur.execute("""SELECT username FROM users u JOIN forms f on f.id_creator = u.id WHERE u.sid = %s AND f.id = %s;""", (str(sid), str(form_id)))
        user_name = cur.fetchall()
        cur.close()

        if len(user_name) != 1:
            print("found no/multiple users with same sid!!", len(user_name), sid)
            return None
        else:
            return user_name[0][0]