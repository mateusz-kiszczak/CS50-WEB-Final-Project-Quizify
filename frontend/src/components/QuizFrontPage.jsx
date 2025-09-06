import React, { useState, useEffect } from "react";

import badWords from "../data/bad_words";
import goldenStar from "../assets/star-gold.svg";



const QuizFrontPage = ({ quiz, id, quizRating, quizScore, handleCurrentPage, api, isAuthenticated, loading }) => {
    // Variables
    const backendBaseURL = 'http://localhost:8000';
    const commentsLimit = 5;


    // States
    const [comment, setComment] = useState('');
    const [commentError, setCommentError] = useState('');
    const [comments, setComments] = useState([])
    const [displayedComments, setDisplayedComments] = useState(commentsLimit);


    // Effects
    useEffect(() => {
        if (!loading) {
            fetchComments(id);
        }
    }, [loading, api]);


    // Functions
    const fetchComments = async (id) => {
        try {
            const response = await api.get(`/quiz/${id}/get-comments/`);
            setComments(response.data.comments);
        } catch (error) {
            console.error('Error fetching quiz:', error.response?.data || error.message);
            setComments([]);
        }
    };
    
    const handleCommentChange = (e) => {
        const commentValue = e.target.value;

        setComment(commentValue);
    };

    const checksWordsInString = (str, wordsArr) => {
        const lowerStr = str.toLowerCase();

        return wordsArr.some(word => lowerStr.includes(word.toLowerCase()));
    };

    const increaseDisplayedComments = () => {
        setDisplayedComments(currentValue => currentValue + commentsLimit);
    };

    const submitComment = async (e) => {
        e.preventDefault();
        setCommentError('');

        if (checksWordsInString(comment, badWords)) {
            setCommentError('Comment contains an inappropriate word!');
            return;
        }

        if (comment.length >= 1000) {
            setCommentError('Comment con not be longer than 1000 charachters.');
            return;
        }

        if (comment.length < 0) {
            setCommentError('Comment con not be empty.');
            return;
        }

        try {
            const response = await api.post(`quiz/${id}/add-comment/`, { comment });

            if (response.data.status === 'success') {
                console.log('Comment added succesfully!');
                setComment('')
                fetchComments(id);
            } else {
                setCommentError(response.data.message || 'Something went wrong.');
            }
        } catch (error) {
            setCommentError(error.response?.data?.message || 'Failed to post comment.');
        }
    };


    // Render
    return (
        <section className="quiz-front-page">
            <h1 className="header-1-sm">{quiz.title}</h1>
            { quiz?.quiz_image_url && (
                <img 
                    className="quiz-front-page__front-image"
                    src={ `${backendBaseURL}${quiz.quiz_image_url}` } 
                    alt={ quiz?.title } />
            )}
            <p className="quiz-front-page__quiz-description">{ quiz.description }</p>
            <section className="quiz-front-page__quiz-tags">
                <h3 className="header-3-sm">Tags</h3>
                <div className="quiz-front-page__quiz-tags__container">
                    { quiz?.tags?.map((tag, index) => {
                            return (
                                <div 
                                className="quiz-front-page__quiz-tags__tag"
                                key={`tag-${index}-${tag}`}
                                >
                                {tag}
                            </div>
                        )
                    })}
                </div>
            </section>
            <section className="quiz-front-page__quiz-rating">
                <h3 className="header-3-sm">Rating</h3>
                {quizRating > 0 ? (
                    <div className="quiz-front-page__quiz-rating__container">
                        {Array.from({ length: quizRating }, (_, i) => (
                            <img key={`star-${i + 1}`} src={ goldenStar } alt="Golden Star" />
                        ))}
                    </div>
                ) :
                (
                    <p>Not rated yet</p>
                )}
            </section>
            <div className="quiz-front-page__stats">
                <div className="quiz-front-page__stats__container">
                    <p className="bold">Times completed:</p>
                    <p>{ quiz.times_completed }</p>
                </div>
                <div className="quiz-front-page__stats__container">
                    <p className="bold">Average score:</p>
                    <p>{ quizScore.avg_score ? `${quizScore.avg_score}%` : 0 }</p>
                </div>
                <div className="quiz-front-page__stats__container">
                    <p className="bold">Highest score:</p>
                    <p>{ quizScore.highest_score ? `${quizScore.highest_score}%` : 0 }</p>
                </div>
            </div>
            <div className="quiz-front-page__start-button">
                <button 
                    className="button--large--emerald-dark quiz-front-page__start-quiz-button"
                    onClick={ () => handleCurrentPage("takeQuiz") }
                    >Start Quiz
                </button>
            </div>
            <section className="quiz-front-page__comments">
                <h3 className="header-3-sm">Comments</h3>
                { loading ? (
                    <div>Loading comments...</div>
                ) : (
                    <div className="quiz-front-page__comments__container">
                        { comments.map((comm, index) => {
                            if (index < displayedComments) {
                                return (
                                    <div 
                                        key={`comment-${index}`}
                                        className="quiz-front-page__comments__comment"
                                    >
                                        <div className="quiz-front-page__comments__comment__top">
                                            <p className="bold">{ comm.user }</p>
                                            <p>{ comm.date }</p>
                                            <p>{ comm.time }</p>
                                        </div>
                                        <hr className="divider"/>
                                        <p>{comm.text}</p>
                                    </div>
                                )
                            }
                        }) }
                    </div>
                )}
                { comments.length > displayedComments ? (
                    <button
                        className="button--small--neutral-dark"
                        onClick={ () => increaseDisplayedComments() }
                    >Show More
                    </button>
                ) : (
                    <p>No one left a comment yet.</p>
                )}
            </section>
            <section className="quiz-front-page__add-comment">
                <h3 className="header-3-sm">Add comment</h3>
                { isAuthenticated ? (
                    <form className="form quiz-front-page__add-comment__form" onSubmit={ submitComment }>
                        <div className="form-input quiz-front-page__add-comment__form__input-container">
                            <label className="form-input__label" htmlFor="comment">Comment</label>
                            <textarea 
                                onChange={ handleCommentChange }
                                className="form-input__textarea" 
                                name="comment" 
                                id="comment"
                                value={ comment }
                                placeholder="Write your comment here"
                                >
                            </textarea>
                            {commentError && <p style={{ color: 'red' }}>{ commentError }</p>}
                        </div>
                        <button className="form__submit-question-button button--small--fuchsia-dark " type="submit">Submit</button>
                    </form>
                ) : (
                    <p className="bold">You must be logged in to leave a comment.</p>
                )}
            </section>
        </section>
    );
};



export default QuizFrontPage;
