import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, createSearchParams, useParams, useSearchParams } from "react-router-dom";

import QuizTile from '../components/QuizTile';
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



const QuizListPage = () => {
    // Variables
    const sortOptions = [
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


    // Auths
    const { loading, api } = useAuth();


    // Params
    const { page } = useParams();
    const [searchParams] = useSearchParams();
    const search = searchParams.get('search');


    // States
    const [quizzes, setQuizzes] = useState([]);
    const [pagination, setPagination] = useState([]);

    const [years, setYears] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);

    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const [searchInput, setSearchInput] = useState('');
    const [header, setHeader] = useState('Getting results...');

    const [activeFilter, setActiveFilter] = useState(false);
    const [activeSort, setActiveSort] = useState(false); 

    const [selectedSort, setSelectedSort] = useState('newest');


    // Effects

    // Fetch quizzes after the loading is done.
    useEffect(() => {
        if (!loading) {
            fetchQuizzes(selectedYears, selectedCategories, selectedSort);
            setActiveFilter(false);
            setActiveSort(false);
        }
    }, [loading, api, page, search]);

    useEffect(() => {
        fetchQuizzes(selectedYears, selectedCategories, selectedSort);
    }, [selectedYears, selectedCategories, selectedSort]);

    // Show the header after the loading is done.
    // It makes sure no unwanted values like undefined are displayed during the loading and fetching.
    useEffect(() => {
        if (!loading && pagination.total_items !== undefined) {
            if (!search) {
                setHeader(`Shows all the quizzes. Total: ${pagination.total_items}`);

                return;
            }

            setHeader(`${ pagination.total_items } Results for: "${search}"`);
        }
    }, [loading, api, page, search, pagination]);


    // Functions
    const handleChange = (e) => {
        const s = e.target.value;

        setSearchInput(s);
    }
    
    const handleSearchSubmit = () => {
        navigate({
            pathname: '/quizzes/1',
            search: `?${createSearchParams({ searchInput })}`,
        });
    }

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
            const response = await api.get(`quizzes/get-all/${page}?search=${search}&sort=${selectedSort}${yearsCategariesQuery}`);
            setQuizzes(response.data.quizzes);
            setPagination(response.data.pagination)
            setYears(response.data.years);
            setCategories(response.data.categories);
        } catch (error) {
            console.error('Error fetching quizzes:', error.response?.data || error.message);

            // If page not found (Out of range) go to the first page.
            if (error.response.status === 404) {
                navigate({
                    pathname: '/quizzes/1',
                    search: `?${createSearchParams({ search })}`,
                });
            }

            setQuizzes([]);
            setPagination([]);
        }
    }

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
    }

    const getCategoryText = categoryName => {
        const category = categoriesList.find(c => c.name === categoryName);

        return category ? category.text : null;
    };

    const handleSortChange = option => {
        setSelectedSort(option);
    };

    const handleSubscribe = () => {
        return;
    }


    // Render
    return (
        <div>
            <header className='quiz-list-page__header'>
                <form onSubmit={ handleSearchSubmit } noValidate className='quiz-list-page__search-form'>
                    <input type="search" name="search" placeholder='Searching Phrase' className='quiz-list-page__search-form__input' onChange={ handleChange }/>
                    <button type="submit" className='quiz-list-page__search-form__button button--medium--amber-dark'>Search</button>
                </form>
            </header>
            <section className='quiz-list-page__section'>
                <h1 className='header-1-sm'>{ header }</h1>
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
                                    {years.map((year) => {
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
                            <hr className='divider' />
                            <section className='sort-and-filter__filter__categories'>
                                <h5>Categories</h5>
                                <div className='sort-and-filter__filter__categories__checkboxes'>
                                    <div className='sort-and-filter__filter__categories__checkbox'>
                                        <button className='sort-and-filter__filter__categories__checkbox__box' onClick={ cleanSelectedCategories }>
                                            <img src={ !selectedCategories.length ? checkboxChecked : checkboxUnchecked } alt={ !selectedCategories.length ? 'Selected checkbox' : 'Empty checkbox' } />
                                        </button>
                                        <p className={`sort-and-filter__filter__categories__checkbox__text ${!selectedCategories.length ? 'bold' : ''}`}>all</p>
                                    </div>
                                    {categories.map((category) => {
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
                                {sortOptions.map((option) => {
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

                { quizzes?.length > 0 && (
                    <hr className='divider' />
                )}

                <div className='quiz-tiles-container'>
                    {quizzes.map((quiz) => {
                        return (
                            <QuizTile key={`quiz-${quiz.id}`} quizData={ quiz } />
                        )
                    }
                )}
                </div>
                <Pagination 
                    paginationData={ pagination } 
                    queryBaseUrl={ '/quizzes/' }
                    search={ search }
                />
            </section>
            <section className='quiz-list__subscribe'>
                <h2>Subscribe</h2>
                <form onSubmit={ handleSubscribe } noValidate className='home-page__search-form'>
                    <input type="search" name="search" placeholder='Enter your email' className='home-page__search-form__input'/>
                    <button type="submit" className='home-page__search-form__button button--medium--emerald-dark'>Subscribe</button>
                </form>
            </section>
        </div>
    );
};



export default QuizListPage;
