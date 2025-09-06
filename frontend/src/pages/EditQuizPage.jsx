import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

import questionTypes from '../data/question_types';
import alphabeth from "../data/alphabeth";
import badWords from '../data/bad_words';

import removeIcon from '../assets/x-icon-white.svg';
import removeIconGrey from '../assets/x-icon-grey.svg';



const EditQuizPage = () => {
    // Variables
    const backendBaseURL = 'http://localhost:8000';
    const initialQuestion = {
        type: 'single',
        text: '',
        question_time_limit: 0,
        question_image: null,
        answers: [
            {
                text: '',
                is_correct: false
            },
            {
                text: '',
                is_correct: true
            }
        ]
    }


    // Params
    const { quizId } = useParams();


    // Navs
    const navigate = useNavigate();


    // Auth
    const { loading, api, isAuthenticated } = useAuth();


    // States
    const [mainErrorAlert, setMainErrorAlert] = useState('');
    const [mainAlert, setMainAlert] = useState('');
    const [errors, setErrors] = useState({});

    const [quiz, setQuiz] = useState({});
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [quizImage, setQuizImage] = useState({});
    const [quizTimeLimit, setQuizTimeLimit] = useState(null);
    const [quizRandomQuestionOrder, setQuizRandomQuestionOrder] = useState(false);
    const [quizRandomAnswersOrder, setQuizRandomAnswersOrder] = useState(false);
    const [tags, setTags] = useState([]);
    const [tag, setTag] = useState('');

    const [questionsMainErrorAlert, setQuestionsMainErrorAlert] = useState('');
    const [questionsMainAlert, setQuestionsMainAlert] = useState('');
    const [questionsErrors, setQuestionsErrors] = useState({});

    const [questionToRemoveId, setQuestionToRemoveId] = useState('');

    const [newQuestion, setNewQuestion] = useState(initialQuestion);


    // Effects

    // Fetch quiz data.
    useEffect(() => {
        if (!loading) {
            fetchQuiz(quizId);
        }
    }, [loading, api]);

    // Update states when quiz fetch successfull.
    useEffect(() => {
        if (quiz) {
            setQuizTitle(quiz.title);
            setQuizDescription(quiz.description);
            setQuizTimeLimit(quiz.quiz_time_limit);
            setQuizRandomQuestionOrder(quiz.random_questions_order);
            setQuizRandomAnswersOrder(quiz.random_answers_order);
            setTags(quiz.tags);
        }

        if (questionToRemoveId) setQuestionToRemoveId('');
    }, [quiz]);

    // Handle question type.
    useEffect(() => {
            // If question is true/false type.
            if (newQuestion.type === 'truefalse') {
                const updatedAnswers = [
                    { text: 'True', is_correct: true },
                    { text: 'False', is_correct: false }
                ];
    
                const updatedQuestion = {
                    ...newQuestion,
                    answers: updatedAnswers,
                };
    
                setNewQuestion(updatedQuestion);
            }
    
            // If question is single choice.
            if (newQuestion.type === 'single') {
                let updatedAnswers = [ ...newQuestion.answers ];
    
                let firstCorrectIndex = updatedAnswers.findIndex(answer => answer.is_correct);
    
                if (firstCorrectIndex === -1) {
                    firstCorrectIndex = 0;
                }
    
                updatedAnswers = updatedAnswers.map((answer, index) => ({
                    ...answer,
                    is_correct: index === firstCorrectIndex
                }));
    
                const updatedQuestion = {
                    ...newQuestion,
                    answers: updatedAnswers,
                };
    
                setNewQuestion(updatedQuestion);
            }
    
            // If question is a multiple choice.
            if (newQuestion.type === 'multiple') {
                const updatedAnswers = newQuestion.answers.map(answer => ({
                    ...answer,
                }));
    
                const updatedQuestion = {
                    ...newQuestion,
                    answers: updatedAnswers,
                };
    
                setNewQuestion(updatedQuestion);
            }
        }, [newQuestion.type]);


    // Functions
    const fetchQuiz = async (id) => {
        try {
            const response = await api.get(`/quiz/${id}`);
            setQuiz(response.data.quiz);
        } catch (error) {
            // console.error('Error fetching quiz:', error.response?.data || error.message);
            setQuiz([]);
            navigate('/user-dashboard/');
        }
    };

    const handleQuizChange = (e) => {
        const {name, value, files} = e.target;

        if (name === 'tags') {
            // When set a tag remove all the special characters appart from hyphen.
            setTag(value.replace(/[^a-zA-Z0-9\- ]/g, ''));
        }

        if (name === 'title') {
            setQuizTitle(value)
        }

        if (name === 'description') {
            setQuizDescription(value)
        }

        if (name === 'question_text') {
            setNewQuestion(prev => ({...prev, text: value}))
        }

        if (name === 'question_time_limit') {
            if (value > 1800) {
                setErrors( prev => ({ ...prev, [name]: 'Question timer can not be longer than 30min. (1800s.).'}));
            } else {
                setNewQuestion(prev => ({...prev, question_time_limit: value}));
            }
        }

        if (name === 'quiz_time_limit') {
            if (value > 18000) {
                setErrors( prev => ({ ...prev, [name]: 'Question timer can not be longer than 300min. (18000s.).'}));
            } else {
                setQuizTimeLimit(value);
            }
        }

        if (name === 'quiz_image') {
            setQuizImage({ ...quizImage, quiz_image: files[0] });
        }

        if (name === 'question_image') {
            setNewQuestion({ ...newQuestion, question_image: files[0] });
        }

        setErrors( prev => ({ ...prev, [name]: null}));
        setMainErrorAlert('');
        setMainAlert('');
    };

    const handleAddTag = (e) => {
        e.preventDefault();

        // Checks if tag already exists in the list before adding.
        if (tags && tags.includes(tag)) {
            setErrors( prev => ({ ...prev, 'tags': 'This tag already exists.' }));

            return;
        }

        // Checks if a tag is not vulgar.
        if (badWords.includes(tag)) {
            setErrors( prev => ({ ...prev, 'tags': 'This tag is inappropriate.' }));

            return;
        }

        if (tag) {
            let tagLowerCase = tag.toLocaleLowerCase();

            // Add tag to the list.
            setTags([...tags, tagLowerCase]);

            // Clean the tag input.
            setTag('');
            e.target.value = '';

            setErrors( prev => ({ ...prev, 'tags': null }));
            setMainErrorAlert('');
            setMainAlert('');
        } else {
            setErrors( prev => ({ ...prev, 'tags': 'Tag can NOT be empty.' }));
        }
    };
    
    const handleRemoveTag = (tag) => {
        setTags(tags.filter((item) => item !== tag));
    };

    const handleQuestionTypeChange = (qType) => {
        setNewQuestion(prev => ({...prev, type: qType}));

        setQuestionsMainErrorAlert('');
        setQuestionsMainAlert('');
        setQuestionsErrors({});
    };

    const handleAnswerChange = (e) => {
        const {name, dataset, value} = e.target;

        if (name === 'answer') {
            const newQuestionCopy = { ...newQuestion };

            newQuestionCopy.answers = [ ...newQuestion.answers ];

            newQuestionCopy.answers[dataset.answerId] = {
                ...newQuestion.answers[dataset.answerId],
                text: value
            };

            setNewQuestion(newQuestionCopy);
        }

        setQuestionsMainErrorAlert('');
        setQuestionsMainAlert('');
        setQuestionsErrors({});
    };

    const handleAnswerCheckboxChange = (e) => {
        const {name, dataset, checked} = e.target;

        if (name === 'correct_answer') {
            if (newQuestion.type === 'multiple') {

                const newQuestionCopy = { ...newQuestion };
                
                newQuestionCopy.answers = [ ...newQuestion.answers ];
                
                newQuestionCopy.answers[dataset.answerId] = {
                    ...newQuestion.answers[dataset.answerId],
                    is_correct: checked
                };
                
                setNewQuestion(newQuestionCopy);
            }

            // If question type is true or false OR one is_correct answers, do not allow to select more than one answer.
            if (newQuestion.type === 'single' || newQuestion.type === 'truefalse') {
                const updatedAnswers = newQuestion.answers.map((answer, index) => ({
                    ...answer,
                    is_correct: index === parseInt(dataset.answerId)
                }));

                const updatedQuestion = {
                    ...newQuestion,
                    answers: updatedAnswers,
                };
            
                setNewQuestion(updatedQuestion);
            }
        }

        setQuestionsMainErrorAlert('');
        setQuestionsMainAlert('');
        setQuestionsErrors({});
    };

    const handleAddAnswer = () => {
        const newBlankAnswer = {
            text: '',
            is_correct: newQuestion.answers.length == 0 ? true : false
        };

        // Add new answer to the array
        const newAnswers = [...newQuestion.answers, newBlankAnswer];

        // Add updated answers array to a new question object.
        const updatedQuestion = {
            ...newQuestion,
            answers: newAnswers
        }

        // Do not allow to create more that 8 answers per question.
        if (updatedQuestion.answers.length <= 8) {
            setNewQuestion(updatedQuestion);
        }

        setQuestionsMainErrorAlert('');
        setQuestionsMainAlert('');
        setQuestionsErrors({});
    };

    const handleRemoveAnswer = (e) => {
        const {dataset} = e.target;

        // A question cant have less than 2 answers. 
        if (newQuestion.answers.length > 2) {

            // Create a copy of answers array excluding the target one.
            const answerIndex = parseInt(dataset.answerId);
            let answersCopy = newQuestion.answers.filter((_, index) => index !== answerIndex);

            // Check if any answer on the list is is_correct.
            const anyCorrectLeft = answersCopy.some(answer => answer.is_correct);

            // If no answers are is_correct, make the first one is_correct.
            if (!anyCorrectLeft && answersCopy.length > 0) {
                answersCopy = answersCopy.map((answer, index) => ({
                    ...answer,
                    is_correct: index === 0
                }));
            }
            
            // Update the object and the state.
            const currentQuestionCopy = {
                ...newQuestion,
                answers: answersCopy
            }
            
            setNewQuestion(currentQuestionCopy);
        }

        setQuestionsMainErrorAlert('');
        setQuestionsMainAlert('');
        setQuestionsErrors({});
    };

    const handleCheckboxChange = (e) => {
        const {name, checked} = e.target;

        if (name === 'random_questions_order') {
            setQuizRandomQuestionOrder(checked);
        }

        if (name === 'random_answers_order') {
            setQuizRandomAnswersOrder(checked);
        }
    };

    const checksWordsInString = (str, wordsArr) => {
        if (str) {
            // Sring to lower case
            let newStr = str.toLowerCase();
            // Remove all the special characters from string
            newStr = newStr.replace(/[^a-zA-Z0-9 ]/g, '');
            // Replace all occurance of more than one space to one space.
            newStr = newStr.replace(/\s+/g, ' ');
            // Trim spaces at the beginig and the end.
            newStr = newStr.trim();
            // String into array of words.
            const newStrArr = newStr.split(' ');
            
            return wordsArr.some(word => newStrArr.includes(word.toLowerCase()));
        }
    };

    const handleRemoveQuestion = (questionId) => {
        if (!questionToRemoveId) {
            setQuestionToRemoveId(questionId);
        } else {
            deleteQuestion(questionId);
        }
    };

    const handleKeepCurrentQuestion = () => {
        if (questionToRemoveId) setQuestionToRemoveId(false);
    };

    const validateGeneralForm = () => {
        let tempErrors = {};

        // Quiz title
        if (quizTitle.length > 250) {
            tempErrors.title = 'Title can NOT be longer than 250 characters';
        }

        if (quizTitle.length < 3) {
            tempErrors.title = 'Title must be at least 3 characters long.';
        }

        if (quizTitle.length <= 250 && quizTitle.length >= 3 && checksWordsInString(quizTitle, badWords)) {
            tempErrors.title = 'Title contains an inappropriate word!';
        }

        if (!quizTitle) tempErrors.title = 'Quiz title is required.'

        // Quiz desription
        if (quizDescription.length > 1000) {
            tempErrors.description = 'Description can NOT be longer than 1000 characters.';
        } else if (checksWordsInString(quizDescription, badWords)) {
            tempErrors.description = 'Description contains an inappropriate word!';
        }

        // Quiz tags
        if (tags.length < 3) {
            tempErrors.tags = 'Please Provide at least 3 tags';
        }

        if (tags.length > 10) {
            tempErrors.tags = 'Maximum 10 tags. Please remove some tags from your list.';
        }

        // Quiz time limit
        if ((quiz?.questions && !quiz?.questions.find(q => q.question_time_limit))) {
            if (!quizTimeLimit || quizTimeLimit < 0  || quizTimeLimit > 18000) {
                setQuizTimeLimit(0);
                tempErrors.quiz_time_limit = 'Quiz time limit must be between 0 and 18000 seconds.';
            }
        }

        if (typeof quizRandomQuestionOrder != "boolean") {
            tempErrors.random_questions_order = 'Quiz random question order must be true or false.';
        }

        if (typeof quizRandomAnswersOrder != "boolean") {
            tempErrors.random_answers_order = 'Quiz random answers order must be true or false.';
        }

        setErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    const handleQuizSubmit = async (e, formName) => {
        e.preventDefault();
        setErrors({});
        setMainAlert('');

        // If form has eny errors.
        if (!validateGeneralForm()) {
            setMainErrorAlert('Please fix the invalid fields.');

            return;
        }

        if (formName === "title" || formName === "description") {
            try {
                const response = await api.patch(`/dashboard/edit-quiz/${quizId}`, {
                    'form_name': formName,
                    'new_value': quizTitle
                });

                if (response) {
                    setMainAlert(`Quiz (${formName}) was updated successfully.`);
                    fetchQuiz(quizId);
                }
            } catch(error) {
                console.error('Error updating quiz:', error.response?.data || error.message);
                setMainErrorAlert(error.response?.data.error);
                setErrors( prev => ({...prev, [formName]: error.response?.data.error}));
            }
        }

        if (formName === 'tags') {
            try {
                const response = await api.patch(`/dashboard/edit-quiz/${quizId}`, {
                    'form_name': formName,
                    'new_value': tags.map(tag => tag.trim().toLowerCase()),
                });

                if (response.data.success) {
                    setMainAlert('Tags updated successfully.');
                    fetchQuiz(quizId);
                } else {
                    setMainErrorAlert(response.data.error);
                    setErrors('Error updating your tags.')
                } 
            } catch (error) {
                console.error('Failed to update tags:', error);
            }
        }

        if (formName === 'quiz_image') {
            const formData = new FormData();

            formData.append("quiz_image", quizImage.quiz_image);

            try {
                // Delete an image if already exists
                if (quiz.quiz_image) {
                    await api.delete(`/dashboard/edit-quiz/${quizId}/delete-image/`);
                }

                // Upload new image
                const response = await api.post(`/dashboard/edit-quiz/${quizId}/upload-image/`, formData);

                if (response.data.success) {
                    setMainAlert("Image updated successfully.");
                    fetchQuiz(quizId);
                } else {
                    setMainErrorAlert(response.data.error);
                }
            } catch (error) {
                console.error("upload-image error:", error.response || error.message);
                setMainErrorAlert("Failed to upload an image.");
            }
        }

        if (formName === 'options') {
            try {
                const response = await api.patch(`/dashboard/edit-quiz/${quizId}`, {
                    'form_name': formName,
                    'quiz_time_limit': quizTimeLimit,
                    'random_questions_order': quizRandomQuestionOrder,
                    'random_answers_order': quizRandomAnswersOrder
                });

                if (response.data.success) {
                    setMainAlert('Quiz options updated successfully.');
                    fetchQuiz(quizId);
                } else {
                    setMainErrorAlert(response.data.error);
                    setErrors('Error updating quiz options.')
                }
            } catch (error) {
                console.error('Failed to update options:', error);
            }
        }
    };

    const validateQuestionsForm = () => {
        let tempErrors = {};

        let typeError = '';
        let textError = '';
        let answerError = '';
        let numberOfAnswersError = '';
        let questionTimerError = '';
        let questionImageError = '';

        // Qestion type.
        if (!['single', 'multiple', 'truefalse'].includes(newQuestion.type)) {
            typeError += `Question's type is not supported.\n`;
        }

        // Question text.
        if (newQuestion.text.length < 3 && newQuestion.text.length >= 1000) {
            textError += `Question must be minimum 3 characters and maximim 1000 characters.\n`;
        }

        if (!newQuestion.text || newQuestion.text === '') {
            textError += `Question must be minimum 3 characters and maximim 1000 characters.\n`;
        }

        if (checksWordsInString(newQuestion.text, badWords)) {
            textError += `Qeustion  contains inappropriate word!\n`;
        }

        // Answers
        newQuestion.answers.forEach((answer, answerIndex) => {
            // Bad words.
            if (checksWordsInString(answer.text, badWords)) {
                answerError += `Answer ${alphabeth[answerIndex].toUpperCase()} in Question contains inappropriate word!\n`;
            }
            // If empty.
            if (answer.text === '' || answer.text === null) {
                answerError += `Answer ${alphabeth[answerIndex].toUpperCase()} in Question is empty.\n`;
            }
        });

        // Number of is_correct answers
        const listOfCorrectAnswers = newQuestion.answers.filter(answer => answer.is_correct);

        if ((newQuestion.type === 'single' || newQuestion.type === 'multiple') && newQuestion.answers.length > 8) {
            numberOfAnswersError += `Question can have maximum 8 answers.\n`;
        }

        if (newQuestion.type === 'truefalse' && newQuestion.answers.length > 2) {
            numberOfAnswersError += `Question can have maximum 2 answers.\n`;
        }

        if (newQuestion.answers.length < 2) {
            numberOfAnswersError += `Question must have a minimum of 2 answers.\n`;
        }

        if ((newQuestion.type === 'single' || newQuestion.type === 'truefalse') && listOfCorrectAnswers.length > 1) {
            numberOfAnswersError += `Question can have only 1 is_correct answer.\n`;
        }

        if (listOfCorrectAnswers.length < 1) {
            numberOfAnswersError += `Question must have at least 1 is_correct answer.\n`;
        }

        // Question Image
        if (newQuestion.question_image && newQuestion.question_image_option) {
            // Get image extantion from the path.
            const imgPath = newQuestion.question_image.name;
            let imgExtention = '';

            if (imgPath) imgExtention = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();
            if (!['jpg', 'jpeg', 'png', 'bmp', 'webp', 'svg', 'gif'].includes(imgExtention)) {
                questionImageError += `Question image is not an acceptable image file.`;
            }
        }

        // Combine all the errors together.
        if (typeError) tempErrors.type = typeError;
        if (textError) tempErrors.text = textError;
        if (answerError) tempErrors.answer = answerError;
        if (numberOfAnswersError) tempErrors.numberOfAnswers = numberOfAnswersError;
        if (questionTimerError) tempErrors.questionTimer = questionTimerError;
        if (questionImageError) tempErrors.questionImage = questionImageError;

        setQuestionsErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    const handleQuestionSubmit = async (e, quizId) => {
        e.preventDefault();

        setQuestionsErrors({});
        setQuestionsMainErrorAlert('');

        if (!validateQuestionsForm()) {
            setQuestionsMainErrorAlert('Please fix all the invalid question inputs.');

            return;
        }

        try {
            const formData = new FormData();

            // Clone and remove image from JSON payload.
            const { question_image, ...questionPayload } = newQuestion;
            formData.append('question_json', JSON.stringify(questionPayload));

            // Add image if exists.
            if (question_image) {
                formData.append('question_image', question_image);
            }

            const response = await api.post(`/dashboard/edit-quiz/${quizId}/add-question/`, 
                formData, 
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                    setQuestionsMainAlert('Question added successfully!');
                    setNewQuestion(initialQuestion);
                    fetchQuiz(quizId);
                }
        } catch (error) {
            console.error("upload-image error:", error.response || error.message);
            setQuestionsMainErrorAlert("Failed to upload an image.");
        }
        
    };

    const deleteQuestion = async (questionId) => {
        try {
            const response = await api.delete(`/dashboard/edit-quiz/delete-question/${questionId}`);

            if (response.data.success) {
                setMainAlert('You deleted a question.');
                fetchQuiz(quizId);
                scrollToTop();
            } else {
                setMainErrorAlert(response.data.error);
                setErrors('Error deleting question.')
            } 
        } catch (error) {
            console.error('Failed to delete question:', error);
        }
    };

    const convertSeconds = (time) => {
        if (time < 60) {
            return `${time}s.`;
        }

        if (time >= 60) {
            const seconds = time % 60;
            const minutes = Math.floor(time / 60);

            if (seconds > 9) {
                return `${minutes}m. ${seconds}s.`;
            } else {
                return `${minutes}m. 0${seconds}s.`;
            }
        }

        if (time >= 3600) {
            const seconds = time % 60;
            const minutes = Math.floor(time / 60);
            const hours = Math.floor(minutes / 60);

            return `${hours}h. ${minutes}m. ${seconds}s.`;
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    // Render
    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        navigate('/login'); 

        return null;
    }
    
    return (
        <section className="edit-quiz">
            <h1>Edit quiz</h1>
            <>
                {mainErrorAlert && 
                    <div className='form-main-alert'>
                        <p className='bold'>Please fix all the issues.</p>
                        <ul>
                        { 
                            Object.entries(errors).map(([key, value]) => (
                                <li key={key}>{value}</li>
                            ))
                        }
                        </ul>
                    </div>
                }
                {mainAlert && 
                    <div className='form-main-alert--success'>
                        <p className='bold'>{ mainAlert }</p>
                    </div>
                }
            </>
            <section className="edit-quiz-general">
                <h2>{ quiz.title }</h2>
                <div className="edit-quiz-general__quiz-image">
                    <h3>Quiz Image</h3>
                    { (quiz?.quiz_image_url && !quizImage?.quiz_image) && (
                        <img 
                            className="edit-quiz-general__quiz-image__image "
                            src={ `${backendBaseURL}${quiz.quiz_image_url}` } 
                            alt={ quiz?.title } 
                        />
                    )}
                    {quizImage?.quiz_image instanceof Blob && (
                        <img 
                            className="edit-quiz-general__quiz-image__image"
                            src={URL.createObjectURL(quizImage.quiz_image)} 
                            alt={ quiz?.title } 
                        />
                    )}
                    <form 
                        noValidate 
                        onSubmit={ (e) => handleQuizSubmit(e, "quiz_image") }
                        className="form"
                    >
                        <div className='form-input--file-container'>
                            <p className='form-input--file__label'>Choose New Quiz Image</p>
                            <div className='form-input--file button--small--sky-dark'>
                                <label htmlFor='quiz_image'>Browse</label>
                                <input
                                    className='button--small--sky-dark'
                                    type='file'
                                    id='quiz_image'
                                    name='quiz_image'
                                    accept='image/*'
                                    onChange={ handleQuizChange }
                                    />
                            </div>
                            {quizImage.quiz_image &&
                                <p>{ quizImage.quiz_image.name }</p>
                            }
                            {errors.quiz_image && <p style={{ color: 'red' }}>{errors.quiz_image}</p>}
                        </div>
                        {quizImage.quiz_image && (
                            <input 
                                className="button--medium--fuchsia-dark"
                                type="submit" 
                                value="Submit New Quiz Image" 
                            />
                        )}
                    </form>
                </div>

                <hr className='divider' />

                <form noValidate className="form" onSubmit={ (e) => handleQuizSubmit(e, "title") }>
                    <div className="form-input">
                        <label htmlFor="title" className="form-input__label">Quiz title</label>
                        <input 
                            className="form-input__input"
                            type="text" 
                            name='title'
                            maxLength='250'
                            id='title'
                            value={ quizTitle ?? '' }
                            onChange={ handleQuizChange }
                        />
                        {errors?.title && (
                            <p className='form-input__hint--invalid'>{ errors.title }</p>
                        )}
                    </div>
                    <input 
                        className="button--medium--fuchsia-dark"
                        type="submit"
                        value="Submit Title Changes"
                    />
                </form>

                <hr className='divider' />

                <form noValidate className="form" onSubmit={ (e) => handleQuizSubmit(e, "description") }>
                    <div className="form-input">
                        <label htmlFor="description" className="form-input__label">Quiz description</label>
                        <textarea 
                            className="form-input__textarea"
                            type="text" 
                            name='description'
                            maxLength='1000'
                            id='description'
                            value={ quizDescription ?? '' }
                            onChange={ handleQuizChange }
                        />
                    </div>
                    <input 
                        className="button--medium--fuchsia-dark"
                        type="submit"
                        value="Submit Description Changes"
                    />
                </form>

                <hr className='divider' />

                <form noValidate className="form" onSubmit={ (e) => handleQuizSubmit(e, "tags") }>
                    <div className='form-input--add-container'>
                        <label className='form-input--add-container__label' htmlFor="tags">Add Tag</label>
                        <div className='form-input--add-container__input-container'>
                            <input 
                                className='form-input--add-container__input'
                                id="tags"
                                name='tags'
                                value={ tag ?? '' }
                                onChange={ handleQuizChange }
                            />
                            <button 
                                type='button'
                                className='button--small--sky-dark form-input--add-container__input__button'
                                onClick={ handleAddTag }
                            >
                                Add
                            </button>
                        </div>
                        {errors?.tags && (
                            <p className='form-input__hint--invalid'>{ errors.tags }</p>
                        )}
                        {tags?.length > 0 && (
                            <div className='form-input--add-container__tags-container'>
                                <p className='form-input--add-container__label'>Tags:</p>
                                    <div className='form-input--add-container__tags'>
                                        {tags.map((tag, index) => (
                                            <button 
                                            type='button'
                                            key={`tag-${index}`} 
                                            className='form-input--add-container__tags__tag'
                                            onClick={ () => handleRemoveTag(tag) }
                                            >
                                                <p>{tag}</p>
                                                <img src={ removeIcon } alt="remove" />
                                            </button>
                                        ))}
                                    </div>
                                <p className='form-input__hint'>Press a tag to remove it from the list.</p>
                            </div>
                        )}
                    </div>
                    <input 
                        className="button--medium--fuchsia-dark"
                        type="submit" 
                        value="Submit Tags Changes" 
                    />
                </form>
                
                <hr className='divider' />

                <div className="edit-quiz__options">
                    <h2>Options</h2>
                    <form noValidate className="form" onSubmit={ (e) => handleQuizSubmit(e, "options") }>
                        { (quiz?.questions && !quiz?.questions.find(q => q.question_time_limit)) && (
                            <div className="form-input">
                                <label htmlFor="quiz_time_limit" className="form-input__label">Quiz time limit (in seconds)</label>
                                <input 
                                    className="form-input__input"
                                    type="number" 
                                    name='quiz_time_limit'
                                    min="0"
                                    max="18000"
                                    id='quiz_time_limit'
                                    value={ quizTimeLimit ?? 0 }
                                    onChange={ handleQuizChange }
                                />
                                    {errors?.quiz_time_limit && (
                                        <p className='form-input__hint--invalid'>{ errors.quiz_time_limit }</p>
                                    )}
                                <p className='form-input__hint'>If you do not want a time limit, set it's value to 0 (zero).</p>
                            </div>
                        )}
                        <div className='form-input--checkbox'>
                            <label className='switch-button'>
                                <input 
                                    type="checkbox" 
                                    checked={ quizRandomQuestionOrder ?? false }
                                    name="random_questions_order" 
                                    id="random_questions_order"
                                    onChange={ handleCheckboxChange }
                                />
                                <span className='slider'></span>
                            </label>
                            <p className='form-input--checkbox__label'>Questions Random Order</p>
                        </div>

                        <div className='form-input--checkbox'>
                            <label className='switch-button'>
                                <input 
                                    type="checkbox" 
                                    checked={ quizRandomAnswersOrder ?? false }
                                    name="random_answers_order" 
                                    id="random_answers_order"
                                    onChange={ handleCheckboxChange }
                                />
                                <span className='slider'></span>
                            </label>
                            <p className='form-input--checkbox__label'>Answers Random Order</p>
                        </div>
                        <input 
                            className="button--medium--fuchsia-dark"
                            type="submit"
                            value="Submit Option Changes"
                        />
                    </form>
                </div>
            </section>

            <hr className='divider' />

            <section className="edit-quiz__questions">
                <h2>Questions & answers</h2>
                {quiz.questions && (
                    <>
                        {quiz.questions.map((q, i) => {
                            return (
                                <section 
                                    className="edit-quiz__question-section"
                                    key={`question-${i + 1}`}
                                >
                                    <h3>{`${i + 1}. ${q.text}`}</h3>
                                    {q.question_image_url && (
                                        <img 
                                            className="edit-quiz__question-section__image"
                                            src={`${backendBaseURL}${q.question_image_url}`} 
                                            alt={ newQuestion?.text } 
                                        />
                                    )}
                                    {!q.question_image_url && (
                                        <hr className="divider--blue--no-margin"/>
                                    )}

                                    <div className="edit-quiz__question-section__answers">
                                        {q.answers.map((a, j) => {
                                            return (
                                                <p 
                                                    key={`answer-${j + 1}`}
                                                    className="edit-quiz__question-section__answers__answer"
                                                >
                                                    <span>{ alphabeth[j].toUpperCase() }.</span>
                                                    { a.text }
                                                </p>
                                            )
                                        })}
                                    </div>

                                    <hr className="divider--blue--no-margin"/>
                                    
                                    <div className="edit-quiz__question-section__options">
                                        <p>{`Question type: ${questionTypes.find(question => question.name === q.type)?.text}`}</p>

                                        { (!quiz?.quiz_time_limit && q.question_time_limit) && (
                                            <p>{`Timer: ${convertSeconds(q.question_time_limit)}`}</p>
                                        ) }
                                    </div>

                                    { (!questionToRemoveId) && (
                                        <button
                                            className="edit-quiz__question-section__delete-question button--medium--rose-dark"
                                            type="button"
                                            onClick={ () => handleRemoveQuestion(q.id) }
                                        >Delete Question
                                        </button>
                                    )}
                                    { (questionToRemoveId && questionToRemoveId === q.id) && (
                                        <div className='edit-quiz__question__remove-question-alert'>
                                            <h4>Are you sure you want to remove this question? This action can NOT be undone.</h4>
                                            <div className='edit-quiz__question__remove-question-alert__buttons'>
                                                <button 
                                                    type='button' 
                                                    className='button--medium--rose-dark'
                                                    onClick={ () => handleRemoveQuestion(questionToRemoveId) }
                                                >
                                                    Remove
                                                </button>
                                                <button 
                                                    type='button' 
                                                    className='button--medium--emerald-light'
                                                    onClick={ handleKeepCurrentQuestion }
                                                >
                                                    Keep it
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )
                        })}
                    </>
                )}
            </section>

            <hr className='divider' />

            <section className="edit-quiz__add-question">
                <h2>Add new question</h2>
                {questionsMainAlert && 
                    <div className='form-main-alert--success'>
                        <p className='bold'>{ questionsMainAlert }</p>
                    </div>
                }
                {questionsMainErrorAlert && 
                    <div className='form-main-alert'>
                        <p className='bold'>{ questionsMainErrorAlert }</p>
                        <ul>
                        { 
                            Object.entries(questionsErrors).map(([key, value]) => (
                                <li key={key}>{value}</li>
                            ))
                        }
                        </ul>
                    </div>
                }
                {newQuestion.question_image && (
                    <img 
                        className="edit-quiz__add-question__quiz-image__image"
                        src={URL.createObjectURL(newQuestion.question_image)} 
                        alt={ newQuestion?.text } 
                    />
                )}
                <form noValidate className="form" onSubmit={ (e) => handleQuestionSubmit(e, quizId) }>
                    <div className='form-input--file-container'>
                        <p className='form-input--file__label'>Choose Question Image</p>
                        <div className='form-input--file button--small--sky-dark'>
                            <label htmlFor='question_image'>Browse</label>
                            <input
                                className='button--small--sky-dark'
                                type='file'
                                id='question_image'
                                name='question_image'
                                accept='image/*'
                                onChange={ handleQuizChange }
                                />
                        </div>
                        {newQuestion.question_image &&
                            <p>{ newQuestion.question_image.name }</p>
                        }
                        {errors.question_image && <p style={{ color: 'red' }}>{errors.question_image}</p>}
                    </div>
                    
                    <hr className='divider' />

                    <div className="form-input">
                        <label htmlFor="question_text" className="form-input__label">Question text</label>
                        <input 
                            className="form-input__input"
                            type="text" 
                            name='question_text'
                            maxLength='250'
                            id='question_text'
                            value={ newQuestion.text ?? '' }
                            onChange={ handleQuizChange }
                        />
                        {errors?.question_text && (
                            <p className='form-input__hint--invalid'>{ errors.question_text }</p>
                        )}
                    </div>
                    { !quiz?.quiz_time_limit && (
                        <div className="form-input">
                            <label htmlFor="question_time_limit" className="form-input__label">Question time limit (in seconds)</label>
                            <input 
                                className="form-input__input"
                                type="number" 
                                name='question_time_limit'
                                min="0"
                                max="1800"
                                id='question_time_limit'
                                value={ newQuestion.question_time_limit ?? '' }
                                onChange={ handleQuizChange }
                            />
                            {errors?.question_time_limit && (
                                <p className='form-input__hint--invalid'>{ errors.question_time_limit }</p>
                            )}
                            <p className='form-input__hint'>If you do not want a time limit, set it's value to 0 (zero).</p>
                        </div>
                    )}
                    
                    <hr className='divider' />

                    <div className="edit-quiz__add-question__question-type-buttons">
                        { questionTypes.map((qt, index) => {
                            return (
                                <button
                                    key={`button-type-${qt.name}`}
                                    className={newQuestion.type === qt.name ? "button--small--sky-dark" : "button--small--sky-light"}
                                    type="button"
                                    onClick={ () => handleQuestionTypeChange(qt.name) }
                                >{qt.text}
                                </button>
                            )
                        }) }
                    </div>
                    {newQuestion.answers.map((answer, index) => {
                        const answerLabel = `answer_${alphabeth[index]}`;
                        return (
                            <div className='form-answer-container' key={`answer-${index}`}>
                                {newQuestion.type !== 'truefalse' && (
                                    <div className='form-input'>
                                        <label className='form-input__label' htmlFor={answerLabel}>{`Answer ${alphabeth[index].toUpperCase()}`}</label>
                                        <input 
                                            data-answer-id={index}
                                            className='form-input__input' 
                                            type='text'
                                            name="answer"
                                            maxLength='1000'
                                            id={answerLabel}
                                            value={ newQuestion.answers[index].text }
                                            onChange={ handleAnswerChange }
                                            placeholder='Your answer'
                                        />
                                    </div>
                                )}
                                {newQuestion.type === 'truefalse' && (
                                    <div className='form-input'>
                                        <input 
                                            data-answer-id={index}
                                            className='form-input__input--true-false' 
                                            type='text'
                                            defaultValue={ index === 0 ? true : false}
                                        />
                                    </div>
                                )}
                                <div className='form-answer-buttons-container'>
                                    <label className='switch-button'>
                                        <input 
                                            type="checkbox" 
                                            data-answer-id={index}
                                            checked={ newQuestion.answers[index] ? newQuestion.answers[index].is_correct : false }
                                            name="correct_answer" 
                                            onChange={ handleAnswerCheckboxChange }
                                        />
                                        <span className='switch-checkbox'>Correct</span>
                                    </label>
                                    <button 
                                        type='button'
                                        data-answer-id={index}
                                        className={`${newQuestion.answers.length > 2 ? 'button--small--rose-dark' : 'button--small--inactive'} form-answer-buttons--remove`}
                                        onClick={ newQuestion.answers.length > 2 ? handleRemoveAnswer : () => {return} }
                                    >
                                        <img src={ newQuestion.answers.length > 2 ? removeIcon : removeIconGrey } alt="Remove answer" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {questionsErrors.text && (
                        <p className='form-input__hint--invalid'>{ questionsErrors.answer }</p>
                    )}
                    {(newQuestion.answers.length < 8 && newQuestion.type !== 'truefalse')&& (
                        <button
                            className='form__add-answer-button'
                            type='button'
                            onClick={ handleAddAnswer }
                        >
                            <p className='form__add-answer-button__text'>Add answer</p>
                            <p className='form__add-answer-button__symbol'>+</p>
                        </button>
                    )}

                    <hr className='divider' />

                    <input 
                        className="button--large--fuchsia-dark"
                        type="submit" 
                        value="Submit New Question" 
                    />
                </form>
            </section>
        </section>
    );
};



export default EditQuizPage;
