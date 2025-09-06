import React, { useEffect, useState } from 'react';

import questionTypes from '../data/question_types';
import alphabeth from '../data/alphabeth';
import badWords from '../data/bad_words';

import removeIcon from '../assets/x-icon-white.svg';
import removeIconGrey from '../assets/x-icon-grey.svg';

import areObjectsDeeplyEqual from '../utilities/compareTwoObjects';



const CreateQuizQuestionsStep = ({ formData, setFormData, nextStep, handleNextStep, handleCurrentStep, editQuestionIndex }) => {
    // Variables
    const blankQuestion = {
        type: 'single',
        text: '',
        question_timer: false,
        question_image_option: false,
        question_time_limit: null,
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


    // States
    const [questions, setQuestions] = useState(formData.questions);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(blankQuestion);

    const [questionsMainErrorAlert, setQuestionsMainErrorAlert] = useState('');
    const [questionsErrors, setQuestionsErrors] = useState({});

    const [questionTimerMinutes, setQuestionTimerMinutes] = useState(30);
    const [questionTimerSeconds, setQuestionTimerSeconds] = useState(0);

    const [submitQuestion, setSubmitQuestion] = useState(false);

    const [removeQuestionAlert, setRemoveQuestionAlert] = useState(false);


    // Effects

    // Add blank question if questions array is empty
    useEffect(() => {
        if (questions.length === 0 || !questions.length) {
            // Set blank question
            setCurrentQuestion(blankQuestion);

            // Set current question index to 0 (first question)
            setCurrentQuestionIndex(0);
        } else {
            // Set current question to the latest added.
            setCurrentQuestion(questions[questions.length - 1]);

            // Set current question index to the latest added.
            setCurrentQuestionIndex(questions.length - 1);
        }
    }, []);

    useEffect(() => {
        // Compare values in current displayed question and same question stored in formData
        if (areObjectsDeeplyEqual(currentQuestion, questions[currentQuestionIndex])) {
            setSubmitQuestion(true);
        } else {
            setSubmitQuestion(false);
        }

        // When any changes occur in current question, remove the Remove Question Alert.
        handleKeepCurrentQuestion();
    }, [currentQuestion]);

    useEffect(() => {
        // If question is true/false type.
        if (currentQuestion.type === 'truefalse') {
            const updatedAnswers = [
                { text: 'True', is_correct: true },
                { text: 'False', is_correct: false }
            ];

            const updatedQuestion = {
                ...currentQuestion,
                answers: updatedAnswers,
            };

            setCurrentQuestion(updatedQuestion);
        }

        // If question is single choice.
        if (currentQuestion.type === 'single') {
            let updatedAnswers = [ ...currentQuestion.answers ];

            let firstCorrectIndex = updatedAnswers.findIndex(answer => answer.is_correct);

            if (firstCorrectIndex === -1) {
                firstCorrectIndex = 0;
            }

            updatedAnswers = updatedAnswers.map((answer, index) => ({
                ...answer,
                is_correct: index === firstCorrectIndex
            }));

            const updatedQuestion = {
                ...currentQuestion,
                answers: updatedAnswers,
            };

            setCurrentQuestion(updatedQuestion);
        }

        // If question is a multiple choice.
        if (currentQuestion.type === 'multiple') {
            const updatedAnswers = currentQuestion.answers.map(answer => ({
                ...answer,
            }));

            const updatedQuestion = {
                ...currentQuestion,
                answers: updatedAnswers,
            };

            setCurrentQuestion(updatedQuestion);
        }
    }, [currentQuestion.type]);

    //  Reset question timer values to zero, when timer is off.
    useEffect(() => {
        if (!currentQuestion.question_timer) {
            setQuestionTimerMinutes(0);
            setQuestionTimerSeconds(0);
            setCurrentQuestion({ ...currentQuestion, 'question_time_limit': null });
        }
    }, [currentQuestion.question_timer]);

    //  Reset question image values to zero, when chekcbox is off.
    useEffect(() => {
        if (!currentQuestion.question_image_option) {
            setCurrentQuestion({ ...currentQuestion, 'question_image': null });
        }
    }, [currentQuestion.question_image_option]);
    
    // Set quiz time limit on minutes and seconds input change.
    useEffect(() => {
        let questionTimeLimit = parseInt(questionTimerSeconds) + (parseInt(questionTimerMinutes) * 60);
    
        if (questionTimerSeconds > 59 || questionTimerSeconds < 0) {
            setQuestionTimerSeconds(0);
        }
    
        if (questionTimerMinutes > 30 || questionTimeLimit > 1800) {
            setQuestionTimerMinutes(30);
            setQuestionTimerSeconds(0);
        }
    
        if (questionTimerMinutes < 0) {
            setQuestionTimerMinutes(0);
            setQuestionTimerSeconds(0);
        }
    
        if (questionTimeLimit) {
            setCurrentQuestion({ ...currentQuestion, 'question_time_limit': questionTimeLimit });
        } else {
            setCurrentQuestion({ ...currentQuestion, 'question_time_limit': null });
        }
    
    }, [questionTimerSeconds, questionTimerMinutes]);
    
    // Set a quiz time limit from parent state when first time render.
    useEffect(() => {
        let minutes;
        let seconds;

        if (questions[currentQuestionIndex]) {
            minutes = Math.trunc(questions[currentQuestionIndex].question_time_limit / 60);
            seconds = questions[currentQuestionIndex].question_time_limit % 60;
        }

        if (minutes) setQuestionTimerMinutes(minutes);
        if (seconds) setQuestionTimerSeconds(seconds);
    }, [currentQuestionIndex]);

    // Update current Question when current question index changes.
    useEffect(() => {
        if (currentQuestionIndex !== null && questions[currentQuestionIndex]) {
            setCurrentQuestion(questions[currentQuestionIndex]);
        } else {
            setCurrentQuestion(blankQuestion)
        }
    }, [currentQuestionIndex, questions]);

    useEffect(() => {
        if (editQuestionIndex || editQuestionIndex === 0) {
            setCurrentQuestionIndex(editQuestionIndex);
        }
    }, []);

    // Handle next step form.
    useEffect(() => {
        if (nextStep && nextStep !== "questions") {
            submitQuestionsForm();
        }
    }, [nextStep]);


    // Functions

    // Scroll to the top of the page when mobile nav is opened.
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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

    const handleQuestionsNav = (e) => {
        const dataset = e.target.dataset;
        const questionId = parseInt(dataset.questionId, 10);

        if (questionId >= 0 && questionId < questions.length) {
            setCurrentQuestionIndex(questionId);
        }

    };

    const handleQuestionsChange = (e) => {
        const {name, value, files} = e.target;

        if (name === 'question_image') {
            setCurrentQuestion({ ...currentQuestion, question_image: files[0] });
        } else {
            setCurrentQuestion({ ...currentQuestion, [name]: value });
        }

        setQuestionsErrors( prev => ({ ...prev, [name]: null}));
        setQuestionsMainErrorAlert('');
    };

    const handleAnswerChange = (e) => {
        const {name, dataset, value} = e.target;

        if (name === 'answer') {
            const currentQuestionCopy = { ...currentQuestion };

            currentQuestionCopy.answers = [ ...currentQuestion.answers ];

            currentQuestionCopy.answers[dataset.answerId] = {
                ...currentQuestion.answers[dataset.answerId],
                text: value
            };

            setCurrentQuestion(currentQuestionCopy);
        }
    };

    const handleAnswerCheckboxChange = (e) => {
        const {name, dataset, checked} = e.target;

        if (name === 'correct_answer') {
            if (currentQuestion.type === 'multiple') {

                const currentQuestionCopy = { ...currentQuestion };
                
                currentQuestionCopy.answers = [ ...currentQuestion.answers ];
                
                currentQuestionCopy.answers[dataset.answerId] = {
                    ...currentQuestion.answers[dataset.answerId],
                    is_correct: checked
                };
                
                setCurrentQuestion(currentQuestionCopy);
            }

            // If question type is true or false OR one is_correct answers, do not allow to select more than one answer.
            if (currentQuestion.type === 'single' || currentQuestion.type === 'truefalse') {
                const updatedAnswers = currentQuestion.answers.map((answer, index) => ({
                    ...answer,
                    is_correct: index === parseInt(dataset.answerId)
                }));

                const updatedQuestion = {
                    ...currentQuestion,
                    answers: updatedAnswers,
                };
            
                setCurrentQuestion(updatedQuestion);
            }
        }
    };

    const handleAddAnswer = () => {
        const newBlankAnswer = {
            text: '',
            is_correct: currentQuestion.answers.length == 0 ? true : false
        };

        // Add new answer to the array
        const newAnswers = [...currentQuestion.answers, newBlankAnswer];

        // Add updated answers array to a new question object.
        const newQuestion = {
            ...currentQuestion,
            answers: newAnswers
        }

        // Do not allow to create more that 8 answers per question.
        if (newQuestion.answers.length <= 8) {
            setCurrentQuestion(newQuestion);
        }
    };

    const handleRemoveAnswer = (e) => {
        const {dataset} = e.target;

        // A question cant have less than 2 answers. 
        if (currentQuestion.answers.length > 2) {

            // Create a copy of answers array excluding the target one.
            const answerIndex = parseInt(dataset.answerId);
            let answersCopy = currentQuestion.answers.filter((_, index) => index !== answerIndex);

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
                ...currentQuestion,
                answers: answersCopy
            }
            
            setCurrentQuestion(currentQuestionCopy);
        }
    };

    const handleCheckboxChange = (e) => {
        const {name, checked} = e.target;

        if (name === 'question_timer') {
            if (!formData.quiz_time_limit && formData.quiz_time_limit === null) {
                setCurrentQuestion({ ...currentQuestion, [name]: checked });
            }
        }

        if (name === 'question_image_option') {
            setCurrentQuestion({ ...currentQuestion, [name]: checked });
        }
    };

    const handleQuestionTimerChange = (e) => {
        const {name, value} = e.target;

        if (name === 'question_timer_minutes') {
            setQuestionTimerMinutes(value);
        }

        if (name === 'question_timer_seconds') {
            setQuestionTimerSeconds(value);
        }
    };

    const handleQuestionTimerFocus = (e) => {
        const {name, value} = e.target;

        if (name === 'question_timer_minutes' && (!value || value == 0)) {
            setQuestionTimerMinutes(0);
        }

        if (e.target.name === 'question_timer_seconds' && (!value || value == 0)) {
            setQuestionTimerSeconds(0);
        }
    };

    const handleQuestionTimerBlur = (e) => {
        const {name, value} = e.target;

        if (name === 'question_timer_minutes' && value === '') {
            setQuestionTimerMinutes(0);
        }

        if (name === 'question_timer_seconds' && value === '') {
            setQuestionTimerSeconds(0);
        }
    };

    const validateCurrentQuestion = () => {
        let tempErrors = {};

        // Question
        if (currentQuestion.text.length < 3 && currentQuestion.text.length >= 1000) {
            tempErrors.text = 'Question must be minimum 3 characters and maximim 1000 characters.';
        }

        if (!currentQuestion.text || currentQuestion.text === '') {
            tempErrors.text = 'Question must be minimum 3 characters and maximim 1000 characters.';
        }

        if (checksWordsInString(currentQuestion.text, badWords)) {
            tempErrors.text = 'Your question contains inappropriate word!';
        }

        // Answers
        currentQuestion.answers.forEach((answer, index) => {
            // Bad words.
            if (checksWordsInString(answer.text, badWords)) {
                tempErrors.answer = `Answer ${alphabeth[index].toUpperCase()} contains inappropriate word!`;
            }

            // If empty.
            if (answer.text === '' || answer.text === null) {
                tempErrors.answer = `Answer ${alphabeth[index].toUpperCase()} can NOT be empty. Please fill the answer or remove it form the list.`;
            }
        });

        // Number of is_correct answers
        const listOfCorrectAnswers = currentQuestion.answers.filter(answer => answer.is_correct);

        if ((currentQuestion.type === 'single' || currentQuestion.type === 'multiple') && currentQuestion.answers.length > 8) {
            tempErrors.answer = 'This type of question can have maximum 8 answers.';
        }

        if (currentQuestion.type === 'truefalse' && currentQuestion.answers.length > 2) {
            tempErrors.answer = 'This type of question can have maximum 2 answers.';
        }

        if (currentQuestion.answers.length < 2) {
            tempErrors.answer = 'A question must have a minimum of 2 answers.';
        }

        if ((currentQuestion.type === 'single' || currentQuestion.type === 'truefalse') && listOfCorrectAnswers.length > 1) {
            tempErrors.answer = 'This type of question can have only 1 is_correct answer.';
        }

        if (listOfCorrectAnswers.length < 1) {
            tempErrors.answer = 'A question must have at least 1 is_correct answer';
        }

        // Question Timer
        if (currentQuestion.question_time_limit) {
            let minutes = parseInt(questionTimerMinutes);
            let seconds =  parseInt(questionTimerSeconds);

            if (seconds + (minutes * 60) > 1800) {
                tempErrors.question_timer = 'Question time can NOT be longer than 30 minutes.';
            }
        }

        if (formData.quiz_time_limit && formData.quiz_time_limit > 0 && currentQuestion.question_time_limit) {
            tempErrors.question_timer = 'You can NOT add timer to a question if the quiz has already a time limit. To add time limit to the questions, disable the time limit for the quiz, in General Settings.';
        }
        

        setQuestionsErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmitCurrentQuestion = () => {
        setQuestionsErrors({});
        setQuestionsMainErrorAlert('');

        if (!validateCurrentQuestion()) {
            setQuestionsMainErrorAlert('Please fix the invalid fields.');

            // Scroll to the top, to the main avlert.
            scrollToTop();

            return;
        }

        // Copy of current question.
        let questionToSave = { ...currentQuestion }

        // If options are true but the values are empty, reset the options.
        // Question Timer
        if (!questionToSave.question_time_limit && questionToSave.question_timer) {
            questionToSave.question_timer = false;
        }
        
        // Question Image
        if (!questionToSave.question_image && questionToSave.question_image_option) {
            questionToSave.question_image_option = false;
        }

        // Update existing question
        if (questions[currentQuestionIndex] && currentQuestionIndex !== null) {
            setQuestions((prevQuestions) => 
                prevQuestions.map((question, index) => 
                    index === currentQuestionIndex ?
                    { ...question, ...questionToSave } :
                    question
                )
            );
        }
        // Add question 
        else if (currentQuestionIndex === questions.length) {
            setQuestions([...questions, currentQuestion]);
        }
    };

    const handleCreateQuestion = () => {
        if (!questionsMainErrorAlert) {
            // Create a new blank question.
            setQuestions([...questions, blankQuestion]);

            // Update the current index, switch to the new created question.
            setCurrentQuestionIndex(questions.length);
        }
    };

    const handleRemoveCurrentQuestion = () => {
        if (!removeQuestionAlert) {
            setRemoveQuestionAlert(true);
        } else {
            const questionsCopy = [...questions];
            let updatedQuestions = questionsCopy.filter((_, index) => index !== currentQuestionIndex);
            
            setQuestions(updatedQuestions);

            // When remove the question, navigate to the prrevious availible,...
            if ((currentQuestionIndex === questions.length - 1) && questions.length > 1) {
                setCurrentQuestionIndex(prevCurrentQuestionIndex => prevCurrentQuestionIndex - 1);
            } 

            // ...next availible if removed was the first...
            if (currentQuestionIndex === 0 && questions.length > 1) {
                setCurrentQuestionIndex(prevCurrentQuestionIndex => prevCurrentQuestionIndex);
            } 

            // Clean Error alerts.
            setQuestionsErrors({});
            setQuestionsMainErrorAlert('');
        }
    };

    const handleKeepCurrentQuestion = () => {
        if (removeQuestionAlert) setRemoveQuestionAlert(false);
    };

    // FINAL VALIDATION - Validate all the questions
    const validateQuestionsForm = () => {
        let tempErrors = {};

        let typeError = '';
        let textError = '';
        let answerError = '';
        let numberOfAnswersError = '';
        let questionTimerError = '';
        let questionImageError = '';

        questions.forEach((question, index) => {
            // Qestion type.
            if (!['single', 'multiple', 'truefalse'].includes(question.type)) {
                typeError += `Question's ${index + 1} type is not supported.\n`;
            }

            // Question text.
            if (question.text.length < 3 && question.text.length >= 1000) {
                textError += `Question ${index + 1} must be minimum 3 characters and maximim 1000 characters.\n`;
            }

            if (!question.text || question.text === '') {
                textError += `Question ${index + 1} must be minimum 3 characters and maximim 1000 characters.\n`;
            }

            if (checksWordsInString(question.text, badWords)) {
                textError += `Qeustion ${index + 1} contains inappropriate word!\n`;
            }

            // Answers
            question.answers.forEach((answer, answerIndex) => {
                // Bad words.
                if (checksWordsInString(answer.text, badWords)) {
                    answerError += `Answer ${alphabeth[answerIndex].toUpperCase()} in Question ${index + 1} contains inappropriate word!\n`;
                }

                // If empty.
                if (answer.text === '' || answer.text === null) {
                    answerError += `Answer ${alphabeth[answerIndex].toUpperCase()} in Question ${index + 1} is empty.\n`;
                }
            });

            // Number of is_correct answers
            const listOfCorrectAnswers = question.answers.filter(answer => answer.is_correct);

            if ((question.type === 'single' || question.type === 'multiple') && question.answers.length > 8) {
                numberOfAnswersError += `Question ${index + 1} can have maximum 8 answers.\n`;
            }

            if (question.type === 'truefalse' && question.answers.length > 2) {
                numberOfAnswersError += `Question ${index + 1} can have maximum 2 answers.\n`;
            }

            if (question.answers.length < 2) {
                numberOfAnswersError += `Question ${index + 1} must have a minimum of 2 answers.\n`;
            }

            if ((question.type === 'single' || question.type === 'truefalse') && listOfCorrectAnswers.length > 1) {
                numberOfAnswersError += `Question ${index + 1} can have only 1 is_correct answer.\n`;
            }

            if (listOfCorrectAnswers.length < 1) {
                numberOfAnswersError += `Question ${index + 1} must have at least 1 is_correct answer.\n`;
            }

            // Question Timer
            if (question.question_time_limit && question.question_time_limit > 1800) {
                questionTimerError += `Question ${index + 1} time can NOT be longer than 30 minutes.\n`;
            }

            // Question Image
            if (question.question_image && question.question_image_option) {
                // Get image extantion from the path.
                const imgPath = question.question_image.name;
                let imgExtention = '';

                if (imgPath) imgExtention = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();

                if (!['jpg', 'jpeg', 'png', 'bmp', 'webp', 'svg', 'gif'].includes(imgExtention)) {
                    questionImageError += `Question ${index + 1} image is not an acceptable image file.`;
                }
            }
        });

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

    const submitQuestionsForm = () => {
        setQuestionsErrors({});
        setQuestionsMainErrorAlert('');

        if (!validateQuestionsForm()) {
            setQuestionsMainErrorAlert('Please fix all the invalid question inputs.');

            // Scroll to the top, to the main avlert.
            scrollToTop();

            return;
        }

        // Add questions to data
        if (formData.questions !== questions) {
            setFormData( prev => ({ ...prev, 'questions': questions }));
        }

        // Set next form step.
        handleCurrentStep(nextStep);
        // Reset next step state.
        handleNextStep(null);
    };


    // Render
    return (
        <div className='form'>
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
            <h2 className='header-2-sm'>Questions</h2>
            <nav className='questions-nav'>
                {
                  questions && Array.isArray(questions) && questions.map((question, index) => {
                        return (
                            <button 
                                type='button'
                                key={`question-${index}`}
                                data-question-id={index}
                                className={ currentQuestionIndex == index ? 'index-button--neutral--active' : 'index-button--neutral' }
                                onClick={ handleQuestionsNav }
                            >
                                { index + 1 }
                            </button>
                        )
                    })
                }
                {(currentQuestion && (questions.length === 0 || !questions.length)) && (
                    <button 
                    type='button'
                    key={`question-${questions.length}`}
                    data-question-id={questions.length}
                    className={ currentQuestionIndex == (questions.length) ? 'index-button--neutral--active' : 'index-button--neutral' }
                    onClick={ handleQuestionsNav }
                    >
                        { questions.length + 1 }
                    </button>
                )}
            </nav>

            <hr className='divider' />

            <div className='form-input'>
                <label className='form-input__label' htmlFor='type'>Question Type <span className='required-star'>*</span></label>
                <select 
                    className='form-input__select' 
                    id="type"
                    name='type'
                    value={ currentQuestion.type ? currentQuestion.type : 'single' }
                    onChange={ handleQuestionsChange }
                    required
                >
                    {questionTypes.map((type) => (
                        <option 
                            key={type.name} 
                            value={type.name}
                        >
                            {type.text}
                        </option>
                    ))}
                </select>
                {questionsErrors.question_type && (
                    <p className='form-input__hint--invalid'>{ questionsErrors.question_type }</p>
                )}
            </div>
            
            <hr className='divider' />

            <h3 className='header-3-sm'>Options</h3>

            <div className='form-input--checkbox'>
                <label className='switch-button'>
                    <input 
                        type="checkbox" 
                        checked={ currentQuestion.question_timer ? currentQuestion.question_timer : false }
                        name="question_timer" 
                        id="question_timer"
                        onChange={ handleCheckboxChange }
                    />
                    <span className='slider'></span>
                </label>
                <p className='form-input--checkbox__label'>Question Timer</p>
            </div>

            { (currentQuestion && currentQuestion.question_timer) && (
                <div className='form'>
                    <div className='form-input'>
                        <label className='form-input__label' htmlFor='question_timer_minutes'>Minutes</label>
                        <input 
                            className='form-input__input' 
                            type='number'
                            min='0'
                            max='299'
                            name='question_timer_minutes'
                            id='question_timer_minutes'
                            value={ questionTimerMinutes }
                            onChange={ handleQuestionTimerChange }
                            onFocus={ handleQuestionTimerFocus }
                            onBlur={ handleQuestionTimerBlur }
                        />
                    </div>
                    <div className='form-input'>
                        <label className='form-input__label' htmlFor='question_timer_seconds'>Seconds</label>
                        <input 
                            className='form-input__input' 
                            type='number'
                            min='0'
                            max='59'
                            name='question_timer_seconds'
                            id='question_timer_seconds'
                            value={ questionTimerSeconds }
                            onChange={ handleQuestionTimerChange }
                            onFocus={ handleQuestionTimerFocus }
                            onBlur={ handleQuestionTimerBlur }
                        />
                        <p className='form-input__hint'>Question time can be maximum 30 minutes.</p>
                        {questionsErrors.question_timer && (
                            <p className='form-input__hint--invalid'>{ questionsErrors.question_timer }</p>
                        )}
                    </div>
                </div>
            )}

            {(formData.quiz_time_limit && formData.quiz_time_limit > 0) && (
                <p className='create-question__quiz-timer-hint form-input__hint'>You can NOT add timer to a question if the quiz has already a time limit. To add time limit to the questions, disable the time limit for the quiz, in General Settings.</p>
            )}

            <div className='form-input--checkbox'>
                <label className='switch-button'>
                    <input 
                        type="checkbox" 
                        checked={ currentQuestion.question_image_option ? currentQuestion.question_image_option : false }
                        name="question_image_option" 
                        id="question_image_option"
                        onChange={ handleCheckboxChange }
                    />
                    <span className='slider'></span>
                </label>
                <p className='form-input--checkbox__label'>Question Image</p>
            </div>

            {(currentQuestion && currentQuestion.question_image_option) && (
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
                            onChange={ handleQuestionsChange }
                        />
                    </div>
                    {currentQuestion.question_image &&
                        <p>{ currentQuestion.question_image.name }</p>
                    }
                    {questionsErrors.question_image && <p style={{ color: 'red' }}>{questionsErrors.question_image}</p>}
                </div>
            )}

            <hr className='divider' />

            <div className='form-input'>
                <label className='form-input__label' htmlFor='text'>Question <span className='required-star'>*</span></label>
                <input 
                    className='form-input__input' 
                    type='text'
                    name='text'
                    maxLength='1000'
                    id='text'
                    value={ currentQuestion.text }
                    onChange={ handleQuestionsChange }
                    placeholder='Enter your question'
                    required
                />
                {questionsErrors.text && (
                    <p className='form-input__hint--invalid'>{ questionsErrors.text }</p>
                )}
            </div>

            {currentQuestion.answers.map((answer, index) => {
                const answerLabel = `answer_${alphabeth[index]}`;

                return (
                    <div className='form-answer-container' key={`answer-${index}`}>
                        {currentQuestion.type !== 'truefalse' && (
                            <div className='form-input'>
                                <label className='form-input__label' htmlFor={answerLabel}>{`Answer ${alphabeth[index].toUpperCase()}`}</label>
                                <input 
                                    data-answer-id={index}
                                    className='form-input__input' 
                                    type='text'
                                    name="answer"
                                    maxLength='1000'
                                    id={answerLabel}
                                    value={ currentQuestion.answers[index].text }
                                    onChange={ handleAnswerChange }
                                    placeholder='Your answer'
                                />
                            </div>
                        )}
                        {currentQuestion.type === 'truefalse' && (
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
                                    checked={ currentQuestion.answers[index] ? currentQuestion.answers[index].is_correct : false }
                                    name="correct_answer" 
                                    onChange={ handleAnswerCheckboxChange }
                                />
                                <span className='switch-checkbox'>Correct</span>
                            </label>
                            <button 
                                type='button'
                                data-answer-id={index}
                                className={`${currentQuestion.answers.length > 2 ? 'button--small--rose-dark' : 'button--small--inactive'} form-answer-buttons--remove`}
                                onClick={ currentQuestion.answers.length > 2 ? handleRemoveAnswer : () => {return} }
                            >
                                <img src={ currentQuestion.answers.length > 2 ? removeIcon : removeIconGrey } alt="Remove answer" />
                                Remove
                            </button>
                        </div>
                    </div>
                );
            })}
            {questionsErrors.text && (
                <p className='form-input__hint--invalid'>{ questionsErrors.answer }</p>
            )}

            {(currentQuestion.answers.length < 8 && currentQuestion.type !== 'truefalse')&& (
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

            <div className='create-question-submit-buttons'>
                {!submitQuestion && (
                    <button 
                    type='button' 
                    className='button--large--emerald-light bold form__submit-question-button'
                    onClick={ handleSubmitCurrentQuestion }
                    >
                        {currentQuestionIndex === questions.length ? `Submit question` : `Update question`}
                    </button>
                )}
                <button 
                    type='button' 
                    className='button--large--sky-dark form__submit-question-button'
                    onClick={ handleCreateQuestion }
                    >
                    {`Create next question`}
                </button>
                { !removeQuestionAlert && (
                    <button 
                        type='button' 
                        className='button--large--rose-dark form__submit-question-button create-question-submit-buttons__remove-question-button'
                        onClick={ handleRemoveCurrentQuestion }
                    >
                        {`Remove this question`}
                    </button>
                )}
                { removeQuestionAlert && (
                    <div className='create-question__remove-question-alert'>
                        <h4>Are you sure you want to remove this question? This action can NOT be undone.</h4>
                        <div className='create-question__remove-question-alert__buttons'>
                            <button 
                                type='button' 
                                className='button--small--rose-dark'
                                onClick={ handleRemoveCurrentQuestion }
                            >
                                Remove
                            </button>
                            <button 
                                type='button' 
                                className='button--small--sky-light'
                                onClick={ handleKeepCurrentQuestion }
                            >
                                Keep it
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};



export default CreateQuizQuestionsStep;
