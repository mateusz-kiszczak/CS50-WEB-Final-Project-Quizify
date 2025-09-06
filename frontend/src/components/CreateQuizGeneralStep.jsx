import React, { useEffect, useState } from 'react';

import categories from '../data/categories';
import badWords from '../data/bad_words';

import removeIcon from '../assets/x-icon-white.svg';



const CreateQuizGeneralStep = ({ formData, setFormData, nextStep, handleNextStep, handleCurrentStep, formCleaned, setFormCleaned }) => {
    // States
    const [generalFormData, setGeneralFormData] = useState({
        title: formData.title,
        description: formData.description,
        created_by: formData.created_by,
        category: formData.category,
        tags: formData.tags,
        quiz_image: formData.quiz_image,
        quiz_time_limit: formData.quiz_time_limit,
        quiz_timer: formData.quiz_timer,
        random_questions_order: formData.random_questions_order,
        random_answers_order: formData.random_answers_order,
    });

    const [generalMainErrorAlert, setGeneralMainErrorAlert] = useState('');
    const [generalErrors, setGeneralErrors] = useState({});
    const [generalTags, setGeneralTags] = useState(formData.tags);
    const [tag, setTag] = useState('');
    const [quizTimerMinutes, setQuizTimerMinutes] = useState(0);
    const [quizTimerSeconds, setQuizTimerSeconds] = useState(0);


    // Effects

    // Clean repeat tag error when any tag is removed from the list.
    useEffect(() => {
        setGeneralErrors( prev => ({ ...prev, 'tags': null }));
    }, [generalTags]);

    //  Reset quiz timer values to zero, when timer is off.
    useEffect(() => {
        if (!generalFormData.quiz_timer) {
            setQuizTimerMinutes(0);
            setQuizTimerSeconds(0);
            setGeneralFormData({ ...generalFormData, 'quiz_time_limit': null });
        }
    }, [generalFormData.quiz_timer]);

    // Set quiz time limit on minutes and seconds input change.
    useEffect(() => {
        let quizTimeLimit = parseInt(quizTimerSeconds) + (parseInt(quizTimerMinutes) * 60);

        if (quizTimerSeconds > 59 || quizTimerSeconds < 0) {
            setQuizTimerSeconds(0);
        }

        if (quizTimerMinutes > 300 || quizTimeLimit > 18000) {
            setQuizTimerMinutes(300);
            setQuizTimerSeconds(0);
        }

        if (quizTimerMinutes < 0) {
            setQuizTimerMinutes(0);
            setQuizTimerSeconds(0);
        }

        if (quizTimeLimit) {
            setGeneralFormData({ ...generalFormData, 'quiz_time_limit': quizTimeLimit });
        } else {
            setGeneralFormData({ ...generalFormData, 'quiz_time_limit': null });
        }

    }, [quizTimerSeconds, quizTimerMinutes]);

    // Set a quiz time limit from parent state when first time render.
    useEffect(() => {
        if (generalFormData.quiz_time_limit > 0) {
            let minutes = Math.trunc(generalFormData.quiz_time_limit / 60);
            let seconds = generalFormData.quiz_time_limit % 60;

            setQuizTimerMinutes(minutes);
            setQuizTimerSeconds(seconds);
        }
    }, []);

    // Handle next step form.
    useEffect(() => {
        if (nextStep && nextStep !== "general") {
            submitGeneralForm();
        }
    }, [nextStep]);

    // Reset all values if form was cleaned.
    useEffect(() => {
        if (formCleaned) {
            setGeneralFormData({
                title: formData.title,
                description: formData.description,
                created_by: formData.created_by,
                category: formData.category,
                tags: formData.tags,
                quiz_image: formData.quiz_image,
                quiz_time_limit: formData.quiz_time_limit,
                quiz_timer: formData.quiz_timer,
                random_questions_order: formData.random_questions_order,
                random_answers_order: formData.random_answers_order,
            });
            setGeneralTags([]);
            setFormCleaned(false);
        }
    }, [formCleaned]);


    // Functions
    const handleQuizTimerFocus = (e) => {
        const {name, value} = e.target;

        if (name === 'quiz_timer_minutes' && (!value || value == 0)) {
            setQuizTimerMinutes('');
        }

        if (e.target.name === 'quiz_timer_seconds' && (!value || value == 0)) {
            setQuizTimerSeconds('');
        }
    };

    const handleQuizTimerBlur = (e) => {
        const {name, value} = e.target;

        if (name === 'quiz_timer_minutes' && value === '') {
            setQuizTimerMinutes(0);
        }

        if (name === 'quiz_timer_seconds' && value === '') {
            setQuizTimerSeconds(0);
        }
    };

    const handleCheckboxChange = (e) => {
        const {name, checked} = e.target;

        if (name === 'random_questions_order') {
            setGeneralFormData({ ...generalFormData, [name]: checked });
        }

        if (name === 'random_answers_order') {
            setGeneralFormData({ ...generalFormData, [name]: checked });
        }

        if (name === 'quiz_timer') {
            setGeneralFormData({ ...generalFormData, [name]: checked });
        }
    };

    const handleGeneralChange = (e) => {
        const {name, value, files} = e.target;

        if (name === 'tags') {
            // When set a tag remove all the special characters appart from hyphen.
            setTag(value.replace(/[^a-zA-Z0-9\- ]/g, ''));
        }

        if (name === 'quiz_image') {
            setGeneralFormData({ ...generalFormData, quiz_image: files[0] });
        } else {
            setGeneralFormData({ ...generalFormData, [name]: value });
        }

        setGeneralErrors( prev => ({ ...prev, [name]: null}));
        setGeneralMainErrorAlert('');
    };

    const handleAddTag = (e) => {
        e.preventDefault();

        // Checks if tag already exists in the list before adding.
        if (generalTags && generalTags.includes(tag)) {
            setGeneralErrors( prev => ({ ...prev, 'tags': 'This tag already exists.' }));

            return;
        }

        // Checks if a tag is not vulgar.
        if (badWords.includes(tag)) {
            setGeneralErrors( prev => ({ ...prev, 'tags': 'This tag is inappropriate.' }));

            return;
        }

        if (tag) {
            let tagLowerCase = tag.toLocaleLowerCase();

            // Add tag to the list.
            setGeneralTags([...generalTags, tagLowerCase]);

            // Clean the tag input.
            setTag('');
            e.target.value = '';
        } else {
            setGeneralErrors( prev => ({ ...prev, 'tags': 'Tag can NOT be empty.' }));
        }
    };
    
    const handleRemoveTag = (tag) => {
        setGeneralTags(generalTags.filter((item) => item !== tag));
    };

    const handleQuizTimerChange = (e) => {
        const {name, value} = e.target;

        if (name === 'quiz_timer_minutes') {
            setQuizTimerMinutes(value);
        }

        if (name === 'quiz_timer_seconds') {
            setQuizTimerSeconds(value);
        }
    };

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

    // Remove all the timers in every question.
    const removeQuestionsTimer = () => {
        if (generalFormData.quiz_timer && generalFormData.quiz_time_limit > 0) {
            let updatedQuestions = [ ...formData.questions ];

            updatedQuestions = updatedQuestions.map(question => ({
                ...question,
                question_timer: false,
                question_time_limit: null
            }));

            setFormData(prev => ({ ...prev, 'questions': updatedQuestions }));
        }
    };

    const validateGeneralForm = () => {
        let tempErrors = {};

        if (generalFormData.title.length > 250) {
            tempErrors.title = 'Title can NOT be longer than 250 characters';
        }

        if (generalFormData.title.length < 3) {
            tempErrors.title = 'Title must be at least 3 characters long.';
        }

        if (generalFormData.title.length <= 250 && generalFormData.title.length >= 3 && checksWordsInString(generalFormData.title, badWords)) {
            tempErrors.title = 'Title contains an inappropriate word!';
        }

        if (generalFormData.description.length > 1000) {
            tempErrors.description = 'Description can NOT be longer than 1000 characters.';
        } else if (checksWordsInString(generalFormData.description, badWords)) {
            tempErrors.description = 'Description contains an inappropriate word!';
        }

        if (generalTags.length < 3) {
            tempErrors.tags = 'Please Provide at least 3 tags';
        }

        if (generalTags.length > 10) {
            tempErrors.tags = 'Maximum 10 tags. Please remove some tags from your list.';
        }

        if (!generalFormData.title) tempErrors.title = 'Quiz title is required.';
        if (!generalFormData.category) tempErrors.category = 'Category is required.';

        if (generalFormData.quiz_timer) {
            let minutes = parseInt(quizTimerMinutes);
            let seconds =  parseInt(quizTimerSeconds);

            if (seconds + (minutes * 60) > 18000) {
                tempErrors.quiz_timer = 'Quiz can NOT be longer than 5 hours (300 min.).';
            }
        }

        setGeneralErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    const submitGeneralForm = () => {
        setGeneralErrors({});
        setGeneralMainErrorAlert('');

        // If form has eny errors.
        if (!validateGeneralForm()) {
            setGeneralMainErrorAlert('Please fix the invalid fields.');

            handleNextStep(null);

            return;
        }

        // Set/Update data in parent state.
        // Title
        if (formData.title !== generalFormData.title && generalFormData.title) {
            setFormData( prev => ({ ...prev, 'title': generalFormData.title }));
        }

        // Description
        if (formData.description !== generalFormData.description) {
            setFormData( prev => ({ ...prev, 'description': generalFormData.description }));
        }

        // Category
        if (formData.category !== generalFormData.category && generalFormData.category) {
            setFormData( prev => ({ ...prev, 'category': generalFormData.category }));
        }

        // Tags
        if (formData.tags !== generalTags && generalTags.length > 0) {
            setFormData( prev => ({ ...prev, 'tags': generalTags }));
        }

        // Quiz Image
        if (formData.quiz_image !== generalFormData.quiz_image) {
            setFormData( prev => ({ ...prev, 'quiz_image': generalFormData.quiz_image }));
        }

        // Quiz Time Limit
        if (!generalFormData.quiz_timer) {
            setFormData( prev => ({ ...prev, 'quiz_time_limit': null }));
        }

        if (formData.quiz_time_limit !== generalFormData.quiz_time_limit) {
            setFormData( prev => ({ ...prev, 'quiz_time_limit': generalFormData.quiz_time_limit }));
        }

        // Quiz Timer
        if (generalFormData.quiz_time_limit === 0 || generalFormData.quiz_time_limit === null || !generalFormData.quiz_time_limit) {
            setFormData( prev => ({ ...prev, 'quiz_timer': false }));
        }

        if (generalFormData.quiz_timer && !generalFormData.quiz_time_limit) {
            setFormData( prev => ({ ...prev, 'quiz_timer': false }));
        }

        if (formData.quiz_timer !== generalFormData.quiz_timer) {
            setFormData( prev => ({ ...prev, 'quiz_timer': generalFormData.quiz_timer }));
        }

        // If Quiz Timer exists, reset all the questions timers.
        removeQuestionsTimer();

        // Random Questions
        if (formData.random_questions_order !== generalFormData.random_questions_order) {
            setFormData( prev => ({ ...prev, 'random_questions_order': generalFormData.random_questions_order }));
        }

        // Random Answers
        if (formData.random_answers_order !== generalFormData.random_answers_order) {
            setFormData( prev => ({ ...prev, 'random_answers_order': generalFormData.random_answers_order }));
        }
        
        // Set next form step.
        handleCurrentStep(nextStep);
        // Reset next step state.
        handleNextStep(null);
    };


    // Render
    return (
        <div className='form'>
            {generalMainErrorAlert && 
                <div className='form-main-alert'>
                    <p className='bold'>{ generalMainErrorAlert }</p>
                    <ul>
                    { 
                        Object.entries(generalErrors).map(([key, value]) => (
                            <li key={key}>{value}</li>
                        ))
                    }
                    </ul>
                </div>
            }
            <h2 className='header-2-sm'>General</h2>
            <div className='form-input'>
                <label className='form-input__label' htmlFor='title'>Title <span className='required-star'>*</span></label>
                <input 
                    className='form-input__input' 
                    type='text'
                    name='title'
                    maxLength='250'
                    id='title'
                    value={ generalFormData.title }
                    onChange={ handleGeneralChange }
                    placeholder='Quiz title'
                    required
                />
                {generalErrors.title && (
                    <p className='form-input__hint--invalid'>{ generalErrors.title }</p>
                )}
            </div>

            <div className='form-input'>
                <label className='form-input__label' htmlFor='description'>Description</label>
                <textarea 
                    className='form-input__textarea' 
                    type='text'
                    name='description'
                    maxLength='1000'
                    id='description'
                    value={ generalFormData.description }
                    onChange={ handleGeneralChange }
                    placeholder='Description'
                />
                <p className='form-input__hint'>Max 1000 characters.</p>
                {generalErrors.description && (
                    <p className='form-input__hint--invalid'>{ generalErrors.description }</p>
                )}
            </div>

            <div className='form-input'>
                <label className='form-input__label' htmlFor='category'>Category <span className='required-star'>*</span></label>
                <select 
                    className='form-input__select' 
                    id="category"
                    name='category'
                    onChange={ handleGeneralChange }
                    required
                >
                    <option value="">Choose category</option>

                    {categories.map((category) => (
                        <option key={category.name} value={category.name}>
                            {category.text}
                        </option>
                    ))}
                </select>
                {generalErrors.category && (
                    <p className='form-input__hint--invalid'>{ generalErrors.category }</p>
                )}
            </div>

            <div className='form-input--add-container'>
                <label className='form-input--add-container__label' htmlFor="tags">Add Tags <span className='required-star'>*</span></label>
                <div className='form-input--add-container__input-container'>
                    <input 
                        className='form-input--add-container__input'
                        type="text"
                        id="tags"
                        name='tags'
                        value={ tag }
                        onChange={ handleGeneralChange }
                        required
                    />
                    <button 
                        type='button'
                        className='button--small--sky-dark form-input--add-container__input__button'
                        onClick={ handleAddTag }
                    >
                        Add
                    </button>
                </div>
                <p className='form-input__hint'>Add minimum 3 tags and maximum 10 tags.</p>
                {generalErrors?.tags && (
                    <p className='form-input__hint--invalid'>{ generalErrors.tags }</p>
                )}
                {generalTags?.length > 0 && (
                    <div className='form-input--add-container__tags-container'>
                        <p className='form-input--add-container__label'>Tags:</p>
                            <div className='form-input--add-container__tags'>
                                {generalTags.map((tag, index) => (
                                    <button 
                                    type='button'
                                    key={`tag-${index}`} 
                                    className='form-input--add-container__tags__tag'
                                    onClick={ () => handleRemoveTag(tag) }
                                    >
                                        <p>{tag}</p>
                                        <img src={ removeIcon } alt="remove" />
                                    </button>
                                ))}
                            </div>
                        <p className='form-input__hint'>Press a tag to remove it from the list.</p>
                    </div>
                )}
            </div>
            
            <hr className='divider'/>

            <div className='form-input--file-container'>
                <p className='form-input--file__label'>Choose Quiz Image</p>
                <div className='form-input--file button--small--sky-dark'>
                    <label htmlFor='quiz_image'>Browse</label>
                    <input
                        className='button--small--sky-dark'
                        type='file'
                        id='quiz_image'
                        name='quiz_image'
                        accept='image/*'
                        onChange={ handleGeneralChange }
                    />
                </div>
                {generalFormData.quiz_image &&
                    <p>{ generalFormData.quiz_image.name }</p>
                }
                {generalErrors.quiz_image && <p style={{ color: 'red' }}>{generalErrors.quiz_image}</p>}
            </div>
            
            <hr className='divider'/>

            <h3 className='header-3-sm'>Options</h3>
            
            <div className='form-input--checkbox'>
                <label className='switch-button'>
                    <input 
                        type="checkbox" 
                        checked={ generalFormData.random_questions_order }
                        name="random_questions_order" 
                        id="random_questions_order"
                        onChange={ handleCheckboxChange }
                    />
                    <span className='slider'></span>
                </label>
                <p className='form-input--checkbox__label'>Questions Random Order</p>
            </div>

            <div className='form-input--checkbox'>
                <label className='switch-button'>
                    <input 
                        type="checkbox" 
                        checked={ generalFormData.random_answers_order }
                        name="random_answers_order" 
                        id="random_answers_order"
                        onChange={ handleCheckboxChange }
                    />
                    <span className='slider'></span>
                </label>
                <p className='form-input--checkbox__label'>Answers Random Order</p>
            </div>

            <div className='form-input--checkbox'>
                <label className='switch-button'>
                    <input 
                        type="checkbox" 
                        checked={ generalFormData.quiz_timer }
                        name="quiz_timer" 
                        id="quiz_timer"
                        onChange={ handleCheckboxChange }
                    />
                    <span className='slider'></span>
                </label>
                <p className='form-input--checkbox__label'>Quiz Timer</p>
            </div>

            {generalFormData.quiz_timer && <h4 className='header-4-sm'>Set quiz time</h4> }
            
            {generalFormData.quiz_timer && (
                <div className='form'>
                    <div className='form-input'>
                        <label className='form-input__label' htmlFor='quiz_timer_minutes'>Minutes</label>
                        <input 
                            className='form-input__input' 
                            type='number'
                            min='0'
                            max='300'
                            name='quiz_timer_minutes'
                            id='quiz_timer_minutes'
                            value={ quizTimerMinutes }
                            onChange={ handleQuizTimerChange }
                            onFocus={ handleQuizTimerFocus }
                            onBlur={ handleQuizTimerBlur }
                        />
                    </div>
                    <div className='form-input'>
                        <label className='form-input__label' htmlFor='quiz_timer_seconds'>Seconds</label>
                        <input 
                            className='form-input__input' 
                            type='number'
                            min='0'
                            max='60'
                            name='quiz_timer_seconds'
                            id='quiz_timer_seconds'
                            value={ quizTimerSeconds }
                            onChange={ handleQuizTimerChange }
                            onFocus={ handleQuizTimerFocus }
                            onBlur={ handleQuizTimerBlur }
                        />
                        <p className='form-input__hint'>Quiz time can be maximum 300 minutes (5 hours).</p>
                        {generalErrors.quiz_timer && (
                            <p className='form-input__hint--invalid'>{ generalErrors.quiz_timer }</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};



export default CreateQuizGeneralStep;
