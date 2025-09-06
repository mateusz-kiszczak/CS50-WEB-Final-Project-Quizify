import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';



const LogoutPage = () => {
    // Auth
    const { logout } = useAuth();


    // Router
    const navigate = useNavigate();


    // States
    const [loggingOut, setLoggingOut] = useState(false);
    

    // Effects
    useEffect(() => {
        const handleLogout = async () => {
            const result = await logout();
            if (result.success) {
                setLoggingOut(true);

                // Redirect to login page after successfull logout.
                navigate('/login');
            } else {
                // console.error('Logout failed: ' + result.error);
            }
        };   

        handleLogout();
    }, []);


    // Render
    return (
        <div>
            {loggingOut && 
                <div>
                    You are logging out!
                </div>
            }
        </div>
    );
};



export default LogoutPage;
