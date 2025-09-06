# Quizify

## Video Demo: [Quizify Video Demo](https://youtu.be/S40Xl-xi8mY)

## Description

Quizify is a full-stack, fully responsive web app which allows users to create and submit quizzes. Page visitors can search for the quizzes they are interested in and take a challenge to answer all the questions. Registered users can create quizzes, keep track of the quizzes they anticipate, see stats of the quizzes they created, edit their own quizzes, comment or rate quizzes, and more.

## Design

Quizify is designed pleasantly and straightforwardly, which helps users focus on the content and its functionality. The main pages are in pale colours, ranging from sky blue to grey, with a varied accent colour when specific content requires more attention, such as buttons, alerts, or essential parts of the quiz or quiz form. The fully responsive design is optimised for every mobile device, as well as large-screen laptops and desktops. When using the web app on wide screens, the page content is centred in the middle of the screen.

The UI design was created using Figma, and a link to the graphic project is available below.

[Quizify design in Figma](https://www.figma.com/design/M4zPR4cNQOBDQwFEIt9KBU/Quizify?node-id=48-925&t=dj1vPayZvme6PQ9g-1)

## Technologies

### Back-End

* Django
* Venv - Virtual Environment

### Database

* PostgreSQL - Django Modules

### Front-End

* React (JavaScript)
* JSX
* SASS (CSS)

### Software

* Figma
* Photoshop
* Illustrator
* Visual Studio Code

---

## Distinctiveness and Complexity

Quizify is a web application with a complex architecture, and it's significantly larger than the other projects I developed during the CS50W course. The design, although not mandatory, provides users with a clean interface and a simple experience when interacting with the app.

I developed the front-end of the application using ReactJS, a JavaScript framework. The course did not cover the practical knowledge of React. However, I took my previous experience in front-end development and combined it with what I had newly learned about Django and Python. I utilised built-in React hooks to manage the complexity of the app's front end. I used useContext to manage the state at the top level of the application, and thanks to this hook, I could manage user authentication and authorisation without repeating code. UseState and UseEffect were used in almost every component to handle fetching data on component load, hold variables that need to change often during user interactions, and update specific states when others change. The React Router library is a handy tool for managing page routing in the front-end. I used useRef to handle the correct position of the navigation when the display style was set to absolute in a specific screen size situation.

The back-end of the application remained in Django, utilising its built-in features without any additional tools like DRF or Serializer. I have created eight models to manage the SQL tables, some of which include one-to-many and many-to-many fields. Quiz, Question, and Profile models contain image fields that are processed to save, update, and delete images using custom-made functions. Physical image files are stored in a dedicated dictionary, and those files are removed when a specific quiz, question, or profile is deleted from the database. I used Django Signals to ensure the image file does not exist when a particular delete change occurs in the database. I used CSRF tokens through cookies and sessions to authenticate the user. A function in view that creates a quiz, handles complex data creation from nested objects sent from the front-end.

---

## Files Structure

The app's root directory contains three main sub-directories: backend, frontend and venv. Most of the changes were made in the frontend directory. The venv directory remained untouched during the development process.

### Back-end

#### backend/backend

The main Django project app folder. It contains default files, and only settings.py and urls.py had some changes.

##### backend/backend/setting.py

In settings.py, I used the "Path" class from the "pathlib" library to build a base URL for saved media files, quizzes, questions, and avatar images. In the "middleware" list, I added a few elements to handle the CORS headers, CSRF tokens and sessions. The database was changed from default SQLite to PostgreSQL. At the bottom of the file, I included a few options to manage CORS integration with the front-end.

##### backend/backend/urls.py

In urls.py, I added an API path to the Quizify app URLs and added a condition to serve media files during development.

#### backend/media

The media directory contains three sub-directories: avatars, question_images, and quiz_images, to store image files.

#### backend/quizify

The Quizify directory is where the entire back-end process for the app takes place.

##### backend/quizify/admin.py

The admin.py file helps display columns and rows of the database tables in Django's default GUI. The structure is straightforward, and it shows all the populated fields from every Model.

##### backend/quizify/filters.py

The filters.py contains two lists: BAD_WORDS and RESTRICTED_WORDS. I later use those lists to validate the data that the user submits and ensure that no vulgar language or words that could be misleading to other users are used, and then saved in the database.

##### backend/quizify/models.py

The models.py file contains eight models: Profile, Quiz, Question, Answer, Tag, QuizRating, QuizScore, and Comment. The profile holds additional information about the user, such as their country of origin, avatar image, and more. QuizScore stores information about every quiz the user has completed. The most important is the number of correct answers per quiz, which is divided by the total number of quiz questions. I use this information later to calculate the average accuracy of users when taking a quiz. Profile, Quiz and Question models have a functionality to save image files in the media directory after successful creation.

##### backend/quizify/signals.py

The signals.py file contains three functions for each Model with an image field. Those functions make sure that the media file is deleted when data is removed from the database.

##### backend/quizify/urls.py

The urls.py file contains all the paths to the requests sent from the front-end and handled by the functions located in the views.py file.

##### backend/quizify/utils.py

The utils.py file contains a custom-made resize_and_rename_image function, which is called the Model during the creation. This function opens an image from an instance, resizes it based on the image size parameter, renames it and saves it in the WebP format. The other three functions in this file are used to create a naming convention for quiz, question and avatar images. They are later passed to the resize_and_rename_image as an argument. For example, if the quiz ID is 7 and the question ID is 3, the question image file will be named: quiz_7_question_3_27042025.webp, where the last digits represent the current date.

##### backend/quizify/views.py

The views.py file handles all front-end requests and manages all CRUD operations. It contains additional custom-made validation functions, for example, to ensure a username contains only lowercase letters and digits, or the password validation that ensures the user's password is strong and secure. The views.py file also contains two functions that are created to check if the user's username or email is valid. This works in real-time on user input on the front-end. The most complex function is the view, which creates a new quiz. This view takes care of saving nested data and operates on many Models.

### Front-end

#### frontend

The frontend directory contains three subdirectories: node_modules, public, and src, as well as a package.json file. The main changes are in the src folder, and I will mainly focus on what is inside it.

#### frontend/src/assets

The assets directory contains all the image files used to design the app, such as icons and background images that are unlikely to change.

##### frontend/src/components/CreateQuizGeneralStep.jsx

The CreateQuizGeneralStep component is a child component of the CreateQuizPage. It is the first step in creating a new quiz. Here, the user defines the quiz title, description, chooses the category, adds tags, uploads the quiz front image file, and selects some additional options, such as randomising the order of questions and answers. The user can also set up a quiz timer. The quiz timer can not be set if any of the questions have their own timer. After submission, the component sends data to its parent state and triggers the parent's function to display the next subpage.

##### frontend/src/components/CreateQuizQuestionsStep.jsx

The CreateQuizQuestionsStep component is a child component of the CreateQuizPage. It is the second step in creating a new quiz. Here, the user adds questions and answers. The previous data, sent by the CreateQuizGeneralStep component, is passed back with an additional array of objects to populate the questions. The user chooses the type of question from the list: Single-Choice, Multiple-Choice, or True or False. Depending on the type of question, the functionality of adding the answers will change. If the question type is True or False, only two answers will be available: True and False. The user can choose which one is correct. In this case, the "Add Answer" button will not be visible. The user can not remove any question. If the type of question is Single-Choice, the user can add up to eight answers, and only one can be correct. By default, the first answer is always selected as correct. If a user wants to change the correct answer to another one, the current one will be automatically unselected. The minimum number of answers per question is two for every type. If the question type is Multiple-Choice, the front-end behaves similarly to the Single-Choice type, with the difference that the user can freely choose between one or more correct answers. Every question comes with two options: a question timer and a question image. The question timer can not be set if the quiz timer is defined. When the user presses the 'Create Next Question' button, the current question and answers are validated and saved in a component's state. When creating a new question, the CreateQuizQuestionsStep is rerendered with navigation to every question created so far. When the user goes to the summary step or goes back to the general step, all the created questions are sent to the parent component and saved.

##### frontend/src/components/CreateQuizSummaryStep.jsx

The CreateQuizSummaryQuestionsStep component is a child component of the CreateQuizPage. It is the third step in creating a new quiz. Here, the user reviews the quiz, questions and answers. Every section has an edit button that allows you to go back and make changes. If the user clicks on the edit button on a specific question, it will render the CreateQuizQuestionsStep and navigate to this question. When the user clicks the "Submit Quiz" button, the parent component will validate the entire quiz and post the data to the back-end on successful validation.

##### frontend/src/components/CreateQuizSuccessStep.jsx

The CreateQuizSummaryQuestionsStep component is a child component of the CreateQuizPage. It is rendered after a successful response from the back-end when submitting the quiz. This component contains three links to create another quiz, redirect to the user dashboard, or redirect to the home page.

##### frontend/src/components/DashboardAccount.jsx

The DashboardAccount component is a child component of the DashboardPage. Here, the user can update their profile information. The component fetches and renders when the user creates an account and when they log in for the last time. Updating information is managed by two separate forms: the first form for all string-based data and the second form for avatar image updates. On submission, the data is validated, and if validation succeeds, the API request is sent. On the first render, user data is fetched from the database, so the form inputs are populated with current information.

##### frontend/src/components/DashboardDeleteAccount.jsx

The DashboardDeleteAccount component is a child component of the DashboardPage. Here, the user can delete the account. To do this, the user must fill out a single input form with a password confirmation field. When submitting the deletion, an alert with a question appears to confirm that the user is sure to delete the account. After the confirmation, the user's data is posted to the back-end and validated to ensure that the provided password is correct.

##### frontend/src/components/DashboardPassword.jsx

The DashboardPassword component is a child component of the DashboardPage. Here, the user updates their password. The component contains a form with three inputs: a confirmation of the current password, a new password, and a re-entry of the new password. On submission, data is validated and posted to the back-end.

##### frontend/src/components/TakenQuizzes.jsx

The TakenQuizzes component is a child component of the DashboardPage. This component gets a list of quizzes the user has ever taken. The component displays the information about how many quizzes the user has taken and the total number of times they have taken all the quizzes. Every quiz displays a simple statistic and a button that redirects the user to the corresponding quiz. The list of quizzes can be sorted and filtered. Depending on the number of displayed quizzes, the pagination will appear at the bottom of the page.

##### frontend/src/components/YourQuizzes.jsx

The YourQuizzes component is a child component of the DashboardPage. This component gets a list of quizzes the user has ever created. The component displays information about the total number of created quizzes, the total number of times all those quizzes have been taken, and the average rating of all the quizzes. Every quiz displays a simple statistic and a button that redirects the user to the corresponding quiz, redirects to EditQuizPage or deletes the quiz. The list of quizzes can be sorted and filtered. Depending on the number of displayed quizzes, the pagination will appear at the bottom of the page. When submitting the deletion, an alert with a question pops up to confirm that the user is sure to delete the quiz.

##### frontend/src/components/Footer.jsx

The footer is a simple, reusable component with a set of links to other pages. Navigation is handled using the NavLink elements from the React Router library.

##### frontend/src/components/Layout.jsx

The layout component is a default wrapper for every app page. It makes sure that every page is rendered with a navigation, a footer and the main content between those two.

##### frontend/src/components/Navbar.jsx

Navbar component renders the top navigation visible on every page. The navbar component retrieves data from the AuthContext file and checks if the user is logged in (authenticated) and if the user has an associated avatar image. If the user is authenticated, the register and login buttons will change to a user avatar button with a link to the user's dashboard, and a logout button next to it. On mobile devices, navigation will render with a different UI than on large screens. On mobile devices, the navigation is a pop-up that appears right at the bottom of the navbar. To handle this design, I used useRef to know the bottom position of the navbar. A pop-up navigation will close automatically when the screen size is resized to a large size.

##### frontend/src/components/Pagination.jsx

Pagination is a reusable component that handles pagination on the list of quizzes across the app. In the front-end, it receives the data from the parent component and displays the buttons that make new API calls from the parent component. All the pagination logic is handled in the back-end.

##### frontend/src/components/QuizFrontPage.jsx

The QuizFrontPage is a child component of the QuizPage. It receives all the data about the quiz from the parent component and displays it. It is designed to show the user all the information about the quiz before they can start it. The QuizFrontPage component handles the comments GET and POST API requests. If the user is authenticated, they can write and post a comment. Otherwise, the component will render a section with information that only logged-in users can leave a comment on.

##### frontend/src/components/QuizSummary.jsx

The QuizSummary is a child component of the QuizPage. It receives all the data about the quiz from the parent component and compares the correct answers to the questions. On the first render, the QuizSummary component posts quiz score data and increases the number of times the quiz was taken. It provides an option where the user can rate the quiz on a scale of 1 to 5 using the star buttons. A quiz can be rated only once per user. The QuizSummary component provides navigation with question numbers, highlighting green when the answer is correct or red when it is wrong. When the user clicks on the number button, they can review the quiz question and the answers they selected.

##### frontend/src/components/QuizTakeQuiz.jsx

QuizTakeQuiz is a child component of the QuizPage. This component runs the quiz that the user takes. Component renders the number of questions and starts an interval to count down the quiz or the question time. The user can go to the next question only if one of the answers is selected. If the quiz has a countdown and the user does not answer every question, all remaining questions will be saved with empty answers, which will be marked as incorrect. If the question countdown goes to zero, the next question is rendered. When submitting the last question or when the time runs out, the component sends the answers to the parent component, which will compare the answers.

##### frontend/src/components/QuizTile.jsx

QuizTile is a reusable component used to display a list of quizzes to users. It received data from any parent component it is nested in. This component renders a tile with a quiz image, or no image element, quiz title, quiz description if provided, quiz rating if it exists, and a button link which takes the user to the front page of the actual quiz.

##### frontend/src/context/AuthContex.jsx

AuthContext.jsx component handles the user data and passes it to the root component using the context hook. It takes care of the user authorisation. The AuthContext component retrieves the CSRF token upon opening the web app and manages user authentication, which is then passed to other components from the root component. Inside this component, the app handles login, logout, registration, and fetches the loading time.

#### frontend/src/css

The CSS directory holds the main CSS file converted from Sass.

#### frontend/src/data

The data directory contains files with JavaScript arrays that store information needed during client-side validation or essential to display the user's UI correctly. For example, bad_words.js holds a JavaScript array of strings of inappropriate words. When a user tries to submit a form, the front end checks the input to ensure it doesn't contain any bad words and sends an error if it does.

#### frontend/src/pages

The pages directory contains the website's main pages, which in many cases are parent components.

##### frontend/src/pages/CreateQuizPage.jsx

The CreateQuizPage is a parent component that handles quiz creation. This component stores the whole form data, which is partially updated by the child components. CreateQuizPage has a renderStep function with a switch statement to render the appropriate UI. When the quiz is submitted, the CreateQuizPage handles the final form validation and posts the API request to the back-end.

##### frontend/src/pages/DashboardPage.jsx

The DashboardPage component is a parent component that handles the rendering of the user dashboard page. DashboardPage has a renderPage function with a switch statement to render the appropriate UI. DashboardPage by default renders the user's avatar, username and the dashboard navigation. When a user clicks on a button inside the navigation, DashboardPage renders the chosen child component.

##### frontend/src/pages/EditQuizPage.jsx

EditQuizPage provide user with a set of forms to update the quiz the have created. The component retrieves all quiz data from the database. All the general information about the quiz is handled in separate forms, and the request is posted with one value at a time. Under the general quiz info forms, EditQuizPage render all the questions and their answers. Those can only be deleted. The user can add a new question to the quiz at the bottom of the page.

##### frontend/src/pages/HomePage.jsx

HomePage component renders the landing page of the website. It holds the search form at the top, which redirects to the QuizListPage with a populated search parameter. HomePage, on the first render, fetches the nine most popular quizzes and displays them to the user. For the aesthetics, nine titles are only visible for mid-sized mobile devices, where tiles are displayed in three rows. The other small and large screen devices display eight quiz tiles.

##### frontend/src/pages/LoginPage.jsx

LoginPage component renders the login form. The login API request is handled using a context hook from AuthContext.jsx.

##### frontend/src/pages/LogoutPage.jsx

LogoutPage component does not render any content. It triggers the logopu API request using a context hook from AuthContext.jsx.

##### frontend/src/pages/Pricing.jsx

Pricing component is a temporary dummy page.

##### frontend/src/pages/QuizList.jsx

The QuizListPage component renders the quiz search results. It retrieves data, such as search, sort, filter, and page number, from the URL's parameters. If, for example, the search parameter value is empty, the component will render all the available quizzes. The QuizListPage search form includes a header with the search phrase and displays how many quizzes match the search value. If any quizzes are available, the sort and filter buttons are available. Pagination appears if the result has more than twelve quizzes. Quizzes can be filtered by year of creation or by category. QuizListPage, on the first render, fetches the list of types of categories that are included in the quizzes that match the search parameter value.

##### frontend/src/pages/RegisterPage.jsx

The RegisterPage component renders the user registration form. The username and email inputs receive requests from the database upon input change, displaying real-time information on the availability of the username and email.

#### frontend/src/styles

The styles directory includes the Sass styles, which are organised by abstract, base, components, layout and pages.

#### frontend/src/utils

##### frontend/src/utilities/arrayRandomOrder.jsx

The arrayRandomOrder file contains a function that shuffles the array items based on the Fisher-Yates Method.

##### frontend/src/utilities/compareTwoObjects.jsx

The compareTwoObjects file contains a custom-made function called areObjectsDeeplyEqual. This function compares two objects and returns true if they are equal. This function is mainly used to compare user inputs when creating a quiz.

##### frontend/src/App.jsx

The App is in the root component of the application. Using the React Router Dom, we manage the routing logic and the front-end URLs of the entire project. Routes are wrapped into AuthProvider, an AuthContext component which takes care of the CSRF cookies and the user authentication.
