import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const HospitalLogin = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login('hospital', formData.email, formData.password);
        if (result.success) {
            navigate('/hospital-dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen auth-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* Animated Background Elements */}
            <div className="auth-blob blob-1" style={{ width: '600px', height: '600px' }}></div>
            <div className="auth-blob blob-2" style={{ backgroundColor: '#fee2e2' }}></div>

            <div className="droplet" style={{ left: '15%', animationDelay: '1s' }}></div>
            <div className="droplet" style={{ left: '35%', animationDelay: '4s' }}></div>
            <div className="droplet" style={{ left: '55%', animationDelay: '0s' }}></div>
            <div className="droplet" style={{ left: '75%', animationDelay: '2s' }}></div>
            <div className="droplet" style={{ left: '85%', animationDelay: '5s' }}></div>

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Hospital Login</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="text-red-500 text-sm">{error}</div>}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                id="hospital-email"
                                type="email"
                                name="email"
                                autoComplete="username"
                                required
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1 relative">
                                <input
                                    id="hospital-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    autoComplete="current-password"
                                    required
                                    onChange={handleChange}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HospitalLogin;
