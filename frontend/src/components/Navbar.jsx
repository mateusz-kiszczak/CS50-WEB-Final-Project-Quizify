import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation  } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import menu_icon from '../assets/menu-icon.svg';
import close_menu_icon from '../assets/close-menu-icon.svg';
import user_icon from '../assets/user-icon.svg';



const Navbar = () => {
    // Variables
    // Device breakpoints
    const desktop = 1200;
    const backendBaseURL = 'http://localhost:8000';

    // Auth
    const { isAuthenticated, user } = useAuth();


    // Ref
    const navbarRef = useRef(null);


    // Location
    const location = useLocation();


    // States
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    const [navbarBottomPosition, setNavbarBottomPosition] = useState(0);
    const [isNavOpened, setIsNavOpened] = useState(false);
    

    // Functions

    // Scroll to the top of the page when mobile nav is opened.
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


    // Effects

    // Update screen dimentions.
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
            setScreenHeight(window.innerHeight);
        };

        window.addEventListener("resize", handleResize);
        
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Get and set the navbar bottom position.
    useEffect(() => {
        const updateNavbarPosition = () => {
            if (navbarRef.current) {
                const rect = navbarRef.current.getBoundingClientRect();
                setNavbarBottomPosition(rect.bottom);
            }
        };

        updateNavbarPosition();
        window.addEventListener("resize", updateNavbarPosition);
        window.addEventListener("scroll", updateNavbarPosition);

        return () => {
            window.removeEventListener("resize", updateNavbarPosition);
            window.removeEventListener("scroll", updateNavbarPosition);
        };
    }, []);

    // Prevent document from scrolling when mobile nav is opened.
    useEffect(() => {
        document.body.style.overflow = isNavOpened ? "hidden" : "auto";

        return () => document.body.style.overflow = "auto";
    }, [isNavOpened]);

    // Close mobile navigation when the screen reach "desktop"
    useEffect(() => {
        if (screenWidth >= 1200) {
            setIsNavOpened(false);
        }
    }, [screenWidth]);

    // Close mobile navigation when location changes.
    useEffect(() => {
        setIsNavOpened(false);
    }, [location]);


    // Functions
    const toggleNavState = () => {
        if (isNavOpened) {
            setIsNavOpened(false);
        } else {
            scrollToTop();
            setIsNavOpened(true);
        }
    };
    
    const handleNavMenuButton = () => {
        toggleNavState();
    };


    // Render
    return (
        (screenWidth < desktop) ?

        <div ref={ navbarRef } className='navbar'>
            <div className='navbar__top'>
                <button onClick={ () => handleNavMenuButton() } className='navbar__top__menu-button' role='button' aria-label="Open mobile navigation">
                    {isNavOpened && (
                        <img className='navbar__top__menu-button__img--close' src={ close_menu_icon } alt="" />
                    )}
                    {!isNavOpened && (
                        <img className='navbar__top__menu-button__img' src={ menu_icon } alt="" />
                    )}
                </button>
                <NavLink to="/" className={ 'navbar__logo '}>Quizify</NavLink>
                {!user?.avatar_url && (
                    <NavLink to="/login" className={ 'navbar__avatar'}>
                        <img className='navbar__avatar__img' src={user_icon} alt="" />
                    </NavLink>
                )}
                {user?.avatar_url && (
                    <NavLink to="/user-dashboard" className={ 'navbar__avatar'}>
                        <img className='navbar__avatar__img' src={`${backendBaseURL}${user.avatar_url}`} alt="" />
                    </NavLink>
                )}
            </div>
            
            {isNavOpened && (
                <div 
                className='navbar__links__container navbar__links__container--opened '
                style={{
                    top: navbarBottomPosition,
                    height: (screenHeight - navbarBottomPosition)
                }}
                >
                    <nav className='navbar__links'>
                        <NavLink
                        to="/"
                        className={ ({ isActive }) => (isActive ? 'navbar__link--active' : 'navbar__link') }
                        >
                        Home    
                        </NavLink>

                        <NavLink
                        to="pricing/"
                        className={ ({ isActive }) => (isActive ? 'navbar__link--active' : 'navbar__link') }
                        >
                        Pricing    
                        </NavLink>

                        <NavLink
                        to="create-quiz/"
                        className={ ({ isActive }) => (isActive ? 'navbar__link--active' : 'navbar__link') }
                        >
                        Create Your Quiz    
                        </NavLink>

                        <NavLink
                        to="/quizzes"
                        className={ ({ isActive }) => (isActive ? 'navbar__link--active' : 'navbar__link') }
                        >
                        Browse    
                        </NavLink>

                        <hr className='divider--blue' />

                        {isAuthenticated && 
                            <NavLink
                            to="logout/"
                            className={ ({ isActive }) => (isActive ? 'navbar__link--active' : 'navbar__link bold') }
                            >
                            Log Out    
                            </NavLink>
                        }
                        {!isAuthenticated && 
                            <NavLink
                            to="login/"
                            className={ ({ isActive }) => (isActive ? 'navbar__link--active' : 'navbar__link bold') }
                            >
                            Sign In    
                            </NavLink>
                        }

                        <NavLink
                        to="register/"
                        className={ ({ isActive }) => (isActive ? 'navbar__link--active' : 'navbar__link') }
                        >
                        Register    
                        </NavLink>
                    </nav>
                </div>
            )}
        </div>

        :

        <div ref={ navbarRef } className='navbar'>
            <div className='navbar__top'>
                <NavLink to="/" className={ 'navbar__logo '}>Quizify</NavLink>
                <div className='navbar__links__container__desktop'>
                    <div className='navbar__links__desktop'>
                    <NavLink
                        to="/"
                        className={ ({ isActive }) => (isActive ? 'navbar__link__desktop--active' : 'navbar__link__desktop') }
                        >
                        Home    
                        </NavLink>

                        <NavLink
                        to="pricing/"
                        className={ ({ isActive }) => (isActive ? 'navbar__link__desktop--active' : 'navbar__link__desktop') }
                        >
                        Pricing    
                        </NavLink>

                        <NavLink
                        to="create-quiz/"
                        className={ ({ isActive }) => (isActive ? 'navbar__link__desktop--active' : 'navbar__link__desktop') }
                        >
                        Create Your Quiz    
                        </NavLink>

                        <NavLink
                        to="/quizzes"
                        className={ ({ isActive }) => (isActive ? 'navbar__link__desktop--active' : 'navbar__link__desktop') }
                        >
                        Browse    
                        </NavLink>
                    </div>
                    <div className='navbar__links__login__desktop'>
                        {isAuthenticated && (

                            <div>
                                {!user?.avatar_url && (
                                    <NavLink to="/login" className={ 'navbar__avatar'}>
                                        <img className='navbar__avatar__img' src={user_icon} alt="" />
                                    </NavLink>
                                )}
                                {user?.avatar_url && (
                                    <NavLink to="/user-dashboard" className={ 'navbar__avatar'}>
                                        <img className='navbar__avatar__img' src={`${backendBaseURL}${user.avatar_url}`} alt="" />
                                    </NavLink>
                                )}

                                <NavLink
                                to="logout/"
                                className='button--small--sky-dark'
                                >
                                Log Out    
                                </NavLink>
                            </div>
                        )}
                        {!isAuthenticated && (
                            <div>
                                <NavLink
                                to="login/"
                                className='button--small--sky-light'
                                >
                                Sign In    
                                </NavLink>

                                <NavLink
                                to="register/"
                                className='button--small--sky-dark'
                                >
                                Register    
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};



export default Navbar;
