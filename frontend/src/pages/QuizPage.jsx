import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

import QuizFrontPage from "../components/QuizFrontPage";
import QuizTakeQuiz from "../components/QuizTakeQuiz";
import QuizSummary from "../components/QuizSummary";



const QuizPage = () => {
    // Params
    const { id } = useParams();


    // Auth
    const { loading, api, isAuthenticated } = useAuth();


    // States
    const [quiz, setQuiz] = useState([]);
    const [quizRating, setQuizRating] = useState([]);
    const [quizScore, setQuizScore] = useState([]);
    const [currentPage, setCurrentPage] = useState('frontPage');
    const [userAnswers, setUserAnswers] = useState([]);


    // Effects
    useEffect(() => {
        if (!loading) {
            fetchQuiz(id);
            fetchQuizRating(id);
            fetchQuizScore(id);
        }
    }, [loading, api]);

    useEffect(() => {
            fetchQuizRating(id);
            fetchQuizScore(id);

            if (currentPage === 'frontPage') {
                fetchQuiz(id);
            }
    }, [currentPage])


    // Functions
    const fetchQuiz = async (id) => {
        try {
            const response = await api.get(`/quiz/${id}`);
            setQuiz(response.data.quiz);
        } catch (error) {
            console.error('Error fetching quiz:', error.response?.data || error.message);
            setQuiz([]);
        }
    }

    const fetchQuizRating = async (id) => {
        try {
            const response = await api.get(`/quiz/${id}/rating/`);
            setQuizRating(response.data.quiz_rating);
        } catch (error) {
            console.error('Error fetching quiz rating:', error.response?.data || error.message);
            setQuizRating([]);
        }
    }

    const fetchQuizScore = async (id) => {
        try {
            const response = await api.get(`/quiz/${id}/get-score/`);
            setQuizScore(response.data.quiz_score);
        } catch (error) {
            console.error('Error fetching quiz score:', error.response?.data || error.message);
            setQuizScore([]);
        }
    }

    const handleCurrentPage = (nextPage) => {
        setCurrentPage(nextPage)
    }

    const handleUserAnswers = (arr) => {
        setUserAnswers(arr);
    }

    const renderPage = () => {
        switch (currentPage) {
            case "frontPage":
                return (
                    <QuizFrontPage 
                        quiz={ quiz }
                        id={ id }
                        quizRating={ quizRating }
                        quizScore={ quizScore }
                        isAuthenticated={ isAuthenticated }
                        api={ api }
                        loading={ loading }
                        handleCurrentPage={ handleCurrentPage }
                    />
                )
            
            case "takeQuiz":
                return (
                    <QuizTakeQuiz 
                        quiz={ quiz }
                        handleCurrentPage={ handleCurrentPage }
                        currentPage={ currentPage }
                        handleUserAnswers={ handleUserAnswers }
                    />
                )
                
            case "quizSummary":
                return (
                    <QuizSummary 
                        quiz={ quiz }
                        handleCurrentPage={ handleCurrentPage }
                        userAnswers={ userAnswers }
                        handleUserAnswers={ handleUserAnswers }
                        quizId={ id }
                        api={ api }
                    />
                )
        }
    }


    // Render
    if (loading) {
        return (
            <div>Loading...</div>
        );
    }

    return renderPage();
};



export default QuizPage;
