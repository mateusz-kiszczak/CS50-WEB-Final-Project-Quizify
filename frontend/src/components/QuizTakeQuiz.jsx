import React, { useState, useEffect } from "react";

import shuffleArray from "../utilities/arrayRandomOrder";
import alphabeth from '../data/alphabeth';

import checkboxChecked from '../assets/checkbox-checked-icon.svg';
import checkboxUnchecked from '../assets/checkbox-unchecked-icon.svg';
import optionChecked from '../assets/option-checked-icon.svg';
import optionUnchecked from '../assets/option-unchecked-icon.svg';



const QuizTakeQuiz = ({ quiz, handleCurrentPage, handleUserAnswers, currentPage }) => {
    // Variables

    // Device breakpoints
    const tablet = 768;
    // Base URL
    const backendBaseURL = 'http://localhost:8000';


    // States
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(null);

    const [quizTimerOn, setQuizTimerOn] = useState(false);
    const [quizTime, setQuizTime] = useState(0);
    const [questionTimerOn, setQuestionTimerOn] = useState(false);
    const [questionTime, setQuestionTime] = useState(0);

    const [selectedAnswers, setSelectedAnswers] = useState([]);


    // Effects

    // Update screen dimentions.
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
    
        window.addEventListener("resize", handleResize);
        
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Set base state values.
    useEffect(() => {
        if (quiz && Array.isArray(quiz.questions)) {
            let updatedQuestions = [...quiz.questions];
    
            // If opted in, sort questions in random order.
            if (quiz.random_questions_order) {
                updatedQuestions = shuffleArray(updatedQuestions);
            }

            // If opted in, sort answers in random order in every question.
            if (quiz.random_answers_order) {
                updatedQuestions = updatedQuestions.map((question) => ({
                    ...question,
                    answers: shuffleArray(question.answers),
                }));
            }

            // Set base state values.
            setQuestions(updatedQuestions);
            setTotalQuestions(updatedQuestions.length);
            setCurrentQuestion(1);

            if (selectedAnswers && !selectedAnswers.length > 0) {
                let emptySelectedAnswers = []; 

                for (let i = 0; i < updatedQuestions.length; i++) {
                    const emptySelectedAnswer = {
                        question_id: updatedQuestions[i].id,
                        selected_answers_id: []
                    }

                    emptySelectedAnswers.push(emptySelectedAnswer);
                }

                setSelectedAnswers(emptySelectedAnswers);
            }
        }
    }, [quiz]);

    // If quiz has a timer set the value.
    useEffect(() => {
        if (quiz.quiz_time_limit && !quizTimerOn) {
            setQuizTime(quiz.quiz_time_limit);
        }
    }, [quiz]);
    
    // Quiz interval.
    useEffect(() => {
        let interval = null;

        if (quizTimerOn) {
            interval = setInterval(() => {
                setQuizTime((prevTime) => prevTime - 1);
            }, 1000);
        }

        if (quizTimerOn && quizTime <= 0) {
            clearInterval(interval);

            // Finish the quiz.
            handleFinishQuiz();
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [quizTimerOn, quizTime]);

    // Set quiz time counter.
    useEffect(() => {
        if (quizTime && quizTime > 0 && !quizTimerOn) {
            setQuizTimerOn(true);
        }
    }, [quizTime]);

    // Stop interval when different page renders.
    useEffect(() => {
        if (currentPage !== 'takeQuiz') {
            setQuizTimerOn(false);
            setQuestionTimerOn(false);
        }
    }, [currentPage]);

    // Question interval.
    useEffect(() => {
        let interval = null;

        if (questionTimerOn) {
            interval = setInterval(() => {
                setQuestionTime((prevTime) => prevTime - 1);
            }, 1000);
        }

        if (questionTimerOn && questionTime <= 0) {
            clearInterval(interval);

            // Go to the next question.
            // If this is the last question, finish the quiz.
            if (currentQuestion < totalQuestions) {
                // stop and reset question timer when jump to next question.
                setQuestionTime(0);
                setQuestionTimerOn(false);

                // Set next page
                setCurrentQuestion(prevQuestionNumber => prevQuestionNumber + 1);
            } else {
                handleFinishQuiz();
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [questionTimerOn, questionTime]);

    // Set question time counter.
    useEffect(() => {
        if (questionTime && questionTime > 0 && !questionTimerOn) {
            setQuestionTimerOn(true);
        }
    }, [questionTime]);

    // If question has a timer set the value.
    useEffect(() => {
        if (currentQuestion && quiz.questions[currentQuestion - 1].question_time_limit && !questionTimerOn && !quiz.quiz_time_limit) {
            setQuestionTime(quiz.questions[currentQuestion - 1].question_time_limit);
        } else {
            // stop and reset question timer when jump to next question.
            setQuestionTime(0);
            setQuestionTimerOn(false);

        }
    }, [currentQuestion]);


    // Functions
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

    const handleFinishQuiz = () => {
        handleUserAnswers(selectedAnswers);
        handleCurrentPage("quizSummary");
    };

    const handleMultipleAnswerCheck = (answerId) => {
        const questionId = questions[currentQuestion - 1].id;

        const exists = selectedAnswers.some(item => item.question_id === questionId);

        let updatedSelectedAnswers;

        if (exists) {
            updatedSelectedAnswers = selectedAnswers.map(item => {
                if (item.question_id === questionId) {
                    const alreadySelected = item.selected_answers_id.includes(answerId);
                    const newAnswers = alreadySelected
                    ? item.selected_answers_id.filter(id => id !== answerId) // remove
                    : [...item.selected_answers_id, answerId]; // add

                    return {
                      ...item,
                      selected_answers_id: newAnswers,
                    };
                }

                return item;
            });
        } else {
            updatedSelectedAnswers = [
                ...selectedAnswers,
                { 
                    question_id: questionId, 
                    selected_answers_id: [answerId] 
                },
            ];
        }

        setSelectedAnswers(updatedSelectedAnswers);
    };


    const handleSingleAnswerCheck = (answerId) => {
        const questionId = questions[currentQuestion - 1].id;

        const updatedSelectedAnswers = selectedAnswers.map(item => {
            if (item.question_id === questionId) {
                return {
                    ...item,
                  selected_answers_id: [answerId],
                };
            }

            return item;
        });

        setSelectedAnswers(updatedSelectedAnswers);
    };

    const handleNextQuestion = () => {
        if (currentQuestion < totalQuestions && 
            selectedAnswers[currentQuestion - 1].selected_answers_id.length > 0
        ) {
            // stop and reset question timer when jump to next question.
            setQuestionTime(0);
            setQuestionTimerOn(false);

            // Set next page
            setCurrentQuestion(prevQuestionNumber => prevQuestionNumber + 1);
        }

        if (currentQuestion === totalQuestions) {
            handleFinishQuiz();
        }
    }


    // Render
    return (
        <section className="take-quiz">
            <h1 className="header-1-sm">{ quiz.title }</h1>
            <section className="take-quiz__questions-index">
                <h2 className="header-2-sm">Current question</h2>
                {screenWidth >= tablet ? (
                    <div className="take-quiz__questions-index__container">
                        {quiz.questions.map((q, index) => {
                            const questionNumber = index + 1;
                            return (
                                <button
                                key={`question-number-${questionNumber}`}
                                className={ questionNumber === currentQuestion ? 'index-button--neutral--active' : 'index-button--neutral' }
                                >
                                    { questionNumber }
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <div className="take-quiz__questions-index__counter">
                        <button className="index-button--neutral--active">{ currentQuestion }</button>
                        <p className="bold">/</p>
                        <button className="index-button--neutral">{ totalQuestions }</button>
                    </div>
                )}
            </section>
            <section className="take-quiz__quiz-timer">
                { quizTimerOn && (
                    <h3 className="header-3-sm">Quiz Timer: <span className="take-quiz__quiz-timer__time">{ convertSeconds(quizTime) }</span></h3>
                )}
                { questionTimerOn && (
                    <h3 className="header-3-sm">Question Timer: <span className="take-quiz__quiz-timer__time">{ convertSeconds(questionTime) }</span></h3>
                )}
            </section>
            <section className="take-quiz__question">
                { screenWidth >= tablet && (
                    <p className="bold">{ `Question ${currentQuestion} / ${totalQuestions}` }</p>
                )}  

                { questions?.length > 0 && (
                    <>
                        <h3 className="header-3-sm take-quiz__question__question-text">{ questions[currentQuestion - 1].text }</h3>

                        {(questions[currentQuestion - 1] && questions[currentQuestion - 1].question_image_url) && (
                            <img 
                                className="take-quiz__question__image"
                                src={ `${backendBaseURL}${questions[currentQuestion - 1].question_image_url}` } 
                                alt={ quiz?.title } 
                            />
                        )}
                        
                        <div className="take-quiz__question__answers">
                            { questions[currentQuestion - 1].answers.map((answer, index) => {
                                return (
                                    <div
                                        key={`answer-${index}`}
                                        className="take-quiz__question__answers__answer"
                                    >
                                        <p className="take-quiz__question__answers__answer__letter bold">{ `${alphabeth[index].toUpperCase()}.` }</p>
                                        { questions[currentQuestion - 1].type === 'multiple' && (
                                            <button 
                                            className='take-quiz__question__answers__answer__checkbox'
                                            onClick={ () => handleMultipleAnswerCheck(answer.id) }
                                            >
                                                <img src={ selectedAnswers[currentQuestion - 1].selected_answers_id.includes(answer.id) ? checkboxChecked : checkboxUnchecked } alt={ selectedAnswers[currentQuestion - 1].selected_answers_id.includes(answer.id) ? 'Selected checkbox' : 'Empty checkbox' } />
                                            </button>
                                        )}
                                        { (questions[currentQuestion - 1].type === 'single' || questions[currentQuestion - 1].type === 'truefalse') && (
                                            <button 
                                            className='take-quiz__question__answers__answer__checkbox'
                                            onClick={ () => handleSingleAnswerCheck(answer.id) }
                                            >
                                                <img src={ selectedAnswers[currentQuestion - 1].selected_answers_id.includes(answer.id) ? optionChecked : optionUnchecked } alt={ selectedAnswers[index].selected_answers_id.includes(answer.id) ? 'Selected checkbox' : 'Empty checkbox' } />
                                            </button>
                                        )}
                                        <p className={`take-quiz__question__answers__answer__text ${selectedAnswers[currentQuestion - 1].selected_answers_id.includes(answer.id) ? 'bold' : ''}`}>
                                            { answer.text }
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </section>
            <div className="take-quiz__next-button">
                { selectedAnswers[currentQuestion - 1] && (
                    <button 
                    className={ `take-quiz__next-button ${selectedAnswers[currentQuestion - 1].selected_answers_id.length > 0 ? 'button--large--emerald-dark' : 'button--large--inactive'}` }
                    onClick={ handleNextQuestion }
                    >
                        { currentQuestion < totalQuestions ? 'Next Question' : 'Finish Quiz' }
                    </button>
                )}
            </div>
        </section>
    );
};



export default QuizTakeQuiz;
