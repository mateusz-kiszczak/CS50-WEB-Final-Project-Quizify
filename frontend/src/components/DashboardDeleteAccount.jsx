import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';



const DashboardDeleteAccount = () => {
    // Auth
    const { isAuthenticated, loading, api, handleContextSetUser } = useAuth();

    // Router
    const navigate = useNavigate();

    // States
    const [deleteUserAlert, setDeleteUserAlert] = useState(false);
    const [errorAlert, setErrorAlert] = useState('');
    const [password, setPassword] = useState('');


    // Effects
    useEffect(() => {
        // Scroll to top.
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [deleteUserAlert]);

    // Prevent document from scrolling when alert is visible.
    useEffect(() => {
        document.body.style.overflow = deleteUserAlert ? "hidden" : "auto";

        return () => document.body.style.overflow = "auto";
    }, [deleteUserAlert]);


    // Functions
    const handleShowDeleteUserAlert = () => {
        if (deleteUserAlert) {
            setDeleteUserAlert(false);
        } else {
            setDeleteUserAlert(true);
        }
    }

    const handleChange = e => {
        setPassword(e.target.value);
    };

    const handleDeleteUser = async (e) => {
        e.preventDefault();
        setDeleteUserAlert(false);

        try {
            const response = await api.post(`/dashboard/user/delete-user/`, {'password': password});
            
            if (response.data.success) {
                handleContextSetUser();
                navigate('/register'); 
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Password does not match.';
            setErrorAlert(errorMessage);

        }
    };


    if (loading) {
        return <p>Loading quiz...</p>;
    }

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        navigate('/login');
        return null;
    }


    // Render
    return (
        <>
            <section className="dashboard-delete-user">
                <h2>Delete account</h2>
                {errorAlert && 
                        <div className='form-main-alert'>
                            <p className='bold'>{ errorAlert }</p>
                        </div>
                    }
                <form className='form' noValidate>
                    <div className="form-input">
                        <label htmlFor="password" className="form-input__label">Enter your password <span className='required-star'>*</span></label>
                        <input
                            className="form-input__input"
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button 
                        onClick={handleShowDeleteUserAlert} 
                        type="button"
                        className="button--small--fuchsia-dark"
                    >Delete Account
                    </button>
                </form>
            </section>
            {deleteUserAlert && (
                <div className='create-quiz__alert-wrapper'>
                    <div className='create-quiz__alert'>
                        <h2 className='create-quiz__alert__header'>Are you sure, you want to permanently delete your account?</h2>
                        <div className='create-quiz__alert__text-container'>
                            <p className='create-quiz__alert__text'>This action will remove your profile and all quizzes you created.</p>
                            <p className='create-quiz__alert__text'>Changes after deleting an account are not reversable.</p>
                        </div>
                        <div className='create-quiz__alert__buttons'>
                            <button 
                                className='create-quiz__alert__buttons_button button--medium--rose-dark'
                                onClick={ handleDeleteUser }
                            >
                            Delete your account
                            </button>
                            <button 
                                className='create-quiz__alert__buttons_button button--medium--emerald-dark' 
                                onClick={ handleShowDeleteUserAlert }>
                            Go Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};



export default DashboardDeleteAccount;
