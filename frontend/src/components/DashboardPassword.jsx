import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';



const DashboardPassword = () => {
    // Variables
    const initialFormData = {
        current_password: '',
        new_password: '',
        repeat_password: ''
    }


    // Router
    const navigate = useNavigate();


    // Auth
    const { api, isAuthenticated } = useAuth();


    // States
    const [formData, setFormData] = useState(initialFormData);

    const [alert, setAlert] = useState('');
    const [errorAlert, setErrorAlert] = useState('');
    const [errors, setErrors] = useState({});


    // Functions
    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({});
        setErrorAlert('');
        setAlert('');
    };

    const validateGeneralForm = () => {
        let tempErrors = {};

        if (!formData.current_password) {
            tempErrors.current_password = 'Your current password is required.';
        }

        if (!formData.new_password) {
            tempErrors.new_password = 'New password is required.';
        }

        if (!formData.repeat_password) {
            tempErrors.repeat_password = 'Repeated new password is required.';
        }

        if (formData.repeat_password !== formData.new_password) {
            tempErrors.repeat_password = 'Repeated new password does not match.';
        }

        setErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // If form has eny errors.
        if (!validateGeneralForm()) {
            setErrorAlert('Please fix the invalid fields.');

            return;
        }

        try {
            const response = await api.patch(`/api/update-password/`, formData);

            if (response.data.success) {
                setAlert("Password updated successfully.");
                setFormData(initialFormData);
            } else {
                setErrorAlert(response.data.error);
            }
        } catch (error) {
            console.error("error:", error.response || error.message);
            setErrorAlert("Failed to update password.");
        }
    };


    // Render
    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        navigate('/login'); 

        return null;
    }

    return (
        <section className="dashboard-password">
            <h2>Change your password</h2>
            <div className='form'>
                { errorAlert && 
                    <div className='form-main-alert'>
                        <p className='bold'>{ errorAlert }</p>
                        <ul>
                        { 
                            Object.entries(errors).map(([key, value]) => (
                                <li key={key}>{value}</li>
                            ))
                        }
                        </ul>
                    </div>
                }
                { alert && 
                    <div className='form-main-alert--success'>
                        <p className='bold'>{ alert }</p>
                    </div>
                }
            </div>
            <form className='form' noValidate onSubmit={handleSubmit}>
                <div className="form-input">
                    <label htmlFor="current_password" className="form-input__label">Current password <span className='required-star'>*</span></label>
                    <input
                        className="form-input__input"
                        id="current_password"
                        type="password"
                        name="current_password"
                        placeholder="Current Password"
                        value={ formData.current_password }
                        onChange={ handleChange }
                        required
                    />
                    { errors?.current_password && (
                        <p className='form-input__hint--invalid'>{ errors.current_password }</p>
                    )}
                </div>
                <div className="form-input">
                    <label htmlFor="new_password" className="form-input__label">New password <span className='required-star'>*</span></label>
                    <input
                        className="form-input__input"
                        id="new_password"
                        type="password"
                        name="new_password"
                        placeholder="New Password"
                        value={ formData.new_password }
                        onChange={ handleChange }
                        required
                    />
                    { errors?.new_password && (
                        <p className='form-input__hint--invalid'>{ errors.new_password }</p>
                    )}
                </div>
                <div className="form-input">
                    <label htmlFor="repeat_password" className="form-input__label">Repeat new password <span className='required-star'>*</span></label>
                    <input
                        className="form-input__input"
                        type="password"
                        id="repeat_password"
                        name="repeat_password"
                        placeholder="Repeat New Password"
                        value={ formData.repeat_password }
                        onChange={ handleChange }
                        required
                    />
                    { errors?.repeat_password && (
                        <p className='form-input__hint--invalid'>{ errors.repeat_password }</p>
                    )}
                </div>
                <button className="button--small--fuchsia-dark" type="submit">Update Password</button>
            </form>
        </section>
    );
}



export default DashboardPassword;
