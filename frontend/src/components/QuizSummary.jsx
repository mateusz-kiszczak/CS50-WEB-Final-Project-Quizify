import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import starBlack from "../assets/star-black.svg";
import starBlackEmpty from "../assets/star-black-empty.svg";

import alphabeth from "../data/alphabeth";

const QuizSummary = ({quiz, handleCurrentPage, userAnswers, handleUserAnswers, quizId, api}) => {
    // States
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [correctAnsweredQuestions, setCorrectAnsweredQuestions] = useState([]);
    const [currentQuestionViewIndex, setCurrentQuestionViewIndex] = useState(null);
    const [currentQuestionView, setCurrentQuestionView] = useState(null);
    const [quizRating, setQuizRating] = useState(5);
    const [quizRatingMessage, setQuizRatingMessage] = useState('');
    const [quizWaScored, setQuizWasScored] = useState(false);
    const [quizWasIncremented, setQuizWasIncremented] = useState(false);


    // Effects
    useEffect(() => {
        if (quiz.questions && userAnswers) {
            setQuizQuestions(quiz.questions);
            setSelectedAnswers(userAnswers);
        }
    }, [quiz])

    useEffect(() => {
        handleCorrectAnswers();
    }, [quizQuestions, selectedAnswers]);

    useEffect(() => {
        if (correctAnswers.length > 0) {
            handleCorrectAnsweredQuestions();
        }
    }, [correctAnswers])

    useEffect(() => {
        let questionId;

        if (selectedAnswers.length > 0 && currentQuestionViewIndex !== null) {
            questionId = selectedAnswers[currentQuestionViewIndex].question_id;
        }

        if (questionId) {
            setCurrentQuestionView(quizQuestions.filter(q => q.id === questionId)[0]);
        }
    }, [selectedAnswers, currentQuestionViewIndex]);

    useEffect(() => {
        if (
            correctAnsweredQuestions.length > 0 &&
            selectedAnswers.length > 0 &&
            !quizWaScored &&
            !quizWasIncremented
        ) {
            submitQuizScore(quizId);
            increaseQuizTimesCompleted(quizId);
            setQuizWasScored(true);
            setQuizWasIncremented(true);
        }
    }, [correctAnsweredQuestions, selectedAnswers]);


    // Functions
    const handleCorrectAnswers = () => {
        let relatedQuestionsCollection = [];
        
        selectedAnswers.forEach(item => {
            let relatedQuestion = quizQuestions.find(question => question.id === item.question_id);

            // Get question id and only correct answers id
            relatedQuestion = {
                question_id: relatedQuestion.id,
                correct_answers_id: relatedQuestion.answers.filter(answer => answer.is_correct).map(answer => answer.id)
            }

            relatedQuestionsCollection.push(relatedQuestion);
        }); 

        setCorrectAnswers(relatedQuestionsCollection);
    };

    const handleCorrectAnsweredQuestions = () => {
        let correctAnswerredQ = [];

        for(let i = 0; i < correctAnswers.length; i++) {
            let correctA = correctAnswers[i].correct_answers_id.sort();
            let selectedA = selectedAnswers[i].selected_answers_id.sort();

            if (correctA.length !== selectedA.length) {
                correctAnswerredQ.push(false);
            } else {
                const isCorrect = correctA.every((val, index) => val === selectedA[index]);

                correctAnswerredQ.push(isCorrect);
            }
        }

        setCorrectAnsweredQuestions(correctAnswerredQ);
    };

    const handleCurrentQuestionViewIndex = (num) => {
        if (currentQuestionViewIndex === num) {
            setCurrentQuestionViewIndex(null);
        } else {
            setCurrentQuestionViewIndex(num);
        }
    };

    const handleQuizRatingChange = (num) => {
        if (num > 0 && num <= 5 && num !== quizRating) {
            setQuizRating(num);
        }
    };

    const submitRating = async (id) => {
        try {
            const response = await api.post(`/quiz/${id}/rate-quiz/`, { rating: quizRating });

            if (response.data.success) {
                setQuizRatingMessage(response.data.success);
            } 
        } catch (error) {
            console.error('Error fetching quiz:', error.response?.data || error.message);
            setQuizRatingMessage('You have already rated this quiz.');
        }
    };

    const submitQuizScore = async (id) => {
        const totalQuestions = quizQuestions.length;
        const totalCorrectAnswers = correctAnsweredQuestions.filter(q => q).length;

        if (totalQuestions && totalCorrectAnswers) {
            try {
                const response = await api.post(`/quiz/${id}/score-quiz/`, {
                    'total_questions': totalQuestions,
                    'total_correct_answers': totalCorrectAnswers,
                });

                if (response) {
                    setQuizWasScored(true);

                    console.log(response.data.success);
                }
            } catch(error) {
                console.error('Error scoring quiz:', error.response?.data || error.message);
            }
        }
    };

    const increaseQuizTimesCompleted = async (id) => {
        try {
            const response = await api.patch(`/quiz/${id}/increase-quiz-times-completed/`);

            if (response) {
                setQuizWasIncremented(true);

                console.log(response.data.success);
            }
                
        } catch(error) {
            console.error('Error increasing quiz times completed:', error.response?.data || error.message);
        }
    };

    const handleTakeQuizAgain = () => {
        handleUserAnswers([]);
        handleCurrentPage("frontPage");
    };


    // Render
    return (
        <section className="quiz-summary">
            <h1 className="header-1-sm">Results</h1>
            <h2 className="header-3-sm">{ quiz.title }</h2>
            <section className="quiz-summary__questions-order">
                <h3 className="header-4-sm">Questions order</h3>
                <div className="quiz-summary__questions-order__list">
                    { correctAnsweredQuestions.length > 0 && (
                        correctAnsweredQuestions.map((caq, index) => {
                            return (
                                <button
                                    key={`question-${index + 1}`}
                                    className={ correctAnsweredQuestions[index] ? 'index-button--emerald' : 'index-button--rose' }
                                    onClick={ () => handleCurrentQuestionViewIndex(index) }
                                >
                                    {index + 1}
                                </button>
                            )
                        })
                    )}
                </div>
            </section>
            { (currentQuestionViewIndex !== null) && (
                <section className={correctAnsweredQuestions[currentQuestionViewIndex] ? "quiz-summary__question-overview quiz-summary__question-overview--correct" : "quiz-summary__question-overview quiz-summary__question-overview--incorrect"}>
                    <h3 className="header-4-sm">{`Question ${currentQuestionViewIndex + 1}`}</h3>
                    <p className={correctAnsweredQuestions[currentQuestionViewIndex] ? "quiz-summary__question-overview__text quiz-summary__question-overview__text--correct" : "quiz-summary__question-overview__text quiz-summary__question-overview__text--incorrect"}>
                        {correctAnsweredQuestions[currentQuestionViewIndex] ? "Correct" : "Incorrect"}
                    </p>
                    { currentQuestionView && (
                        <>
                            <h3 className="header-4-sm">{ currentQuestionView.text }</h3>
                            <div className="quiz-summary__question-overview__answers">
                            { currentQuestionView.answers.map((answer, index) => {
                                return (
                                    <p className={ (selectedAnswers.length > 0 && selectedAnswers[currentQuestionViewIndex].selected_answers_id.includes(answer.id)) ? 'quiz-summary__question-overview__answers__answer quiz-summary__question-overview__answers__answer--selected' : 'quiz-summary__question-overview__answers__answer' }>
                                        <span>{`${alphabeth[index].toUpperCase()}.`}</span>
                                        { answer.text }
                                    </p>
                                )
                            }) }
                            </div>
                        </>
                    )}
                </section>
            )}
            <section className="quiz-summary__summary">
                <h3 className="header-3-sm">Summary</h3>
                <div className="quiz-summary__summary__info">
                    <p>{`${correctAnsweredQuestions.filter(caq => caq).length} answers were CORRECT `}</p>
                    <span className="quiz-summary__summary__correct-symbol">✓</span>
                </div>
                <div className="quiz-summary__summary__info">
                    <p>{`${correctAnsweredQuestions.filter(caq => !caq).length} answers were WRONG `}</p>
                    <span className="quiz-summary__summary__wrong-symbol">✘</span>
                </div>
            </section>
            <h3 className="header-4-sm">
                {`Total score: ${
                    Math.floor(correctAnsweredQuestions.filter(caq => caq).length / quizQuestions.length * 100)
                }%`}
            </h3>
            <section className="quiz-summary__rating">
                <div className="quiz-summary__rating__container">
                    <h3>Rate this quiz</h3>
                    {!quizRatingMessage ? (
                        <div className="quiz-summary__rating__stars__container">
                        {Array.from({ length: 5 }, (_, i) => (
                            <button
                            key={ `rating-${i + 1}` }
                            className="summary__rating__stars__star"
                            onClick={ () => handleQuizRatingChange(i + 1) }
                            >
                                <img 
                                    src={ (i + 1) <= quizRating ? starBlack : starBlackEmpty } 
                                    alt={ (i + 1) <= quizRating ? 'Rating star' : 'Empty rating star' } 
                                    />
                            </button>
                        ))}
                    </div>
                    ) : (
                        <p>{quizRatingMessage}</p>
                    )}
                </div>
                <button 
                    className="button--medium--fuchsia-dark quiz-summary__submit-button"
                    onClick={ () => submitRating(quizId) }
                >
                    Submit Rating
                </button>
            </section>
            <section className="quiz-summary__link-section">
                <h3 className="header-3-sm">Keep a track of your quizzes and results</h3>
                <Link to="/register" className="link-lg--fuchsia">Create an account for free</Link>
            </section>
            <div className="quiz-summary__again-button">
                <button 
                    className="button--large--emerald-dark"
                    onClick={ handleTakeQuizAgain }
                >Take Quiz Again
                </button>
            </div>
        </section>
    );
};



export default QuizSummary;
