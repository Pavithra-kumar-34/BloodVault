import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, Activity, Users, Droplet, ClipboardList } from 'lucide-react';
import api from '../api/axios';

const Home = () => {
    const [stats, setStats] = useState({ totalDonors: 0, activeDonors: 0, totalUnits: 0, activeRequests: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/public/public-stats');
                setStats(res.data);
            } catch (err) { console.error("Stats fetch failed"); }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-white relative overflow-hidden">
                {/* Single Professional ECG Graph */}
                <div className="ecg-container">
                    <div className="ecg-scroll"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                    <div className="text-center">
                        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                            <span className="block">Give Blood,</span>
                            <span className="block text-primary">Save a Life</span>
                        </h1>
                        <p className="mt-4 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            Connect with hospitals and donors. Your contribution can make a difference. Join our community today.
                        </p>
                        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                            <div className="rounded-md shadow">
                                <Link to="/donor-login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-red-600 md:py-4 md:text-lg md:px-10">
                                    Donor Login
                                </Link>
                            </div>
                            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                                <Link to="/hospital-login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                                    Hospital Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Stats Overlay */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                <div className="bg-white rounded-xl shadow-lg grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    <div className="p-6 text-center">
                        <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h3 className="text-3xl font-bold text-gray-900">{stats.totalDonors}</h3>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">Registered Donors</p>
                    </div>
                    <div className="p-6 text-center">
                        <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <h3 className="text-3xl font-bold text-gray-900">{stats.activeDonors}</h3>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">Available Now</p>
                    </div>
                    <div className="p-6 text-center">
                        <Droplet className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <h3 className="text-3xl font-bold text-gray-900">{stats.totalUnits}</h3>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">United Collected</p>
                    </div>
                    <div className="p-6 text-center">
                        <ClipboardList className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <h3 className="text-3xl font-bold text-gray-900">{stats.activeRequests}</h3>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">Blood Requests</p>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="text-center p-6">
                            <div className="flex justify-center mb-4">
                                <Heart className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Become a Donor</h3>
                            <p className="mt-2 text-gray-500">Register easily and manage your donation history.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="flex justify-center mb-4">
                                <Search className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Find Donors</h3>
                            <p className="mt-2 text-gray-500">Hospitals can search for eligible donors by blood group.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="flex justify-center mb-4">
                                <Activity className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                            <p className="mt-2 text-gray-500">Track donation trends and blood availability.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
