import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

import countries from '../data/countries';
import badWords from '../data/bad_words';
import restrictedWords from '../data/restricted_words';



const DashboardAccount = () => {
    // Variables
    const initialFormData = {
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        country: '',
        city: ''
    }


    // Router
    const navigate = useNavigate();


    // Auth
    const { user, api, isAuthenticated } = useAuth();

    // States
    const [formData, setFormData] = useState(initialFormData);
    const [userInfo, setUserInfo] = useState({});
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState('');
    const [mainErrorAlert, setMainErrorAlert] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [emailAvailable, setEmailAvailable] = useState(null);


    // Effects

    // Get user details
    useEffect(() => {
        fetchUser();
      }, []);


    // Check for username availability
    useEffect(() => {
        if (formData.username) {
            const delayDebounceFunnction = setTimeout(() => {
                api.get(`/username-check/?username=${formData.username}`)
                    .then((response) => {
                        const available  = response.data.available;
                        setUsernameAvailable(available);

                        if (!available) {
                            if (formData.username === user.username) {
                                setErrors(prev => ({ ...prev, username: null}));
                            } else {
                                setErrors(prev => ({ ...prev, username: 'This username is already taken'}));
                            }
                        } else {
                            setErrors(prev => ({ ...prev, username: null}));
                        }
                    })
                    .catch((error) => {
                        console.error('Error checking username:', error);
                    });
            }, 500);

            return () => clearTimeout(delayDebounceFunnction);

        } else {
            setUsernameAvailable(null);
            setErrors(prev => ({ ...prev, username: null}));
        }
    }, [formData.username]);

    // Check for email availability
    useEffect(() => {
        if (formData.email) {
            const delayDebounceFunnction = setTimeout(() => {
                api.get(`/email-check/?email=${formData.email}`)
                    .then((response) => {
                        const available  = response.data.available;
                        // console.log(available)
                        setEmailAvailable(available);

                        if (!available) {
                            if (formData.email === user.email) {
                                setErrors(prev => ({ ...prev, email: null}));
                            } else {
                                setErrors(prev => ({ ...prev, email: 'This email is already taken'}));
                            }
                        } else {
                            setErrors(prev => ({ ...prev, email: null}));
                        }
                    })
                    .catch((error) => {
                        console.error('Error checking email:', error);
                    });
            }, 500);

            return () => clearTimeout(delayDebounceFunnction);

        } else {
            setEmailAvailable(null);
            setErrors(prev => ({ ...prev, email: null}));
        }
    }, [formData.email]);


    // Functions
    const fetchUser = async () => {
        try {
            const response = await api.get(`/dashboard/user/get-user-details/`);
                setFormData(response.data.user);
                setUserInfo({
                    'last_login_time': response.data.user.last_login_time,
                    'date_joined': response.data.user.date_joined
                })
        } catch (error) {
            console.error('Error fetching user:', error.response?.data || error.message);
            navigate('/user-dashboard/');
        }
    };

    const handleChange = (e) => {
        const {name, value, files} = e.target;

        if (name === 'username') {
            setUsernameAvailable(null);
        }

        if (name === 'email') {
            setEmailAvailable(null);
        }

        if (name === 'avatar') {
            setFormData({ ...formData, avatar: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        setErrors( prev => ({ ...prev, [name]: null}));
        setMainErrorAlert('');
        setAlert('');
    };

    const validateForm = () => {
        let tempErrors = {};

        if (!formData.username) {
          tempErrors.username = 'Username is required.';
        } else if (!/^[a-z0-9]+$/.test(formData.username)) {
          tempErrors.username = 'Username must contain only letters and numbers.';
        } else if (badWords.includes(formData.username)) {
            tempErrors.username = 'Your username is inappropriate!';
        } else if (restrictedWords.includes(formData.username)) {
            tempErrors.username = "This username cannot be used.";
        }

        if (!formData.email) {
          tempErrors.email = 'Email is required.';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
            tempErrors.email = 'This is not a valid email address.';
        }

        if (!formData.first_name) {
            tempErrors.first_name = 'First name is required.';
        } else if (!/^[a-zA-Z '-]+$/.test(formData.first_name)) {
            tempErrors.first_name = 'First name must contain only letters. Allowed characters \' \-';
        }

        if (!formData.last_name) {
            tempErrors.last_name = 'Surname is required.';
        } else if (!/^[a-zA-Z '-]+$/.test(formData.last_name)) {
            tempErrors.last_name = 'Surname must contain only letters. Allowed characters \' \-';
        }

        if (!formData.country) tempErrors.country = 'Country is required.';
        
        if (!formData.city) tempErrors.city = 'City is required.';

        setErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // If form has eny errors.
        if (!validateForm()) {
            setMainErrorAlert('Please fix the invalid fields.');

            return;
        }

        try {
            const response = await api.patch(`/dashboard/user/update-user/`, formData);

            if (response.data.success) {
                setAlert("User Profile updated successfully.");
            } else {
                setMainErrorAlert(response.data.error);
            }
        } catch (error) {
            console.error("error:", error.response || error.message);
            setMainErrorAlert("Failed to update password.");
        }
    };

    const handleSubmitAvatar = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!formData.avatar) {
            setErrors(prev => ({ ...prev, avatar: 'Please select an Image'}));
            return;
        }


        const data = new FormData();

        data.append("avatar", formData.avatar);

        try {
            // Upload new avatar
            const response = await api.post(`/dashboard/user/update-avatar/`, data);

            if (response.data.success) {
                setMainErrorAlert("Avatar updated successfully. Your new avatar will be visible during your next visit.");
                // fetchQuiz(quizId);
            } else {
                setMainErrorAlert(response.data.error);
            }
        } catch (error) {
            console.error("upload-image error:", error.response || error.message);
            setMainErrorAlert("Failed to upload an image.");
        }
    };


    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        navigate('/login'); 

        return null;
    };


    // Render
    return (
        <>
            <section className="user-dashboard__stats">
                <p>User since: <span>{ userInfo.date_joined ?? 'N/A' }</span></p>
                <p>Last time logged in: <span>{ userInfo.last_login_time ?? 'N/A' }</span></p>
            </section>
            
            <hr className="divider"/>

            <section className="dashboard-account">
                <h2>Edit profile</h2>
                { mainErrorAlert && 
                    <div className='form-main-alert'>
                        <p className='bold'>{ mainErrorAlert }</p>
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
                <form onSubmit={ handleSubmit } className='form' noValidate encType="multipart/form-data">
                    <div className='form-input'>
                        <label className='form-input__label' htmlFor='username'>Username <span className='required-star'>*</span></label>
                        <input 
                            className='form-input__input' 
                            type='text'
                            name='username'
                            id='username'
                            value={ formData.username }
                            onChange={ handleChange }
                            placeholder='username'
                            required
                        />
                        <p className='form-input__hint'>Lowercase letters and numbers only.</p>
                        { errors.username && (
                            <p className='form-input__hint--invalid'>{ errors.username }</p>
                        )}
                        { usernameAvailable && (
                            <p className='form-input__hint--valid'>Username is available.</p>
                        )}
                    </div>

                    <div className='form-input'>
                        <label className='form-input__label' htmlFor='email'>Email <span className='required-star'>*</span></label>
                        <input 
                            className='form-input__input' 
                            type='email'
                            name='email'
                            id='email'
                            value={ formData.email }
                            onChange={ handleChange }
                            placeholder='you@example.com'
                            required
                        />
                        { errors.email && (
                            <p className='form-input__hint--invalid'>{ errors.email }</p> 
                        )}
                    </div>

                    <div className='form-input'>
                        <label className='form-input__label' htmlFor='first_name'>First Name <span className='required-star'>*</span></label>
                        <input 
                            className='form-input__input' 
                            type='text'
                            name='first_name'
                            id='first_name'
                            value={ formData.first_name }
                            onChange={ handleChange }
                            required
                        />
                        { errors.first_name && (
                            <p className='form-input__hint--invalid'>{ errors.first_name }</p>
                        )}
                    </div>

                    <div className='form-input'>
                        <label className='form-input__label' htmlFor='last_name'>Surname <span className='required-star'>*</span></label>
                        <input 
                            className='form-input__input' 
                            type='text'
                            name='last_name'
                            id='last_name'
                            value={ formData.last_name }
                            onChange={ handleChange }
                            required
                        />
                        { errors.last_name && (
                            <p className='form-input__hint--invalid'>{ errors.last_name }</p>
                        )}
                    </div>

                    <div className='form-input'>
                        <label className='form-input__label' htmlFor='country'>Country <span className='required-star'>*</span></label>
                        <select 
                            className='form-input__select' 
                            id="country"
                            name='country'
                            onChange={ handleChange }
                            required
                        >
                            <option value={ formData.country ?? '' }>{ formData.country ?? '-- Choose your country --' }</option>

                            {countries.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                        { errors.country && (
                            <p className='form-input__hint--invalid'>{ errors.country }</p>
                        )}
                    </div>

                    <div className='form-input'>
                        <label className='form-input__label' htmlFor='city'>City/Town <span className='required-star'>*</span></label>
                        <input 
                            className='form-input__input' 
                            type='text'
                            name='city'
                            id='city'
                            value={ formData.city }
                            required
                            onChange={ handleChange }
                        />
                        { errors.city && (
                            <p className='form-input__hint--invalid'>{ errors.city }</p>
                        )}
                    </div>

                    <button type="submit" className='button--small--fuchsia-dark register-button'>Update Profile</button>
                </form>

                <p><span className='required-star'>*</span> - Required fields</p>

                <hr className="divider"/>

                <form onSubmit={ handleSubmitAvatar } className='form' noValidate encType="multipart/form-data">
                    <div className='form-input--file-container'>
                        <p className='form-input--file__label'>Choose Avatar</p>
                        <div className='form-input--file button--small--sky-dark'>
                            <label htmlFor='avatar'>Browse</label>
                            <input
                                className='button--small--sky-dark'
                                type='file'
                                id='avatar'
                                name='avatar'
                                accept='image/*'
                                onChange={ handleChange }
                            />
                        </div>
                        { formData.avatar &&
                        <p>{ formData.avatar.name }</p>
                        }
                        { errors.avatar && <p style={{ color: 'red' }}>{ errors.avatar }</p> }
                    </div>

                    <button type="submit" className='button--small--fuchsia-dark'>Update Avatar</button>
                </form>
            </section>
        </>
    );
};



export default DashboardAccount;
