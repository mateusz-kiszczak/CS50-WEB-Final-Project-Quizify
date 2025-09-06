import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import DashboardYourQuizzes from '../components/DashboardYourQuizzes';
import DashboardTakenQuizzes from '../components/DashboardTakenQuizzes';
import DashboardAccount from '../components/DashboardAccount';
import DashboardPassword from '../components/DashboardPassword';
import DashboardDeleteAccount from '../components/DashboardDeleteAccount';

import arrowDownWhite from '../assets/arrow-down-white-icon.svg';
import userIcon from '../assets/user-icon.svg';



const DashboardPage = () => {
    // Variables

    // Page navigation.
    const pages = [
        {
            page: 'yourQuizzes',
            text: 'Your Quizzes'
        },
        {
            page: 'takenQuizzes',
            text: 'Taken Quizzes'
        },
        {
            page: 'account',
            text: 'Account'
        },
        {
            page: 'password',
            text: 'Password'
        },
        {
            page: 'deleteAccount',
            text: 'Delete Account'
        },
    ]

    // Device breakpoints.
    const tablet = 768;
    const backendBaseURL = 'http://localhost:8000';
    const { isAuthenticated, loading, user, api, handleContextSetUser } = useAuth();
    const navigate = useNavigate();


    // Refs
    const navButtonElement = useRef(null);

    // States
    const [currentPage, setCurrentPage] = useState('yourQuizzes');
    const [currentPageText, setCurrentPageText] = useState('yourQuizzes');
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [isNavOpened, setIsNavOpened] = useState(false);
    const [navPosition, setNavPosition] = useState({});


    // Effects
    
    // Get nav "links".
    useEffect(() => {
        const pageText = pages.find(p => p.page === currentPage).text;

        setCurrentPageText(pageText);

        // Close dashboard navigation when page changes.
        if (isNavOpened) setIsNavOpened(false);
    }, [currentPage]);

    // Update screen dimentions.
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);

            // Close dashboard navigation if opened.
            if (isNavOpened) setIsNavOpened(false);
        };

        window.addEventListener("resize", handleResize);
        
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Update nav position.
    useEffect(() => {
        if (navButtonElement.current && navButtonElement.current !== null) {
            // Update navPosition.
            const rect = navButtonElement.current.getBoundingClientRect() ?? false;
            
            setNavPosition({
                heigth: (rect.bottom - rect.top + 16),
            })
        }
    }, [navButtonElement.current]);


    // Functions
    const handleCurrentPageChange = pageName => {
        if (pageName === currentPage) {
            setIsNavOpened(false)
        } else {
            setCurrentPage(pageName);
        }
    }

    const toggleNav = () => {
        if (isNavOpened) {
            setIsNavOpened(false);
        } else {
            setIsNavOpened(true);
        }
    }

    const renderPage = () => {
        switch (currentPage) {
            case "yourQuizzes":
                return (
                    <DashboardYourQuizzes 
                        loading={ loading }
                        api={ api }
                    />
                )
            
            case "takenQuizzes":
                return (
                    <DashboardTakenQuizzes 
                        loading={ loading }
                        api={ api }
                    />
                )
            
            case "account":
                return (
                    <DashboardAccount 
                        
                    />
                )
            
            case "password":
                return (
                    <DashboardPassword 
                        
                    />
                )
            
            case "deleteAccount":
                return (
                    <DashboardDeleteAccount 
                        handleSetUser={ handleContextSetUser }
                    />
                )
        }
    }


    // Render
    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    if (!isAuthenticated || !user) {
        // Redirect to login if not authenticated
        navigate('/login'); 

        return null;
    }

    return (
        <section className="user-dashboard">
            <header className="user-dashboard__header">
                <div className='user-dashboard__nav'>
                    <button 
                        ref={ navButtonElement }
                        className={`user-dashboard__nav__toggle-button button--small--fuchsia-dark ${isNavOpened ? 'user-dashboard__nav__toggle-button--opened' : ''}`}
                        onClick={ toggleNav }
                        >
                        <p>{ currentPageText }</p>
                        <img src={ arrowDownWhite } alt="White arrow pointed down." />
                    </button>
                    <nav 
                        className={`user-dashboard__nav__buttons ${isNavOpened ? 'user-dashboard__nav__buttons--opened' : ''}`}
                        {...((screenWidth >= tablet) && {style: { 
                            "position": "absolute",
                            "top": `${navPosition.heigth}px`,
                            "right": "0px",
                            "minWidth": "200px"
                        } })}
                    >
                        <div className='user-dashboard__nav__buttons__container'>
                            {pages.map((page) => {
                                if (page.page !== currentPage) {
                                    return (
                                        <button 
                                        key={ page.page }
                                        onClick={ () => handleCurrentPageChange(page.page ) }
                                        >
                                            { page.text }
                                        </button>
                                    )
                                }
                            })}
                        </div>
                    </nav>
                </div>
                <div className='user-dashboard__user'>
                    {user?.avatar_url ? (
                        <img className='user-dashboard__user__avatar' src={`${backendBaseURL}${user.avatar_url}`} alt="" />
                    ) : (
                        <img className='user-dashboard__user__avatar' src={userIcon} alt="" />
                    )}
                    <h1 className='header-1-sm'>{ user.username }</h1>
                </div>
            </header>
            { renderPage() }
        </section>
    );
};



export default DashboardPage;
