// frontend/src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    // Router
    const navigate = useNavigate();


    // States
    const [mainErrorAlert, setMainErrorAlert] = useState('');
    const [credentials, setCredentials] = useState({identifier: '', password: ''});


    // Auth
    const { login, isAuthenticated } = useAuth();


    // Effects

    // If user already logged in, redirect to the dashboard.
    useEffect(() => {
        if (isAuthenticated) navigate('/user-dashboard');
    }, []);


    // Functions
    const handleChange = (e) => {
        const { name, value } = e.target;

        setCredentials({ ...credentials, [name]: value });
        setMainErrorAlert('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!credentials.identifier || !credentials.password) {
            setMainErrorAlert('Both fields are required.');

            return;
        }

        const result = await login(credentials.identifier, credentials.password);
        if (result.success) {
            navigate('/user-dashboard');
        }
        else {
            setMainErrorAlert(`Your credentials are incorect!`);
        }
    };


    // Render
    return (
        <div className='register-form-container'>
            <h1 className='header-1-sm'>Sign In</h1>
            {mainErrorAlert && 
                <div className='form-main-alert'>
                    <p className='bold'>{ mainErrorAlert }</p>    
                </div>
            }
            <form onSubmit={ handleSubmit } noValidate className='form'>
                <div className='form-input'>
                    <label className='form-input__label' htmlFor="identifier">Username / Email</label>
                    <input 
                        className='form-input__input'
                        type="text" 
                        name='identifier'
                        id='identifier'
                        value={ credentials.identifier }
                        onChange={ handleChange }
                        required
                    />
                </div>
                <div className='form-input'>
                    <label className='form-input__label' htmlFor="password">Password</label>
                    <input 
                        className='form-input__input'
                        type="password" 
                        name='password'
                        id='password'
                        value={ credentials.password }
                        onChange={ handleChange }
                        required
                    />
                </div>
                <button type="submit" className='button--small--fuchsia-dark register-button'>Login</button>
            </form>

            <hr className='divider'/>
            
            <div className='already-registered'>
                <h2 className='header-2-sm'>Don't have an account?</h2>
                <Link className='link-lg--fuchsia' to='/register'>Register now!</Link>
            </div>
        </div>
    );
};



export default LoginPage;
