import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { User, MapPin, Phone, Heart, Activity, AlertCircle } from 'lucide-react';

const DonorDashboard = () => {
    const { user, login } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);

            // Safety timeout
            const timeout = setTimeout(() => {
                setLoading(false);
            }, 5000);

            try {
                await Promise.all([
                    fetchProfile(),
                    fetchRequests()
                ]);
            } catch (err) {
                console.error("Error loading donor data", err);
            } finally {
                clearTimeout(timeout);
                setLoading(false);
            }
        };
        loadAllData();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/donor/profile');
            setProfile(res.data);
        } catch (err) { console.error("Failed to fetch profile", err); }
        finally { setLoading(false); }
    };

    const fetchRequests = async () => {
        try {
            // Fetch all open requests, then the UI filters by blood group if needed
            const res = await api.get('/request/all');
            setRequests(res.data);
        } catch (err) { console.error("Failed to fetch requests", err); }
    };

    const toggleAvailability = async () => {
        if (!profile) return;
        const newStatus = profile.availability_status === 'Available' ? 'Not Available' : 'Available';
        try {
            await api.put('/donor/availability', { status: newStatus });
            setProfile({ ...profile, availability_status: newStatus });
        } catch (err) { console.error("Failed to update status", err); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Profile */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-primary to-red-800 h-48 relative">
                            <div className="absolute -bottom-16 left-8">
                                <div className="h-32 w-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                                    <img
                                        src={profile?.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || 'User')}&backgroundType=gradientLinear&mouthType=smile&topType=${profile?.gender === 'Female' ? 'longHair,bob,curvy' : 'shortHair,classic01,classic02'}`}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Profile Content */}
                        <div className="pt-20 px-8 pb-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
                                    <p className="text-gray-500 flex items-center mt-1">
                                        <MapPin className="h-4 w-4 mr-1" /> {profile?.city}, {profile?.state}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-4 py-1 rounded-full text-sm font-semibold mb-2 ${profile?.availability_status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {profile?.availability_status}
                                    </span>
                                    <button onClick={toggleAvailability} className="text-sm text-primary hover:underline font-medium">
                                        Change Status
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Personal Info */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <User className="h-5 w-5 mr-2 text-primary" /> Personal Details
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Blood Group</span><span className="font-bold text-red-600 text-lg">{profile?.blood_group}</span></div>
                                        <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Age / Gender</span><span className="font-medium text-gray-900">{profile?.age} / {profile?.gender}</span></div>
                                        <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Contact</span><span className="font-medium text-gray-900">{profile?.phone}</span></div>
                                        <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Donor Type</span><span className="font-medium text-gray-900">{profile?.donor_type}</span></div>
                                        <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Eligibility</span><span className="font-medium text-green-600">{profile?.eligibility_status}</span></div>
                                    </div>
                                </div>

                                {/* Medical / Emergency */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Activity className="h-5 w-5 mr-2 text-primary" /> Health & Emergency
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Last Donation</span><span className="font-medium text-gray-900">{profile?.last_donation_date || 'N/A'}</span></div>
                                        <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Emergency Contact</span><span className="font-medium text-gray-900">{profile?.emergency_contact_name}</span></div>
                                        <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Emergency Phone</span><span className="font-medium text-gray-900">{profile?.emergency_contact_number}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Blood Requests & Activities */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-xl p-6 h-full border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <Activity className="h-6 w-6 text-primary mr-2" /> Recent Activities
                        </h2>

                        <div className="flow-root">
                            <ul className="-mb-8">
                                {/* Synthetic Availability Activity */}
                                <li>
                                    <div className="relative pb-8">
                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-100" aria-hidden="true"></span>
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                                                    <Activity className="h-4 w-4 text-blue-600" />
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Status updated to <span className="font-bold text-gray-900">{profile?.availability_status}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right text-xs whitespace-nowrap text-gray-400">
                                                    Just now
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>

                                {requests.slice(0, 5).map((req, idx) => {
                                    const isBloodGroupMatch = profile?.blood_group === req.blood_group;
                                    return (
                                        <li key={req.id}>
                                            <div className="relative pb-8">
                                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-100" aria-hidden="true"></span>
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${isBloodGroupMatch ? 'bg-red-100 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                                            <Heart className="h-4 w-4" />
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <p className="text-sm font-bold text-gray-900">
                                                                {isBloodGroupMatch ? 'Matching Request' : 'Blood Request'}
                                                            </p>
                                                            <time className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</time>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            {req.blood_group} requested by {req.Hospital?.name || "a hospital"} in {req.Hospital?.city || "your area"}.
                                                        </p>
                                                        {isBloodGroupMatch && (
                                                            <button
                                                                onClick={() => alert(`Connect with ${req.Hospital?.name} at ${req.Hospital?.phone}`)}
                                                                className="w-full bg-primary text-white text-[10px] font-bold py-1 px-2 rounded hover:bg-red-700 transition-colors"
                                                            >
                                                                Accept Now
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}

                                {/* Synthetic Welcome Activity */}
                                <li>
                                    <div className="relative pb-8">
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                                                    <User className="h-4 w-4 text-gray-600" />
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Welcome to <span className="font-bold text-gray-900">BloodLock</span>!
                                                    </p>
                                                </div>
                                                <div className="text-right text-xs whitespace-nowrap text-gray-400">
                                                    Earlier
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DonorDashboard;
