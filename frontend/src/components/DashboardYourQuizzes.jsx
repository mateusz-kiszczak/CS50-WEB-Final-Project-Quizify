import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Pagination from '../components/Pagination';

import filterIconBlack from '../assets/filter-icon-black.svg';
import filterIconWhite from '../assets/filter-icon-white.svg';
import sortIconBlack from '../assets/sort-icon-black.svg';
import sortIconWhite from '../assets/sort-icon-white.svg';
import closeIconBlack from '../assets/close-icon-black.svg';
import checkboxChecked from '../assets/checkbox-checked-icon.svg';
import checkboxUnchecked from '../assets/checkbox-unchecked-icon.svg';
import optionChecked from '../assets/option-checked-icon.svg';
import optionUnchecked from '../assets/option-unchecked-icon.svg';

import categoriesList from '../data/categories';



const DashboarYourQuizzes = ({ loading, api, handleCurrentPageChange }) => {
    // Variables
    const sortOptions = [
        {
            value: 'popular',
            label: 'Most popular'
        },
        {
            value: 'newest',
            label: 'Newly added'
        },
        {
            value: 'oldest',
            label: 'Oldest'
        },
        {
            value: 'title_asc',
            label: 'Title A-Z'
        },
        {
            value: 'title_desc',
            label: 'Title Z-A'
        },
        {
            value: 'rating',
            label: 'Top Rated'
        },
    ];


    // Navigates
    const navigate = useNavigate();


    // Params
    const { page } = useParams();


    // States
    const [quizzesCreated, setQuizzesCreated] = useState(null);
    const [totalAttempts, setTotalAttempts] = useState(null);
    const [averageRating, setAverageRating] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [pagination, setPagination] = useState([]);

    const [years, setYears] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);

    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const [activeFilter, setActiveFilter] = useState(false);
    const [activeSort, setActiveSort] = useState(false); 

    const [selectedSort, setSelectedSort] = useState('popular');

    const [deleteQuizAlert, setDeleteQuizAlert] = useState(false);
    const [quizToDeleteId, setQuizToDeleteId] = useState(null);


    // Effects
    
    // Fetch quizzes after the loading is done.
    useEffect(() => {
        if (!loading) {
            fetchQuizzes(selectedYears, selectedCategories, selectedSort);
            setActiveFilter(false);
            setActiveSort(false);
        }
    }, [loading, api, page]);

    useEffect(() => {
        fetchQuizzes(selectedYears, selectedCategories, selectedSort);
    }, [selectedYears, selectedCategories, selectedSort]);

    useEffect(() => {
        // Scroll to top.
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [deleteQuizAlert]);

    // Prevent document from scrolling when alert is visible.
    useEffect(() => {
        document.body.style.overflow = deleteQuizAlert ? "hidden" : "auto";

        return () => document.body.style.overflow = "auto";
    }, [deleteQuizAlert]);

    const fetchQuizzes = async (selectedYears, selectedCategories, selectedSort) => {
        let yearsParams = '';
        let categoriesParams = '';
        let yearsCategariesQuery = '';

        if (selectedYears) {
            yearsParams = selectedYears.map(y => `years=${y}`).join('&');
        }

        if (selectedCategories) {
            categoriesParams = selectedCategories.map(c => `categories=${c}`).join('&');
        }

        if (yearsParams || categoriesParams) {
            yearsCategariesQuery = `${yearsParams}&${categoriesParams}`;
        }

        try {
            const response = await api.get(`dashboard/your-quizzes/${page}?sort=${selectedSort}${yearsCategariesQuery}`);
            setQuizzes(response.data.your_quizzes.quizzes);
            setQuizzesCreated(response.data.your_quizzes.quizzes_created);
            setTotalAttempts(response.data.your_quizzes.total_attempts);
            setAverageRating(response.data.your_quizzes.average_rating)
            setPagination(response.data.pagination);
            if (response.data.filters) {
                setYears(response.data.filters.years);
                setCategories(response.data.filters.categories);
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error.response?.data || error.message);

            // If page not found (Out of range) go to the first page.
            if (error.response.status === 404) {
                navigate({
                    pathname: '/user-dashboard/',
                });
            }

            setQuizzes([]);
            setPagination([]);
        }
    };

    const handleToggleYear = year => {
        // Add year to the list of selected years.
        if (!selectedYears.includes(year)) {
            setSelectedYears(selectedYears => [...selectedYears, year]);
        // Else if year in the list, remove it from the list.
        } else {
            const updatedSelectedYears = selectedYears.filter(y => y !== year);
            setSelectedYears(updatedSelectedYears);
        }
    };

    const cleanSelectedYear = () => {
        setSelectedYears([]);
    };

    const handleToggleCategory = category => {
        // Add year to the list of selected years.
        if (!selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories => [...selectedCategories, category]);
        // Else if year in the list, remove it from the list.
        } else {
            const updatedSelectedCategories = selectedCategories.filter(c => c !== category);
            setSelectedCategories(updatedSelectedCategories);
        }
    };

    const cleanSelectedCategories = () => {
        setSelectedCategories([]);
    };

    const toggleFilter = () => {
        if (activeFilter) {
            setActiveFilter(false);
        } else {
            setActiveFilter(true);
            setActiveSort(false);
        }
    };

    const toggleSort = () => {
        if (activeSort) {
            setActiveSort(false);
        } else {
            setActiveSort(true);
            setActiveFilter(false);
        }
    };

    const getCategoryText = categoryName => {
        const category = categoriesList.find(c => c.name === categoryName);

        return category ? category.text : null;
    };

    const handleSortChange = option => {
        setSelectedSort(option);
    };

    const handleShowDeleteQuizAlert = () => {
        if (deleteQuizAlert) {
            setDeleteQuizAlert(false);
            handleQuizToDeleteId();
        } else {
            setDeleteQuizAlert(true);
        }
    };

    const handleQuizToDeleteId = (quizId) => {
        if (quizId) {
            setQuizToDeleteId(quizId);
        } else {
            setQuizToDeleteId(null);
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        setDeleteQuizAlert(false);

        try {
            const response = await api.delete(`/dashboard/delete-quiz/${quizId}`);

            fetchQuizzes(selectedYears, selectedCategories, selectedSort);

        } catch (error) {
            console.error('Failed to delete quiz:', error);
        }
    };


    // Render
    return (
        <>
            <section className="user-dashboard__stats">
                <p>Active quizzes: <span>{ quizzesCreated ?? 0 }</span></p>
                <p>Times all quizzes taken: <span>{ totalAttempts ?? 0 }</span></p>
                <p>Average rating of all quizzes: <span>{ averageRating ?? 0 }/5</span></p>
            </section>

            { quizzes?.length > 0 && (
                <hr className='divider--no-margin' />
            )}

            <section className='user-dashboard__quiz-list'>
                {loading && (
                    <p>Loading quizzes...</p>
                )}
                <div className='sort-and-filter'>
                    { quizzes?.length > 0 && (
                        <div className='sort-and-filter__buttons'>
                            <button 
                                className={ activeFilter ? 'sort-filter-button--active' : 'sort-filter-button' }
                                onClick={ toggleFilter }
                            >
                                <img src={ activeFilter ? filterIconWhite : filterIconBlack } alt="Filter items icon. Three lines in vertical order shrinking to the bottom." />
                                <p>Filter</p>
                            </button>
                                <button 
                                    className={ activeSort ? 'sort-filter-button--active' : 'sort-filter-button' }
                                    onClick={ toggleSort }
                                >
                                    <img src={ activeSort ? sortIconWhite : sortIconBlack } alt="Sort items icon. Two arrows in opposite direcetion next to each other." />
                                    <p>Sort</p>
                                </button>
                        </div>
                    )}

                    { (quizzes?.length > 0 && activeFilter) && (
                        <div className='sort-and-filter__filter'>
                            <section className='sort-and-filter__filter__top'>
                                <h4>Filter</h4>
                                <button onClick={ toggleFilter }>
                                    <img src={ closeIconBlack } alt="Black x." />
                                </button>
                            </section>
                            <hr className='divider divider--filters' />
                            <section className='sort-and-filter__filter__year'>
                                <h5>Year</h5>
                                <div className='sort-and-filter__filter__year__checkboxes'>
                                    <div className='sort-and-filter__filter__year__checkbox'>
                                        <button className='sort-and-filter__filter__year__checkbox__box' onClick={ cleanSelectedYear }>
                                            <img src={ !selectedYears.length ? checkboxChecked : checkboxUnchecked } alt={ !selectedYears.length ? 'Selected checkbox' : 'Empty checkbox' } />
                                        </button>
                                        <p className={`sort-and-filter__filter__year__checkbox__text ${!selectedYears.length ? 'bold' : ''}`}>all</p>
                                    </div>
                                    { years.map((year) => {
                                        return (
                                            <div className='sort-and-filter__filter__year__checkbox' key={ `year-${year}` }>
                                                <button 
                                                    className='sort-and-filter__filter__year__checkbox__box'
                                                    onClick={ () => handleToggleYear(year) }
                                                >
                                                    <img src={ selectedYears.includes(year) ? checkboxChecked : checkboxUnchecked } alt={ selectedYears.includes(year) ? 'Selected checkbox' : 'Empty checkbox' } />
                                                </button>
                                                <p className={`sort-and-filter__filter__year__checkbox__text ${selectedYears.includes(year) ? 'bold' : ''}`}>
                                                    { year }
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                            <hr className='divider--no-margin' />
                            <section className='sort-and-filter__filter__categories'>
                                <h5>Categories</h5>
                                <div className='sort-and-filter__filter__categories__checkboxes'>
                                    <div className='sort-and-filter__filter__categories__checkbox'>
                                        <button className='sort-and-filter__filter__categories__checkbox__box' onClick={ cleanSelectedCategories }>
                                            <img src={ !selectedCategories.length ? checkboxChecked : checkboxUnchecked } alt={ !selectedCategories.length ? 'Selected checkbox' : 'Empty checkbox' } />
                                        </button>
                                        <p className={`sort-and-filter__filter__categories__checkbox__text ${!selectedCategories.length ? 'bold' : ''}`}>all</p>
                                    </div>
                                    { categories.map((category) => {
                                        return (
                                            <div className='sort-and-filter__filter__categories__checkbox' key={ `category-${category}` }>
                                                <button 
                                                    className='sort-and-filter__filter__categories__checkbox__box'
                                                    onClick={ () => handleToggleCategory(category) }
                                                >
                                                    <img src={ selectedCategories.includes(category) ? checkboxChecked : checkboxUnchecked } alt={ selectedCategories.includes(category) ? 'Selected checkbox' : 'Empty checkbox' } />
                                                </button>
                                                <p className={`sort-and-filter__filter__categories__checkbox__text ${selectedCategories.includes(category) ? 'bold' : ''}`}>
                                                    { getCategoryText(category) }
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>
                    )}

                    { (quizzes?.length > 0 && activeSort) && (
                        <div className={'sort-and-filter__sort'}>
                            <section className='sort-and-filter__sort__top'>
                                <h4>Sort</h4>
                                <button onClick={ toggleSort }>
                                    <img src={ closeIconBlack } alt="Black x." />
                                </button>
                            </section>
                            <hr className='divider divider--sort'/>
                            <div className='sort-and-filter__sort__select'>
                                { sortOptions.map((option) => {
                                    return (
                                        <div key={`sort-${option.value}`} className='sort-and-filter__sort__select__option'>
                                            <button className='sort-and-filter__sort__select__option__box' onClick={ () => handleSortChange(option.value) }>
                                                <img src={ option.value === selectedSort ? optionChecked : optionUnchecked } alt={ option.value === selectedSort ? 'Selected sort option' : 'Empty option box' } />
                                            </button>
                                            <p className={`sort-and-filter__sort__select__option__text ${option.value === selectedSort ? 'bold' : ''}`}>
                                                { option.label }
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className='user-dashboard__tiles-container'>
                    { quizzes.map((quiz, index) => {
                        return (
                            <>
                                <section 
                                    key={`quiz-${index + 1}`}
                                    className="user-dashboard__tiles-container__tile"
                                >
                                    <h2 className="header-2-sm">{`${(pagination.page - 1) * pagination.items_per_page + (index + 1)}. ${quiz.title}`}</h2>
                                    <div className="user-dashboard__tiles-container__tile__info">
                                        <div className="user-dashboard__tiles-container__tile__info__stats">
                                            <p>Last time taken: <span>{quiz.last_taken}</span></p>
                                            <p>Times taken: <span>{quiz.times_taken}</span></p>
                                            <p>Rating: <span>{quiz.rating}/5</span></p>
                                            <p>Average Score: <span>{quiz.avg_score}%</span></p>
                                            <p>Best Score: <span>{quiz.best_score}%</span></p>
                                        </div>
                                        <hr className='divider--no-margin' />
                                        <div className="user-dashboard__tiles-container__tile__info__buttons--your-quizzes">
                                            <Link to={`/user-dashboard/edit-quiz/${quiz.id}`}>
                                                <button className="button--large--emerald-dark user-dashboard__tiles-container__tile__info__button">Edit Quiz</button>
                                            </Link>
                                            <Link to={`/quiz/${quiz.id}`}>
                                                <button className="button--large--neutral-dark user-dashboard__tiles-container__tile__info__button">Go To Quiz
                                                </button>
                                            </Link>
                                            <button 
                                                onClick={ () => {
                                                    handleShowDeleteQuizAlert();
                                                    handleQuizToDeleteId(quiz.id);
                                                } }
                                                className="button--large--rose-dark user-dashboard__tiles-container__tile__info__button"
                                            >Delete Quiz
                                            </button>
                                        </div>
                                    </div>
                                </section>

                            </>
                        )
                    }
                )}
                { deleteQuizAlert && (
                    <div className='create-quiz__alert-wrapper'>
                        <div className='create-quiz__alert'>
                            <h2 className='create-quiz__alert__header'>Are you sure, you want to permanently delete this quiz?</h2>
                            <div className='create-quiz__alert__text-container'>
                                <p className='create-quiz__alert__text'>This action will remove your quiz.</p>
                                <p className='create-quiz__alert__text'>Changes after deleting a quiz are not reversable.</p>
                            </div>
                            <div className='create-quiz__alert__buttons'>
                                <button 
                                    className='create-quiz__alert__buttons_button button--medium--rose-dark'
                                    onClick={ () => handleDeleteQuiz(quizToDeleteId) }
                                >
                                Delete Quiz
                                </button>
                                <button 
                                    className='create-quiz__alert__buttons_button button--medium--emerald-dark' 
                                    onClick={ handleShowDeleteQuizAlert }>
                                Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                </div>
                <Pagination 
                    paginationData={ pagination } 
                    queryBaseUrl={ '/user-dashboard/' }
                />
            </section>
        </>
    );
};



export default DashboarYourQuizzes;
