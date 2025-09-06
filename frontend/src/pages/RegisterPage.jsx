import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import countries from '../data/countries';
import badWords from '../data/bad_words';
import restrictedWords from '../data/restricted_words';



const RegisterPage = () => {
    // Variables
    const initialFormData = {
        username: '',
        email: '',
        password: '',
        repeat_password: '',
        first_name: '',
        last_name: '',
        country: '',
        city: '',
        avatar: null,
    }


    // Router
    const navigate = useNavigate();


    // Auth
    const { register, api } = useAuth();


    // States
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [mainErrorAlert, setMainErrorAlert] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [emailAvailable, setEmailAvailable] = useState(null);


    // Effects

    // Check for username availability
    useEffect(() => {
        if (formData.username) {
            const delayDebounceFunnction = setTimeout(() => {
                api.get(`/username-check/?username=${formData.username}`)
                    .then((response) => {
                        const available  = response.data.available;
                        setUsernameAvailable(available);

                        if (!available) {
                            setErrors(prev => ({ ...prev, username: 'This username is already taken'}));
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
                        console.log(available)
                        setEmailAvailable(available);

                        if (!available) {
                            setErrors(prev => ({ ...prev, email: 'This email is already taken'}));
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

        if (!formData.password) {
          tempErrors.password = 'Password is required.';
        }

        if (!formData.repeat_password) {
          tempErrors.repeat_password = 'Repeat password is required.';
        }

        if (formData.password && formData.repeat_password && formData.password !== formData.repeat_password) {
          tempErrors.repeat_password = 'Passwords do not match.';
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
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMainErrorAlert('');

        // If form has eny errors
        if (!validateForm()) {
            setMainErrorAlert('Please fix the invalid fields.');

            return;
        }

        // If username is not available
        if (usernameAvailable === false) {
            setErrors(prev => ({ ...prev, username: 'Username already taken.' }));
            setMainErrorAlert('Please fix the invalid fields.');

            return;
        }

        // If email is not available
        if (emailAvailable === false) {
            setErrors(prev => ({ ...prev, email: 'Email already registered.' }));
            setMainErrorAlert('Please fix the invalid fields.');

            return;
        }

        // Prepare formData
        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('first_name', formData.first_name);
        data.append('last_name', formData.last_name);
        data.append('country', formData.country);
        data.append('city', formData.city);

        if (formData.avatar) {
          data.append('avatar', formData.avatar);
        }

        // POST registration form
        const result = await register(data);

        if (result.success) {
            // Redirect to the login page.
            navigate('/login');
        } else {
            setMainErrorAlert('Please fix the invalid fields.');
        }
    };


    // Render
    return (
        <div className='register-form-container'>
            <h1 className='header-1-sm'>Register</h1>
            {mainErrorAlert && 
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
                    {errors.username && (
                        <p className='form-input__hint--invalid'>{ errors.username }</p>
                    )}
                    {usernameAvailable && (
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
                    {errors.email && (
                        <p className='form-input__hint--invalid'>{ errors.email }</p> 
                    )}
                </div>

                <div className='form-input'>
                    <label className='form-input__label' htmlFor='password'>Password <span className='required-star'>*</span></label>
                    <input 
                        className='form-input__input' 
                        type='password'
                        name='password'
                        id='password'
                        value={ formData.password }
                        onChange={ handleChange }
                        required
                    />
                    <p className='form-input__hint'>Password must be at least 8 characters long, include at least one uppercase letter, one number and one allowed special character ! @ # $ % ^ & *</p>
                    {errors.password && (
                        <p className='form-input__hint--invalid'>Your password does not meet required criteria.</p>
                    )}
                </div>

                <div className='form-input'>
                    <label className='form-input__label' htmlFor='repeat_password'>Repeat Password <span className='required-star'>*</span></label>
                    <input 
                        className='form-input__input' 
                        type='password'
                        name='repeat_password'
                        id='repeat_password'
                        value={ formData.repeat_password }
                        onChange={ handleChange }
                        required
                    />
                    <p className='form-input__hint'>Repeat your password.</p>
                    {errors.repeat_password && (
                        <p className='form-input__hint--invalid'>Your repeted password does not match the password.</p>
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
                    {errors.first_name && (
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
                    {errors.last_name && (
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
                        <option value="">-- Choose your country --</option>

                        {countries.map((country) => (
                            <option key={country} value={country}>
                                {country}
                            </option>
                        ))}
                    </select>
                    {errors.country && (
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
                    {errors.city && (
                        <p className='form-input__hint--invalid'>{ errors.city }</p>
                    )}
                </div>

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
                    {formData.avatar &&
                    <p>{ formData.avatar.name }</p>
                    }
                    {errors.avatar && <p style={{ color: 'red' }}>{errors.avatar}</p>}
                </div>

                <button type="submit" className='button--small--fuchsia-dark register-button'>Register</button>
            </form>
            <p><span className='required-star'>*</span> - Required fields</p>

            <hr className='divider'/>

            <div className='already-registered'>
                <h2 className='header-2-sm'>Already registered?</h2>
                <Link className='link-lg--fuchsia' to='/login'>Login to your account</Link>
            </div>
        </div>
    );
};



export default RegisterPage;
