import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Heart, Menu, X, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();


    const handleLogout = () => {
        // Move to home first while user is still "logged in" 
        // this prevents the ProtectedRoute from firing a redirect to /donor-login
        navigate('/', { replace: true });

        // Execute logout after the navigation has initiated
        setTimeout(() => {
            logout();
        }, 10);
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <button onClick={handleLogout} className="flex items-center group">
                            <Heart className="h-8 w-8 text-primary fill-current group-hover:scale-110 transition-transform" />
                            <span className="ml-2 text-xl font-bold text-gray-800">BloodLock</span>
                        </button>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {location.pathname !== '/' && (
                            <button onClick={handleLogout} className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Home</button>
                        )}
                        {user ? (
                            <>

                                <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                                    <LogOut className="h-4 w-4 mr-1" /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/register-donor" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Register as Donor</Link>
                                <Link to="/register-hospital" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Register Hospital</Link>

                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
