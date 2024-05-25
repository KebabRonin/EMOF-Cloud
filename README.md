# Software Requirements Specification
## For  EMOF
Prepared by Brassat Alexandru, Cojocaru George, Popa Stefan, Rusu Vlad

Link-ul videoclipului: https://youtu.be/FASqCQmM0mc

Table of Contents
=================
  * [Introduction](#1-introduction)
    * 1.4 [Product Scope](#14-product-scope)
  * [Overall Description](#overall-description)
    * 2.1 [Product Perspective](#21-product-perspective)
    * 2.2 [Product Functions](#22-product-functions)
    * 2.3 [User Classes and Characteristics](#23-user-classes-and-characteristics)
    * 2.4 [Operating Environment](#24-operating-environment)
  * [External Interface Requirements](#external-interface-requirements)
    * 3.1 [User Interfaces](#31-user-interfaces)
    * 3.3 [Software Interfaces](#33-software-interfaces)
  * [System Features](#system-features)
    * 4.1 [Filling out the form](#41-filling-out-the-form)
    * 4.2 [Creating a form](#42-creating-a-form)
    * 4.3 [Editing a form](#43-editing-a-form)
    * 4.4 [Viewing form statistics](#44-viewing-form-statistics)
    * 4.5 [Viewing  Created Forms](#45-viewing-created-forms)
    * 4.6 [Explore Forms](#46-explore-forms)
  * [Other Nonfunctional Requirements](#other-nonfunctional-requirements)
    * 5.3 [Security Requirements](#53-security-requirements)


## 1. Introduction
### 1.4 Product Scope
A Web application that allows logged in users to create feedback forms for a certain "thing" (event, person, geographic place, product, service, artistic artifact, etc.) and view statistics about the responses. The responses are collected in an anonymous manner from users who do not need to have accounts.
## Overall Description
### 2.1 Product Perspective
Our app is based on microservices, thus being both flexible and scalable.

![C1 diagram](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/C1.png?raw=true)

![C2 diagram](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/C2.png?raw=true)

![C3 diagram](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/C3.png?raw=true)
### 2.2 Product Functions
Some major functionalities of the application are the creation of accounts for users, the creation and completion of forms and the visualization in an attractive way of the statistics generated based on the completion of forms.
### 2.3 User Classes and Characteristics
Anonymous users who can only fill out forms and users who have a created account and can create forms.
### 2.4 Operating Environment
Frontend was build using HTML, CSS and JAVASCRIPT and the backend server was implemented in Python.
## External Interface Requirements
### 3.1 User Interfaces
Landing Page:
![Landing](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/landing.png?raw=true)
Sign up:
![Sign up](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/signup.png?raw=true)
Log in:
![Log in](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/login.png?raw=true)
View Forms:
![View Forms](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/admin.png?raw=true)
Explore Forms:
![Explore Forms](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/explore.png?raw=true)
Create Form:
![Create Form](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/create_form_1.png?raw=true)
![Create Form](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/create_form_2.png?raw=true)
Complete Form:
![Complete Form](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/take_form_1.png?raw=true)
![Complete Form](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/take_form_2.png?raw=true)
View Statistics:
![View Statistics](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/statistics_1.png?raw=true)
![View Statistics](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/statistics_2.png?raw=true)

### 3.3 Software Interfaces
PostgreSQL for Database to keep user accounts, forms and their resposes.
## System Features
![sitemap diagram](https://github.com/AlexD29/EMOF-WEB-Project/blob/main/README-pictures/sitemap.png?raw=true)
### 4.1 Filling out the form
#### 4.1.1 Description
The user fills in the form using the Plutchick wheel and/or expressing himself in his own words.
#### 4.1.2 Stimulus/Response Sequences
The user can use the dedicated Start, Next, Finish and Back buttons to navigate through the form. The user answers the questions by clicking on the corresponding emotions on the wheel or by entering actual phrases in the "Write what you think" section.
If you have changed your mind about the emotion chosen for a certain question, you can deselect it by clicking again on the emotion that wants to be deleted from the list.
You can see the emotions already selected in the "What you feel" section. At the end of the form, a "Back to Explore" button will appear, which when pressed will redirect the user to the list of public forms .
#### 4.1.3 Functional Requirements
The user will not be able to submit the form if he has not answered at least one question. An answer to the question is valid if at least one emotion is chosen on the wheel.

### 4.2 Creating a form
#### 4.2.1 Description
The LOGGED IN user can create a form.
#### 4.2.2 Stimulus/Response Sequences
Fields such as name, tags and questions can be filled in. To create a field for a question, press the "Add Question" button. To delete a field for a question, press the "Delete Question" button. After completing the form, press the "Done" button. When pressed, a check will be made for each field and if all meet the requirements then the form will be created, otherwise a notification will appear telling you which field was wrong. Another field that can be chosen is a set of questions meant to understand the user better (this information is also used to generate relevant statistics based on age, marital status etc.).
#### 4.2.3 Functional Requirements
The form is valid and can be sent if it meets the following conditions : the name of the form and body of the questions must the specified character limits, there should be at least one question in the form and a maximum of 15 questions. If the "Done" button has been pressed and the form has been validated, a notification will appear saying that the form has been created and will redirect you to the forms page that the user can manage.

### 4.3 Editing a form
#### 4.3.1 Description
The LOGGED IN user can edit a form that he created.
#### 4.2.2 Stimulus/Response Sequences
The interaction is the same as the "Creating a form" page, but the difference is that the already existing data of the form will be automatically loaded into the fields, and the user can change them at will, respecting the requirements of each field.
#### 4.3.3 Functional Requirements
Same as [4.2.3](#423-functional-requirements)

### 4.4 Viewing form statistics
#### 4.4.1 Description
The LOGGED IN user can view the statistics of an own form.
#### 4.4.2 Stimulus/Response Sequences
The quiz owner will be able to see the statistics in the form of a list of "interesting things". The algorithm will present some interesting statistics, which accounts for user groups, negative/positive emotions and time of form completion. Different appropriate representations of the data will be displayed.
The user will be able to export the statistics in HTML, CSV or JSON format.
#### 4.4.3 Functional Requirements
The user must be logged in.

### 4.5 Viewing Created Forms
#### 4.5.1 Description
The User will be able to view their drafts, published or closed forms.
#### 4.5.2 Stimulus/Response Sequences
The User will interact with the "admin" page, which will list all of their forms. Those can be grouped in the three categories mentioned above, and can be sorted by category by using a series of buttons on the left side of the page. For all forms, the user will be able to perform certain actions (such as edit, publish, close, view statistics, delete), according to the state the forms are in (draft, active, closed).
#### 4.5.3 Functional Requirements
The user must be logged in to view their forms.

### 4.6 Explore Forms
#### 4.6.1 Description
All users (anonymous or not) will be able to participate in public forms made by other users. The forms will be grouped by multiple criteria.
#### 4.6.2 Stimulus/Response Sequences
The User will browse the page and, when a certain form catches their attention, will be able to join the form.
#### 4.6.3 Functional Requirements
In order for this page to be functional, it requires a number of public forms. In the case when there are none, an informative message will be shown.

### 4.7 Sign Up
#### 4.7.1 Description
Any user has the option to create an account, but it's not mandatory as the user can use the app and explore forms without an account. Creating an account allows the user to acces other features like Creating forms or Viewing Statistics about his completed forms.
#### 4.7.2 Stimulus/Response Sequences
If he wants to have permission to the features mentioned before, the user can easily and fast create an account by pressing the button 'Sign up' on the Landing page. He will be asked to enter an email address, an username and a password and then he will be redirected directly to his admin page, giving him acces to the features.
#### 4.7.3 Functional Requirements
To be able to access the 'Sign up' option, the user must not already be connected to an account in the application first and then must enter a valid email address and a username and a password of at least 8 characters.

### 4.8 Log in - Log out
#### 4.8.1 Description
If the user has created an account in the application, he will always be able to access it through the 'Log in' feature. It will also be possible to disconnect from the account using the 'Log out' option.
#### 4.8.2 Stimulus/Response Sequences
Every time the user wants to access his created account, he will be able to do it easily by entering either the username or the email. The data entered by him will be retained to keep him connected all the time to his account until he logs out.
#### 4.8.3 Functional Requirements
To be able to acces the 'Log in' and 'Log out' features, the user should first create an account using the 'Sign up' feature.

## Other Nonfunctional Requirements
### 5.3 Security Requirements
By escaping and verifying user input, we want to prevent the most common attacks such as cross-site scripting, SQL injection.

We check user session ids and data access rights in order to prevent bypassing authorisation and view other users data.

We also verify session ids for every request and delay error messages in order to prevent bruteforce attacks.

The database stores encrypted passwords in order to prevent password stealing.
## Future Enhancements
### 6.0 Natural Language Processing Microservice
A planned future enhancement for our application is the development of a Natural Language Processing (NLP) microservice. This microservice will use various techniques to analyze text and predict the emotions contained within. The NLP microservice will take a string of text as input and return a prediction of the associated emotion as output. This may involve the emotions such as 'joy', 'fear', 'sadness', 'anger', 'surprise', 'disgust', etc.
### 6.1 Mailing Microservice
An upcoming enhancement that we're planning to add to our system is a mailing microservice. This microservice will be responsible for all email-related functionalities, including sending notifications, account activation instructions, password recovery instructions, and user updates.
### 6.2 IP - Session Mapping using Redis on the Gateway
We are planning to add an IP - Session mapping feature using Redis on our Gateway service. This will enhance the security and performance of our system by efficiently managing user sessions and controlling the rate of requests.

## Cloud services used
### 1. Azure
#### 1. App Service
Provides reliable hosting for the application.
#### 2. PostgreSQL Database
Efficient storage for large amounts of data. - Used to store user accounts, created forms, form responses.
#### 3. Redis cache
Reduces the time required to identify the user session.
#### 4. Email Communication Service
Alerts the maintainance team if the application goes down so that the problems can be repaired in the shortest time.
### 2. Google Cloud
#### 1. Google SDK
Used for deploying and configuring the Google Cloud environment.
#### 2. Cloud Function / Cloud run
Written using NodeJS, provides OpenAI API integration which is used for processing textual input in order to identify the emotions which the user wants to express.

## Customer Benefits
1. Ease of Participation: Customers can provide feedback without the hassle of creating an account, making the process quick and straightforward.
2. Anonymity: The assurance of anonymity encourages honest and candid feedback, allowing customers to express their true feelings without fear of repercussions.
3. Enhanced Service and Product Improvements: By sharing emotional feedback, customers contribute to tangible improvements in products and services they use, leading to better overall experiences.
4. User-Friendly Interface: The application is designed to be intuitive and easy to use, ensuring customers can effortlessly provide their input.

## Other existing solutions
1. Typeform: This is known for its user-friendly interface and interactive feedback forms. It allows users to create customized forms with various question types.
2. Google Forms: This is a web-based application for creating surveys, quizzes, and data collection forms.

## Business Canva
![image](https://github.com/AlexD29/EMOF-WEB-Project/assets/38299145/11c76d74-27cc-4029-b619-b142785f11ee)
