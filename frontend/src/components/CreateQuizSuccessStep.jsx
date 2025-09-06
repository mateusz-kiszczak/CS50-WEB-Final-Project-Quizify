import React from "react";
import { Link } from "react-router-dom";



const CreateQuizSuccessStep = ({ nextStep, handleNextStep, handleCurrentStep }) => {
    // Functions
    const handleCreateNextQuiz = (e) => {
        e.preventDefault()

        handleNextStep(nextStep);
        handleCurrentStep("general");
    }


    // Render
    return (
        <section className="create-quiz__success">
            <h1 className="header-1-sm">Quiz was created successfully!</h1>
            <p className="create-quiz__success__text">Your quiz is now available for to other users.</p>
            <section className="create-quiz__next-step">
                <h2 className="header-2-sm">What would you like to do next?</h2>
                <div className="create-quiz__next-step__buttons">
                    <button type="button" onClick={ handleCreateNextQuiz } className="button--large--fuchsia-dark">Create next quiz</button>
                    <Link to="/" className="button--large--sky-dark">Go to Home Page</Link>
                    <Link to="/user-dashboard" className="button--large--sky-dark">Visit my dashboard</Link>
                </div>
            </section>
        </section>
    );
};



export default CreateQuizSuccessStep;
