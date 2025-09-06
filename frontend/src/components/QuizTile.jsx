import React from "react";
import { Link } from 'react-router-dom';

import noImageLightGrey from '../assets/no-image-light-grey.svg';
import goldenStar from "../assets/star-gold.svg";



const QuizTile = ({ quizData, loadMore }) => {
    // Variables
    const backendBaseURL = 'http://localhost:8000';

    
    // Functions
    const shorterString = (str, length) => {
        const strLength = str.length;

        if (strLength > 100) {
            let newStr = str.substring(0, length).trim() + "...";

            return newStr;
        }

        return str;
    };

    // Render
    return (
        <div className="quiz-tile" style={loadMore ? {'display':'none'} : {}}>
            <div className="quiz-tile__content-container">
                {quizData?.quiz_image_url && (
                    <div className="quiz-tile__image">
                        <img src={ `${backendBaseURL}${quizData.quiz_image_url}` } alt={ quizData.title } />
                    </div>
                )}
                {!quizData.quiz_image_url && (
                    <div className="quiz-tile__image--no-image">
                        <p>No Image Available</p>
                        <img src={ noImageLightGrey } alt="No image availible" />
                    </div>
                )}
                <h3>{ shorterString(quizData?.title, 100) }</h3>
                { quizData.description !== 'null' && (
                    <p>{ shorterString(quizData?.description, 100) }</p>
                )}
                <div className="quiz-tile__rating">
                    <h3>Rating</h3>
                    {quizData?.avg_rating && (
                        <div className="quiz-tile__rating-stars">
                            {Array.from({ length: quizData.avg_rating }, (_, i) => (
                                <img key={`star-${i + 1}`} src={ goldenStar } alt="Golden Star" />
                            ))}
                        </div>
                    )}
                    {!quizData.avg_rating && (
                        <p>Not rated yet</p>
                    )}
                </div>
            </div>
            <Link to={`/quiz/${quizData.id}`}>
                <button className="quiz-tile__button button--medium--emerald-dark">Open Quiz</button>
            </Link>
        </div>
    );
};



export default QuizTile;
