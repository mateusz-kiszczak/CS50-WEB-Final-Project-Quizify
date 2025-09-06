import React from 'react';
import { NavLink } from 'react-router-dom';

import x_icon from '../assets/x-icon.svg';
import youtube_icon from '../assets/youtube-icon.svg';
import linkedin_icon from '../assets/linkedin-icon.svg';



const Footer = () => {
    // Render
    return (
        <footer className='footer'>
            <div className='footer-wrapper'>
                <div className='footer-content'>
                    <div className='footer__logo-and-social'>
                        <NavLink className='footer__logo' to='/'>Quizify</NavLink>
                        <div className='footer__social-links'>
                            <a className='footer__social-links__link' href='https://x.com' target='_blank' rel='noopener noreferrer'>
                                <img src={ x_icon } alt="X" />
                            </a>
                            <a className='footer__social-links__link' href='https://youtube.com' target='_blank' rel='noopener noreferrer'>
                                <img src={ youtube_icon } alt="YouTube" />
                            </a>
                            <a className='footer__social-links__link' href='https://linkedin.com' target='_blank' rel='noopener noreferrer'>
                                <img src={ linkedin_icon } alt="Linkedin" />
                            </a>
                        </div>
                    </div>
                    <div className='footer__web-links'>
                        <div className='footer__web-links__links-container'>
                            <h4>About</h4>
                            <div>
                                <NavLink className='footer__link' to='about/'>About Us</NavLink>
                                <NavLink className='footer__link' to='contact/'>Contact Us</NavLink>
                                <NavLink className='footer__link' to='login/'>Login</NavLink>
                                <NavLink className='footer__link' to='register/'>Sign Up</NavLink>
                            </div>
                        </div>
                        <div className='footer__web-links__links-container'>
                            <h4>Products</h4>
                            <div>
                                <NavLink className='footer__link' to='quizzes/'>Find a Quiz</NavLink>
                                <NavLink className='footer__link' to='pricing/'>Pricing</NavLink>
                                <NavLink className='footer__link' to='type-of-quizzes/'>Types of Quizzes</NavLink>
                            </div>
                        </div>
                        <div className='footer__web-links__links-container'>
                            <h4>Legal</h4>
                            <div>
                                <NavLink className='footer__link' to='privacy-notice/'>Privacy Notice</NavLink>
                                <NavLink className='footer__link' to='terms-of-use/'>Terms of Use</NavLink>
                                <NavLink className='footer__link' to='cookies-policy/'>Cookies Policy</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
                <p className='footer__bottom'>© 2025 Quizify. All Rights Reserved.</p>
            </div>
        </footer>
    );
};



export default Footer;
