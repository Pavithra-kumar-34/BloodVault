import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff } from 'lucide-react';

const DonorRegister = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        // Personal
        name: '', age: '', date_of_birth: '', gender: 'Male', blood_group: 'A+',
        phone: '', email: '', password: '', profile_photo: '',
        // Address
        address: '', city: '', state: '', pincode: '',
        // Medical
        chronic_diseases: false, medications: '', recent_surgeries: false, allergies: '', hemoglobin: '',
        last_donation_date: '',
        // Emergency
        emergency_contact_name: '', emergency_contact_number: '',
        // Location & Status
        preferred_donation_location: '', availability_status: 'Available', donor_type: 'First-time', is_first_time: true,
        latitude: '', longitude: '' // Can be auto-filled
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                alert("Location fetched!");
            }, () => alert("Unable to retrieve location"));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/donor/register', formData);
            // Auto login after registration
            const loginResult = await login('donor', formData.email, formData.password);
            if (loginResult.success) {
                navigate('/donor-dashboard');
            } else {
                navigate('/donor-login'); // Fallback
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen auth-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* Animated Background Elements */}
            <div className="auth-blob blob-1"></div>
            <div className="auth-blob blob-2" style={{ width: '600px', height: '600px' }}></div>

            <div className="droplet" style={{ left: '5%', animationDelay: '0s' }}></div>
            <div className="droplet" style={{ left: '25%', animationDelay: '3s' }}></div>
            <div className="droplet" style={{ left: '45%', animationDelay: '6s' }}></div>
            <div className="droplet" style={{ left: '65%', animationDelay: '2s' }}></div>
            <div className="droplet" style={{ left: '85%', animationDelay: '4s' }}></div>

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Donor Registration</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}

                        {/* Personal Details */}
                        <div className="bg-gray-50 p-4 rounded-md">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input type="text" name="name" required onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Profile Photo URL (Optional)</label>
                                    <input type="text" name="profile_photo" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Age</label>
                                    <input type="number" name="age" required min="18" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input type="date" name="date_of_birth" required onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select name="gender" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                    <select name="blood_group" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm">
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First-time Donor?</label>
                                    <div className="mt-2 flex items-center space-x-4">
                                        <div className="flex items-center">
                                            <input
                                                id="first-time-yes"
                                                name="is_first_time"
                                                type="radio"
                                                value="true"
                                                checked={formData.is_first_time === 'true' || formData.is_first_time === true}
                                                onChange={() => setFormData({ ...formData, is_first_time: true, donor_type: 'First-time' })}
                                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                            />
                                            <label htmlFor="first-time-yes" className="ml-2 block text-sm text-gray-700">Yes</label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                id="first-time-no"
                                                name="is_first_time"
                                                type="radio"
                                                value="false"
                                                checked={formData.is_first_time === 'false' || formData.is_first_time === false}
                                                onChange={() => setFormData({ ...formData, is_first_time: false, donor_type: 'Regular' })}
                                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                            />
                                            <label htmlFor="first-time-no" className="ml-2 block text-sm text-gray-700">No</label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Availability</label>
                                    <select name="availability_status" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm">
                                        <option value="Available">Available</option>
                                        <option value="Busy">Busy</option>
                                        <option value="Not Available">Not Available</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Account & Contact */}
                        <div className="bg-gray-50 p-4 rounded-md">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact & Location</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email (Username)</label>
                                    <input type="email" name="email" required onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input type="text" name="phone" required onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Address (Street, City, State, Zip)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="text" name="address" placeholder="Street" required onChange={handleChange} className="border border-gray-300 rounded-md p-2 text-sm" />
                                        <input type="text" name="city" placeholder="City" required onChange={handleChange} className="border border-gray-300 rounded-md p-2 text-sm" />
                                        <input type="text" name="state" placeholder="State" required onChange={handleChange} className="border border-gray-300 rounded-md p-2 text-sm" />
                                        <input type="text" name="pincode" placeholder="Pincode" required onChange={handleChange} className="border border-gray-300 rounded-md p-2 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Preferred Donation Location</label>
                                    <input type="text" name="preferred_donation_location" placeholder="e.g. City Hospital, Downtown Clinic" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <button type="button" onClick={handleLocation} className="text-primary text-sm hover:underline flex items-center">
                                        📍 Use Current Location (GPS)
                                    </button>
                                    {formData.latitude && <span className="text-xs text-green-600 ml-2">Location Saved</span>}
                                </div>
                            </div>
                        </div>

                        {/* Emergency Info */}
                        <div className="bg-red-50 p-4 rounded-md border border-red-100">
                            <h3 className="text-lg font-medium text-red-900 mb-4">Emergency Contact</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                                    <input type="text" name="emergency_contact_name" required onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                    <input type="text" name="emergency_contact_number" required onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Medical Info */}
                        <div className="bg-gray-50 p-4 rounded-md">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {formData.is_first_time === false && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Donation Date</label>
                                        <input type="date" name="last_donation_date" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <input type="checkbox" name="chronic_diseases" onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                                    <label className="ml-2 block text-sm text-gray-900">Any Chronic Diseases?</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" name="recent_surgeries" onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                                    <label className="ml-2 block text-sm text-gray-900">Any Recent Surgeries?</label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Medications (Optional)</label>
                                    <input type="text" name="medications" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Allergies (Optional)</label>
                                    <input type="text" name="allergies" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hemoglobin Level (Optional)</label>
                                    <input type="number" step="0.1" name="hemoglobin" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1 relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    onChange={handleChange}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:ring-primary focus:border-primary sm:text-sm"
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
                                Register
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DonorRegister;
