import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import CreateQuizGeneralStep from '../components/CreateQuizGeneralStep';
import CreateQuizQuestionsStep from '../components/CreateQuizQuestionsStep';
import CreateQuizSummaryStep from '../components/CreateQuizSummaryStep';
import CreateQuizSuccessStep from '../components/CreateQuizSuccessStep';



const CreateQuizPage = () => {
    // Variables
    const initialQuizFormData = {
        title: '',
        description: '',
        created_by: '',
        category: '',
        tags: [],
        quiz_image: null,
        quiz_time_limit: null, // in seconds
        quiz_timer: false,
        random_questions_order: false,
        random_answers_order: false,
        questions: []
    };

    // questions: [
    //     {
    //         type: '',
    //         text: '',
    //         question_time_limit: '',
    //         question_image: null,
    //         answers: []
    //     }
    // ]

    // answers: [
    //     {
    //         answer: '',
    //         correct: false
    //     }
    // ]


    // Auth
    const { isAuthenticated, loading, api } = useAuth();


    // Router
    const navigate = useNavigate();


    // States
    const [formData, setFormData] = useState(initialQuizFormData);
    const [currentStep, setCurrentStep] = useState("general");
    const [nextStep, setNextStep] = useState(null);
    const [cleanFormAlert, setCleanFormAlert] = useState(false);
    const [formCleaned, setFormCleaned] = useState(false);

    // Helper States
    // Get question index when edit question. Summary -> Questions
    const [editQuestionIndex, setEditQuestionIndex] = useState(null);


    // Effects

    // Display one of three steps of form
    useEffect(() => {
        renderStep();

        // Scroll to top anytime step changes.
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [currentStep]);

    useEffect(() => {
        // Scroll to top.
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [cleanFormAlert]);

    // Helps redirect from Summary step to specific question in Questions step
    useEffect(() => {
        if (editQuestionIndex || editQuestionIndex === 0) {
            // Set next form step.
            handleCurrentStep('questions');
            // Reset next step state.
            handleNextStep(null);
        }
    }, [editQuestionIndex]);

    // Prevent document from scrolling when alert is visible.
    useEffect(() => {
        document.body.style.overflow = cleanFormAlert ? "hidden" : "auto";

        return () => document.body.style.overflow = "auto";
    }, [cleanFormAlert]);


    // Functions
    const updateEditQuestionIndex = (index) => {
        setEditQuestionIndex(index);
    }

    const renderStep = () => {
        switch (currentStep) {
            case "general":
                return (
                    <CreateQuizGeneralStep  
                        formData={ formData }
                        setFormData={ setFormData }
                        nextStep={ nextStep }
                        handleNextStep={ handleNextStep }
                        handleCurrentStep={ handleCurrentStep }
                        formCleaned={ formCleaned }
                        setFormCleaned={ setFormCleaned }
                    />
                );
            case "questions":
                return (
                    <CreateQuizQuestionsStep  
                        formData={ formData }
                        setFormData={ setFormData }
                        nextStep={ nextStep }
                        handleNextStep={ handleNextStep }
                        handleCurrentStep={ handleCurrentStep }
                        editQuestionIndex={ editQuestionIndex }
                    />
                );
            case "summary":
                return (
                    <CreateQuizSummaryStep  
                        formData={ formData }
                        setFormData={ setFormData }
                        nextStep={ nextStep }
                        handleSubmit={ handleSubmit }
                        handleNextStep={ handleNextStep }
                        handleCurrentStep={ handleCurrentStep }
                        updateEditQuestionIndex={ updateEditQuestionIndex }
                    />
                );
            case "success":
                return (
                    <CreateQuizSuccessStep
                        nextStep={ nextStep }
                        handleNextStep={ handleNextStep }
                        handleCurrentStep={ handleCurrentStep }
                    />
                )
            default:
                return null;
        }
    };

    const handleCurrentStep = step => {
        setCurrentStep(step);
    }

    const handleNextStep = step => {
        setNextStep(step);
    }

    const handleShowCleanFromAlert = () => {
        if (cleanFormAlert) {
            setCleanFormAlert(false);
        } else {
            setCleanFormAlert(true);
        }
    }

    const handleCleanQuizForm = () => {
        setFormData(initialQuizFormData);
        setCleanFormAlert(false);
        setFormCleaned(true);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const newFormData = { ...formData };

        // Rewrite data and send it to the backend.

        // If no description provided make sure the value is null.
        // If form contains empty spaces, name value null.
        if (!newFormData.description.replace(/ /g,'')) {
            newFormData.description = null;
        }

        // Make sure quiz timer is a number or 0 when false, null.
        if (!newFormData.quiz_timer || !newFormData.quiz_time_limit || newFormData.quiz_time_limit < 0) {
            newFormData.quiz_time_limit = 0;
        }

        // Remove Timer boolean from data (not needed in database).
        delete newFormData.quiz_timer;

        // Convert array of tags to a comma-separated string
        newFormData.tags = newFormData.tags.map(tag => tag.trim()).filter(tag => tag !== '').join(',');

        // if quiz image not specified make sure the value is null.
        if (!newFormData.quiz_image) newFormData.quiz_image = null;

        // Loop through questions.
        newFormData.questions.forEach((question) => {
            // if question image not specified make sure the value is null.
            if (!question.question_image_option) question.question_image = null;

            // Remove Qestion Image boolean from data (not needed in database).
            delete question.question_image_option;

            // Make sure quiz timer is a number or 0 when false, null.
            if (!question.question_timer || !question.question_time_limit || question.question_time_limit < 0) {
                question.question_time_limit = 0;
            }

            // Remove Timer boolean from data (not needed in database).
            delete question.question_timer;
        })

        // Prepare formData
        const data = new FormData();
        data.append('title', newFormData.title);
        data.append('description', newFormData.description);
        data.append('category', newFormData.category);
        data.append('quiz_time_limit', newFormData.quiz_time_limit);
        data.append('random_questions_order', newFormData.random_questions_order);
        data.append('random_answers_order', newFormData.random_answers_order);
        // Send tags as a comma-separated string
        data.append('tags', newFormData.tags);

        if (newFormData.quiz_image) {
            data.append('quiz_image', newFormData.quiz_image);
        }

        // Prepare questions data for JSON string
        const questionsForJson = newFormData.questions.map(q => {
            const { question_image, ...rest } = q;
            return rest;
        });

        data.append('questions_json', JSON.stringify(questionsForJson));

        // Append question images separately
        newFormData.questions.forEach((q, index) => {
            if (q.question_image) {
                data.append(`question_image_${index}`, q.question_image);
            }
        });

        try {
            const response = await api.post(`/quiz/create/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // Reset form fields
            setFormData(initialQuizFormData);

            // Go to summary
            setCurrentStep("success");

        } catch (error) {
            console.error('Error creating quiz:', error.response?.data || error.message);
        }

        // Display the values
        // for (const value of data.values()) {
        //   console.log(value);
        // }
    }


    // Render
    if (loading) {
        return <p>Loading create quiz page...</p>;
    }


    if (isAuthenticated) {
        return (
            <section>
                {currentStep === "general" && 
                    <header className='create-quiz__header'>
                        <h1 className='hero-header'>Create your QUIZ</h1>
                        <button 
                            className='button--large--amber-dark'
                            onClick={ handleShowCleanFromAlert }
                        >Start New Quiz
                        </button>
                    </header>
                }
                {cleanFormAlert && (
                    <div className='create-quiz__alert-wrapper'>
                        <div className='create-quiz__alert'>
                            <h2 className='create-quiz__alert__header'>Are you sure, you want to start a new Quiz?</h2>
                            <div className='create-quiz__alert__text-container'>
                                <p className='create-quiz__alert__text'>This action will remove the questions and clean all the form fields.</p>
                                <p className='create-quiz__alert__text'>Changes after starting a new quiz are not reversable.</p>
                            </div>
                            <div className='create-quiz__alert__buttons'>
                                <button 
                                    className='create-quiz__alert__buttons_button button--medium--rose-dark'
                                    onClick={ handleCleanQuizForm }
                                >
                                Start a New Quiz
                                </button>
                                <button 
                                    className='create-quiz__alert__buttons_button button--medium--emerald-dark' 
                                    onClick={ handleShowCleanFromAlert }>
                                Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className='create-quiz-container'>
                    {currentStep !== "success" && (
                        <div className='create-quiz__nav'>
                            <button 
                                className={
                                    currentStep === "general" ? 
                                    'create-quiz__nav__button--active' : 
                                    'create-quiz__nav__button'
                                }
                                onClick={() => handleNextStep("general")}
                            >
                                General
                            </button>
                            <button 
                                className={
                                    currentStep === "questions" ? 
                                    'create-quiz__nav__button--active' : 
                                    'create-quiz__nav__button'
                                }
                                onClick={() => handleNextStep("questions")}
                            >
                                Questions
                            </button>
                            <button 
                                className={
                                    currentStep === "summary" ? 
                                    'create-quiz__nav__button--active' : 
                                    'create-quiz__nav__button'
                                }
                                onClick={() => handleNextStep("summary")}
                            >
                                Summary
                            </button>
                        </div>
                    )}

                    {currentStep !== "success" && (
                        <hr className='divider'/>
                    )}

                    <form onSubmit={ handleSubmit } noValidate encType="multipart/form-data" className='form'>

                        <div className='create-quiz-form-child-container'>
                            { renderStep() }
                        </div>

                        {currentStep === "summary" &&
                            <button type='submit' 
                            style={{display: 'none'}}
                            className='button--large--sky-dark'>Submit Quiz</button>
                        }
                    </form>

                    {currentStep !== "success" && (
                        <hr className='divider'/>
                    )}
                    
                    {currentStep === "general" && 
                        <div className='create-quiz-pagination--general'>
                            <button 
                                onClick={() => handleNextStep("questions")}
                                className='button--medium--emerald-dark'
                            >
                                Next Step
                            </button>
                        </div>
                    }
                    {currentStep === "questions" && 
                        <div className='create-quiz-pagination'>
                            <button 
                                onClick={() => handleNextStep("general")}
                                className='button--medium--emerald-light'
                            >
                                Go Back
                            </button>
                            <button 
                                onClick={() => handleNextStep("summary")}
                                className='button--medium--emerald-dark'
                            >
                                Next Step
                            </button>
                        </div>
                    }
                    {currentStep === "summary" && 
                        <div className='create-quiz-pagination'>
                            <button 
                                onClick={() => handleNextStep("questions")}
                                className='button--medium--emerald-light'
                            >
                                Go Back
                            </button>
                            <button 
                                onClick={ handleSubmit }
                                className='button--medium--emerald-dark'
                            >
                                Submit Quiz
                            </button>
                        </div>
                    }
                </div>
            </section>
        );
    }
    else {
        return (
            <div className='create-quiz-container'>
                <h1 className='header-1-sm'>You must be logged in to add a Quiz.</h1>
                <Link className='link-lg--fuchsia' to='/login'>Login into your account</Link>
                <Link className='link-lg--fuchsia' to='/register'>Register a new user for FREE</Link>
            </div>
        );
    }
};



export default CreateQuizPage;
