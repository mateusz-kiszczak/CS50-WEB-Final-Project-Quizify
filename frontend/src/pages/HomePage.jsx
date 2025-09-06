// frontend/src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, createSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import QuizTile from '../components/QuizTile';

import registerAccount from '../assets/home-page-register-arrow.svg';
import createQuiz from '../assets/home-page-create-quiz.svg';
import shareQuiz from '../assets/home-page-share-quiz.svg';
import arrowVector from '../assets/large-arrow-white.svg';



const HomePage = () => {
    // Variables

    // Device breakpoints
    const mobile = 568;

    // Will display 9 quizzes for devices between those width, 8 otherwise.
    const mediumBreakStart = 850;
    const mediumBreakEnd = 1099;
    const navigate = useNavigate();

    const { loading, api } = useAuth();


    // States
    const [quizzes, setQuizzes] = useState([]);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [loadMore, setLoadMore] = useState(true);
    const [search, setSearch] = useState('');


    // Effects

    // Update screen dimentions.
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!loading) {
            fetchQuizzes();
        }
    }, [loading, api]);


    // Functions
    const handleChange = (e) => {
        const search = e.target.value;

        setSearch(search);
    }

    const handleSearchSubmit = () => {
        navigate({
            pathname: '/quizzes/1',
            search: `?${createSearchParams({ search })}`,
        });
    }

    const handleSubscribe = () => {
        return;
    }

    const handleLoadMore = () => {
        setLoadMore(false);
    }

    const fetchQuizzes = async () => {
        try {
            const response = await api.get('/quizzes/get-popular/');
            setQuizzes(response.data.quizzes);
        } catch (error) {
            console.error('Error fetching quizzes:', error.response?.data || error.message);
            setQuizzes([]);
        }
    }


    // Render
    return (
        <div>
            <header className='home-page__header'>
                <h1 className='hero-header'>Quizify</h1>
                <p className='hero-subtext'>Find your next challenge</p>
                <form onSubmit={ handleSearchSubmit } noValidate className='home-page__search-form'>
                    <input type="search" name="search" placeholder='Searching Phrase' className='home-page__search-form__input' onChange={ handleChange }/>
                    <button type="submit" className='home-page__search-form__button button--medium--amber-dark'>Search</button>
                </form>
            </header>
            <section className='home-page__popular_quizzes'>
                <h2>Popular Quizzes</h2>
                    {loading && (
                        <p>Loading quizzes...</p>
                    )}
                    {screenWidth >= mobile && (
                        <div className='quiz-tiles-container'>
                            {quizzes.map((quiz, index) => {
                                    if (index < 8) {
                                        return (
                                            <QuizTile key={`quiz-${quiz.id}`} quizData={ quiz } /> 
                                        )
                                    } else if ( index == 8 && screenWidth >= mediumBreakStart && screenWidth <= mediumBreakEnd) {
                                        return (
                                            <QuizTile key={`quiz-${quiz.id}`} quizData={ quiz } /> 
                                        )
                                    }
                                }
                            )}
                        </div>
                    )}
                    {screenWidth < mobile && (
                        <>
                            <div className='quiz-tiles-container'>
                                {quizzes.map((quiz, index) => {
                                    if (index < 4) {
                                        return (
                                            <QuizTile key={`quiz-${quiz.id}`} quizData={ quiz } /> 
                                        )
                                    } else {
                                        return (
                                            <QuizTile key={`quiz-${quiz.id}`} quizData={ quiz } loadMore={ loadMore } /> 
                                        )
                                    }                                    
                                }
                            )}
                            </div>
                            {loadMore && (
                                <div className='home-page__popular_quizzes__button-container'>
                                    <button className='home-page__popular_quizzes__button button--large--neutral-dark' onClick={ handleLoadMore }>Load More</button>
                                </div>
                            )}
                        </>
                    )}
            </section>
            <section className='home-page__your-quiz'>
                <div className='home-page__your-quiz__wrapper'>
                    <h2>Make Your Own Quiz</h2>
                    <div className='home-page__your-quiz__content'>
                        <div className='home-page__your-quiz__content__box'>
                            <img src={ registerAccount } alt="An arrow enter the element." />
                            <p>Sign in or register an account</p>
                        </div>
                        <img className='home-page__your-quiz__content__arrow' src={ arrowVector } alt="An arrow" />
                        <div className='home-page__your-quiz__content__box'>
                            <img src={ createQuiz } alt="Vector folder, table, document." />
                            <p>Create a quiz</p>
                        </div>
                        <img className='home-page__your-quiz__content__arrow' src={ arrowVector } alt="An arrow" />
                        <div className='home-page__your-quiz__content__box'>
                            <img src={ shareQuiz } alt="Two avatars next to each others." />
                            <p>Share your work with others</p>
                        </div>
                    </div>
                    <div className='home-page__your-quiz__link-button'>
                        <Link to="/create-quiz">
                            <button className='button--large--amber-dark'>
                                Start making a quiz
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
            <section className='home-page__plans'>
                <div className='home-page__plans__content'>
                    <h2>Do you need a professional exam quiz?</h2>
                    <Link to='/subscriptions'>Check our plans</Link>
                </div>
            </section>
            <section className='home-page__subscribe'>
                <h2>Subscribe</h2>
                <form onSubmit={ handleSubscribe } noValidate className='home-page__search-form'>
                    <input type="search" name="search" placeholder='Enter your email' className='home-page__search-form__input'/>
                    <button type="submit" className='home-page__search-form__button button--medium--emerald-dark'>Subscribe</button>
                </form>
            </section>
        </div>
    );
};



export default HomePage;
