import React, { useEffect } from 'react';

import questionTypes from '../data/question_types';
import alphabeth from '../data/alphabeth';

import noImageBlue from '../assets/no-image-blue.svg';



const CreateQuizSummaryStep = ({ formData, nextStep, handleSubmit, handleNextStep, handleCurrentStep, updateEditQuestionIndex }) => {
    // Effects

    // Handle next step form.
    useEffect(() => {
        if (nextStep && nextStep !== "summary") {
            // Set next form step.
            handleCurrentStep(nextStep);
            // Reset next step state.
            handleNextStep(null);
        }
    }, [nextStep]);

    // Reset Edit Question Index.
    useEffect(() => {
        updateEditQuestionIndex(null);
    }, []);


    // Functions
    const handleGeneralEdit = () => {
        // Set next form step.
        handleCurrentStep('general');
        // Reset next step state.
        handleNextStep(null);
    }

    const handleQuestionEdit = (index) => {
        updateEditQuestionIndex(index);
    }


    // Render
    return (
        <div className='form'>
            <h2 className='header-2-sm'>Summary</h2>
            <div className='summary__general'>
                <section className='summary__general__section'>
                    <h3 className='header-4-sm'>Title</h3>
                    <p>{ formData.title }</p>
                </section>
                <section className='summary__general__section'>
                    <h3 className='header-4-sm'>Description</h3>
                    {formData.description && (
                        <p>{ formData.description }</p>
                    )} 
                    {!formData.description && (
                        <p className='no-content'>No description provided.</p>
                    )} 
                </section>
                <section className='summary__general__section'>
                    <h3 className='header-4-sm'>Front Image</h3>
                    <div className='summary__general__front-image-container'>
                        {formData.quiz_image && (
                            <img className='summary__general__front-image__user-image' src={URL.createObjectURL(formData.quiz_image)} alt={`${formData.title} front image.`} />
                        )}
                        {!formData.quiz_image && (
                            <img className='summary__general__front-image__no-image' src={noImageBlue} alt='no image' />
                        )}
                    </div>
                </section>
                <section className='summary__general__section'>
                    <h3 className='header-4-sm'>Tags</h3>
                    <ul className='summary__general__tags'>
                        {formData.tags.map((tag, index) => {
                            return (
                                <li 
                                    className='summary__general__tags__tag'
                                    key={`${index}-${tag}`}
                                >
                                    {tag}
                                </li>
                            )
                        })}
                    </ul>
                </section>
                <section className='summary__general__section'>
                    <h3 className='header-4-sm'>Options</h3>
                    {(formData.quiz_timer || formData.random_questions_order || formData.random_answers_order) && 
                        (
                            <ul>
                                {formData.quiz_timer && (
                                    <li>{`Timer: ${Math.floor(formData.quiz_time_limit / 60)} min. ${formData.quiz_time_limit % 60} sec.`}</li>
                                )}
                                {formData.random_questions_order && (
                                    <li>Questions in random order</li>
                                )}
                                {formData.random_questions_order && (
                                    <li>Answers in random order</li>
                                )}
                            </ul>
                        )}
                        {(!formData.quiz_timer && !formData.random_questions_order && !formData.random_answers_order) && 
                            (
                                <p className='no-content'>No option chosen.</p>
                            )
                        }
                </section>

                <hr className='divider'/>

                <button 
                    type='button'
                    className='button--small--fuchsia-dark create-quiz__summary__edit-button'
                    onClick={ handleGeneralEdit }
                >Edit
                </button>
            </div>

            <hr className='divider'/>
            
            <div className='summary__questions'>
                {formData.questions.map((question, index) => {
                    // Get full names question type
                    let questionTypeText = questionTypes.find(type => type.name === question.type);
                    questionTypeText = questionTypeText.text;

                    return (
                        <section className='summary__questions__section' key={`question-${index + 1}`}>
                            <h3 className='header-3-sm'>{`${index + 1}. ${question.text}`}</h3>
                            <hr className='divider'/>
                            <section className='summary__questions__section__subsection'>
                                <h4 className='header-4-sm'>Question Type</h4>
                                <p>{questionTypeText}</p>
                            </section>
                            <hr className='divider'/>
                            <section className='summary__questions__section__subsection'>
                                <h4 className='header-4-sm'>Answers</h4>
                                <ul className='summary__questions__section__subsection__list'>
                                    {question.answers.map((answer, answerIndex) => {
                                        const answerLetter = alphabeth[answerIndex].toUpperCase();
                                        const isCorrect = answer.correct;
                                        return (
                                            <li 
                                                key={`answer-${answerIndex + 1}-question-${index + 1}`}  
                                                className={ isCorrect ? 'summary__questions__section__subsection__list__item--correct' : ''} 
                                            >
                                                {`${answerLetter}. ${answer.text}`}
                                            </li>
                                        )
                                    })}
                                </ul>
                            </section>
                            <hr className='divider'/>
                            <section className='summary__questions__section__subsection'>
                                <h4 className='header-4-sm'>Options</h4>
                                {(question.question_timer || question.question_image_option) && 
                                    (
                                        <ul>
                                            {question.question_timer && (
                                                <li>{`Timer: ${Math.floor(question.question_time_limit / 60)} min. ${question.question_time_limit % 60} sec.`}</li>
                                            )}
                                            {question.question_image_option && (
                                                <li>{`Question Image: ${question.question_image.name}`}</li>
                                            )}
                                        </ul>

                                    )
                                }

                                {(question.question_image_option && question.question_image) && (
                                    <div className='summary__questions__section__subsection__image-container'>
                                        <img className='summary__questions__section__subsection__image' src={URL.createObjectURL(question.question_image)} alt={`${question.text} front image.`} />
                                    </div>
                                )}

                                {(!question.question_timer && !question.question_image_option) && 
                                    (
                                        <p className='no-content'>No option chosen</p>
                                    )
                                }
                            </section>
                            <hr className='divider'/>
                            <button
                                type='button'
                                className='button--small--fuchsia-dark create-quiz__summary__edit-button'
                                onClick={ () => handleQuestionEdit(index) }
                            >Edit
                            </button>
                        </section>
                    )
                })}
            </div>
        </div>
    );
};



export default CreateQuizSummaryStep;
