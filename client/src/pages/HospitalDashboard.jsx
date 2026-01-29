import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Search, MapPin, Droplet, Plus, ClipboardList, AlertCircle, Edit2, Trash2, Activity, User, X } from 'lucide-react';



const HospitalDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ totalUnits: 0, unitsByGroup: [], pendingRequests: 0 });
    const [inventory, setInventory] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchParams, setSearchParams] = useState({ blood_group: '', location: '', availability: 'Available' });
    const [donors, setDonors] = useState([]);
    const [filteredDonors, setFilteredDonors] = useState([]);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRequest, setEditingRequest] = useState(null);
    const [newRequest, setNewRequest] = useState({
        patient_name: '', blood_group: 'A+', units_needed: 1, required_date: '',
        contact_number: '', emergency_level: 'Normal'
    });
    const [detailedStock, setDetailedStock] = useState([]);
    const [showStockModal, setShowStockModal] = useState(false);
    const [newStock, setNewStock] = useState({
        blood_group: 'A+', donor_name: '', donation_date: new Date().toISOString().split('T')[0],
        expiry_date: '', quantity: 1
    });
    const [stockFilter, setStockFilter] = useState('All');
    const [editingStock, setEditingStock] = useState(null);
    const [showEditStockModal, setShowEditStockModal] = useState(false);
    const [showDetailedStockModal, setShowDetailedStockModal] = useState(false);

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);

            // Safety timeout: if server doesn't respond in 5s, show dashboard anyway
            const timeout = setTimeout(() => {
                setLoading(false);
            }, 5000);

            try {
                await Promise.all([
                    fetchStats(),
                    fetchInventory(),
                    fetchDetailedStock(),
                    fetchRequests(),
                    fetchAllDonors()
                ]);
            } catch (err) {
                console.error("Error loading dashboard data", err);
            } finally {
                clearTimeout(timeout);
                setLoading(false);
            }
        };
        loadAllData();
    }, []);

    // Refresh dashboard stats when switching tabs to ensure real-time sync
    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchStats();
        }
        if (activeTab === 'inventory') {
            fetchInventory();
            fetchDetailedStock();
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/hospital/stats');
            setStats(res.data);
        } catch (err) { console.error("Failed to fetch stats", err); }
    };

    const fetchInventory = async () => {
        try {
            const res = await api.get('/inventory');
            setInventory(res.data);
        } catch (err) { console.error("Failed to fetch inventory", err); }
    };

    const fetchDetailedStock = async () => {
        try {
            const res = await api.get('/inventory/detailed');
            setDetailedStock(res.data);
        } catch (err) { console.error("Failed to fetch detailed stock", err); }
    };
    const handleStockSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/inventory/add', newStock);
            setShowStockModal(false);
            setNewStock({
                blood_group: 'A+', donor_name: '', donation_date: new Date().toISOString().split('T')[0],
                expiry_date: '', quantity: 1
            });
            fetchInventory();
            fetchDetailedStock();
            alert("Blood Stock Added Successfully!");
        } catch (err) {
            console.error('Add stock error:', err);
            alert(`Failed to add stock: ${err.response?.data?.error || err.message}`);
        }
    };

    const updateStockStatus = async (id, status) => {
        try {
            await api.patch(`/inventory/stock/${id}`, { status });
            fetchInventory();
            fetchDetailedStock();
        } catch (err) {
            console.error('Update status error:', err);
            alert(`Failed to update status: ${err.response?.data?.error || err.message}`);
        }
    };

    const deleteStock = async (id) => {
        if (window.confirm('Delete this stock entry?')) {
            try {
                await api.delete(`/inventory/stock/${id}`);
                fetchInventory();
                fetchDetailedStock();
            } catch (err) {
                console.error('Delete stock error:', err);
                alert(`Failed to delete stock: ${err.response?.data?.error || err.message}`);
            }
        }
    };

    const handleEditStock = (stock) => {
        setEditingStock(stock);
        setShowEditStockModal(true);
    };

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/inventory/stock/${editingStock.id}`, editingStock);
            setShowEditStockModal(false);
            setEditingStock(null);
            fetchInventory();
            fetchDetailedStock();
            alert("Blood Stock Updated!");
        } catch (err) {
            console.error('Update stock error:', err);
            alert(`Failed to update stock: ${err.response?.data?.error || err.message}`);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await api.get('/request/hospital');
            console.log('Fetched requests:', res.data);
            setRequests(res.data);
        } catch (err) { console.error("Failed to fetch requests", err); }
    };

    const fetchAllDonors = async () => {
        try {
            console.log('Fetching all donors...');
            const res = await api.get('/hospital/donors/all');
            console.log('Donors response:', res.data);
            console.log('Total donors fetched:', res.data.length);
            setDonors(res.data);
            const available = res.data.filter(d => d.availability_status === 'Available');
            console.log('Available donors:', available.length);
            setFilteredDonors(available);
        } catch (err) {
            console.error("Failed to fetch donors", err);
            console.error("Error details:", err.response);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        let filtered = donors;

        if (searchParams.blood_group) {
            filtered = filtered.filter(d => d.blood_group === searchParams.blood_group);
        }
        if (searchParams.location) {
            const loc = searchParams.location.toLowerCase();
            filtered = filtered.filter(d =>
                d.city?.toLowerCase().includes(loc) ||
                d.state?.toLowerCase().includes(loc)
            );
        }
        if (searchParams.availability) {
            filtered = filtered.filter(d => d.availability_status === searchParams.availability);
        }

        setFilteredDonors(filtered);
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/request/create', newRequest);
            setShowRequestModal(false);
            fetchRequests();
            alert("Blood Request Created & Notifications Sent!");
        } catch (err) { alert("Failed to create request"); }
    };

    const updateInventory = async (bg, type, quantity) => {
        const newQty = prompt(`Enter new quantity for ${bg} (${type}):`, quantity);
        if (newQty !== null && !isNaN(newQty)) {
            try {
                await api.post('/inventory/update', {
                    blood_group: bg,
                    [type]: parseInt(newQty)
                });
                fetchInventory();
                // Removed fetchStats() as dashboard now calculates totals from inventory
                alert(`Inventory for ${bg} updated successfully!`);
            } catch (err) { alert("Update failed: " + (err.response?.data?.error || err.message)); }
        } else if (newQty !== null) {
            alert("Please enter a valid numeric quantity.");
        }
    };

    const handleEditRequest = (req) => {
        setEditingRequest(req);
        setShowEditModal(true);
    };

    const handleUpdateRequest = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/request/update/${editingRequest.id}`, editingRequest);
            setShowEditModal(false);
            setEditingRequest(null);
            fetchRequests();
            alert("Request updated successfully!");
        } catch (err) {
            console.error('Update error:', err);
            alert(`Failed to update request: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleDeleteRequest = async (id) => {
        console.log('Attempting to delete request with ID:', id);
        console.log('Current user:', user);

        if (window.confirm('Are you sure you want to delete this blood request?')) {
            try {
                const response = await api.delete(`/request/delete/${id}`);
                console.log('Delete response:', response);
                fetchRequests();
                alert("Request deleted successfully!");
            } catch (err) {
                console.error('Delete error:', err);
                console.error('Error response:', err.response);
                alert(`Failed to delete request: ${err.response?.data?.error || err.message}`);
            }
        }
    };



    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                Loading Dashboard...
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-primary flex items-center">
                        <Droplet className="mr-2" /> BloodLock
                    </h2>
                </div>
                <nav className="mt-6">
                    {['dashboard', 'inventory', 'requests', 'donors'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-6 py-3 font-medium capitalize ${activeTab === tab ? 'bg-red-50 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 capitalize">{activeTab}</h1>
                        {activeTab === 'dashboard' && <p className="text-gray-600">Welcome, {user?.name} Hospital</p>}
                    </div>
                    {activeTab === 'requests' && (
                        <button onClick={() => setShowRequestModal(true)} className="bg-primary text-white px-4 py-2 rounded-md flex items-center hover:bg-red-700">
                            <Plus className="h-5 w-5 mr-1" /> New Blood Request
                        </button>
                    )}
                    {activeTab === 'inventory' && (
                        <button onClick={() => setShowStockModal(true)} className="bg-primary text-white px-4 py-2 rounded-md flex items-center hover:bg-red-700">
                            <Plus className="h-5 w-5 mr-1" /> Add Blood Stock
                        </button>
                    )}
                </header>

                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                                <div className="p-3 bg-red-100 rounded-full mr-4"><Droplet className="h-8 w-8 text-primary" /></div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Units Available</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {inventory.reduce((sum, item) => sum + (item.units_available || 0), 0)}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                                <div className="p-3 bg-blue-100 rounded-full mr-4"><ClipboardList className="h-8 w-8 text-blue-600" /></div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Active Requests</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {requests.filter(r => r.status === 'Open').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                                    <span>Stock Inventory</span>
                                    <button onClick={() => setActiveTab('inventory')} className="text-sm font-medium text-primary hover:underline">View All</button>
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => {
                                        const item = inventory.find(i => i.blood_group === bg);
                                        const qty = item ? (item.units_available || 0) : 0;
                                        return (
                                            <div key={bg} className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                                                <p className="text-sm font-bold text-gray-400 uppercase">{bg}</p>
                                                <p className={`text-xl font-bold ${qty > 0 ? 'text-primary' : 'text-gray-300'}`}>
                                                    {qty} <span className="text-[10px] font-normal text-gray-500">Units</span>
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                    <Activity className="h-5 w-5 mr-2 text-primary" /> Recent Activities
                                </h3>
                                <div className="flow-root">
                                    <ul className="-mb-8">
                                        {/* Real Requests for THIS hospital as Activities */}
                                        {requests.slice(0, 3).map((req, idx) => (
                                            <li key={'req-' + req.id}>
                                                <div className="relative pb-8">
                                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-100" aria-hidden="true"></span>
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                                                                <Droplet className="h-4 w-4 text-blue-600" />
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                            <div>
                                                                <p className="text-sm text-gray-500">
                                                                    Requested <span className="font-bold text-gray-900">{req.blood_group}</span> for <span className="font-medium text-gray-700">{req.patient_name}</span>
                                                                </p>
                                                            </div>
                                                            <div className="text-right text-xs whitespace-nowrap text-gray-400">
                                                                {new Date(req.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}

                                        {/* Synthetic "Recent Search" Activity */}
                                        <li>
                                            <div className="relative pb-8">
                                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-100" aria-hidden="true"></span>
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
                                                            <Search className="h-4 w-4 text-green-600" />
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">
                                                                Searched for <span className="font-bold text-gray-900">O+ Donors</span> in your area
                                                            </p>
                                                        </div>
                                                        <div className="text-right text-xs whitespace-nowrap text-gray-400">
                                                            Today
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>

                                        {/* Synthetic "Login" Activity */}
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
                                                                Hospital session started successfully
                                                            </p>
                                                        </div>
                                                        <div className="text-right text-xs whitespace-nowrap text-gray-400">
                                                            Just now
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
                )}

                {activeTab === 'inventory' && (
                    <div className="space-y-8">
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-bold text-gray-700">Inventory Summary</h3>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserved</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expired</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => {
                                        const item = inventory.find(i => i.blood_group === bg) || {};
                                        return (
                                            <tr key={bg}>
                                                <td className="px-6 py-4 font-medium text-gray-900">{bg}</td>
                                                <td className="px-6 py-4 text-green-600 font-bold">{item.units_available || 0}</td>
                                                <td className="px-6 py-4 text-blue-600">{item.units_reserved || 0}</td>
                                                <td className="px-6 py-4 text-gray-400">{item.units_expired || 0}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => {
                                                            setStockFilter(bg);
                                                            setShowDetailedStockModal(true);
                                                        }}
                                                        className="bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 text-sm font-medium transition-colors"
                                                    >
                                                        Stock Details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="grid gap-4">
                        {requests.map(req => (
                            <div key={req.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">{req.patient_name} <span className="text-sm font-normal text-gray-500">({req.blood_group})</span></h3>
                                        <p className="text-sm text-gray-600">Needed by: {req.required_date}</p>
                                        <p className="text-sm text-gray-600">Units: {req.units_needed}</p>
                                        <p className="text-sm text-gray-600">Contact: {req.contact_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${req.emergency_level === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {req.emergency_level}
                                        </span>
                                        <p className="mt-2 text-sm font-semibold">{req.status}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleEditRequest(req)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRequest(req.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {requests.length === 0 && <p>No active requests found.</p>}
                    </div>
                )}

                {activeTab === 'donors' && (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Donors ({filteredDonors.length})</h2>
                            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <select
                                    className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                                    value={searchParams.blood_group}
                                    onChange={e => setSearchParams({ ...searchParams, blood_group: e.target.value })}
                                >
                                    <option value="">All Blood Groups</option>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Search by city or state..."
                                    className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                                    value={searchParams.location}
                                    onChange={e => setSearchParams({ ...searchParams, location: e.target.value })}
                                />
                                <select
                                    className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                                    value={searchParams.availability}
                                    onChange={e => setSearchParams({ ...searchParams, availability: e.target.value })}
                                >
                                    <option value="">All Status</option>
                                    <option value="Available">Available</option>
                                    <option value="Not Available">Not Available</option>
                                </select>
                                <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                                    Filter Donors
                                </button>
                            </form>
                        </div>

                        <div className="space-y-3">
                            {filteredDonors.map(donor => (
                                <div key={donor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                                    <img
                                                        src={donor.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(donor.name)}&backgroundType=gradientLinear&mouthType=smile&topType=${donor.gender === 'Female' ? 'longHair,bob,curvy' : 'shortHair,classic01,classic02'}`}
                                                        alt={donor.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900">{donor.name}</h3>
                                                <span className="bg-red-100 text-red-800 text-sm font-bold px-2 py-1 rounded">{donor.blood_group}</span>
                                                <span className={`px-2 py-1 text-xs rounded font-medium ${donor.availability_status === 'Available'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {donor.availability_status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                <p><span className="font-medium">Age:</span> {donor.age} years</p>
                                                <p><span className="font-medium">Gender:</span> {donor.gender}</p>
                                                <p><span className="font-medium">Location:</span> {donor.city}, {donor.state}</p>
                                                <p><span className="font-medium">Phone:</span> {donor.phone}</p>
                                                {donor.last_donation_date && (
                                                    <p><span className="font-medium">Last Donation:</span> {donor.last_donation_date}</p>
                                                )}
                                                <p><span className="font-medium">Donor Type:</span> {donor.donor_type}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => window.open(`tel:${donor.phone}`, '_self')}
                                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors text-sm font-medium"
                                            >
                                                Call Donor
                                            </button>
                                            <button
                                                onClick={() => alert(`Donor Details:\n\nName: ${donor.name}\nBlood Group: ${donor.blood_group}\nPhone: ${donor.phone}\nEmail: ${donor.email}\nLocation: ${donor.city}, ${donor.state}\nStatus: ${donor.availability_status}`)}
                                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm font-medium"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredDonors.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-lg">No donors found matching your criteria.</p>
                                    <p className="text-sm mt-2">Try adjusting your filters.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Create Blood Request</h2>
                        <form onSubmit={handleRequestSubmit} className="space-y-4">
                            <input type="text" placeholder="Patient Name" required className="w-full border p-2 rounded" onChange={e => setNewRequest({ ...newRequest, patient_name: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <select className="border p-2 rounded" onChange={e => setNewRequest({ ...newRequest, blood_group: e.target.value })}>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                                <input type="number" min="1" placeholder="Units" required className="w-full border p-2 rounded" onChange={e => setNewRequest({ ...newRequest, units_needed: e.target.value })} />
                            </div>
                            <input type="date" required className="w-full border p-2 rounded" onChange={e => setNewRequest({ ...newRequest, required_date: e.target.value })} />
                            <select className="w-full border p-2 rounded" onChange={e => setNewRequest({ ...newRequest, emergency_level: e.target.value })}>
                                <option value="Normal">Normal</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Critical">Critical</option>
                            </select>
                            <input type="text" placeholder="Contact Number" required className="w-full border p-2 rounded" onChange={e => setNewRequest({ ...newRequest, contact_number: e.target.value })} />
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowRequestModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700">Create Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Request Modal */}
            {showEditModal && editingRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Edit Blood Request</h2>
                        <form onSubmit={handleUpdateRequest} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Patient Name"
                                required
                                className="w-full border p-2 rounded"
                                value={editingRequest.patient_name}
                                onChange={e => setEditingRequest({ ...editingRequest, patient_name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    className="border p-2 rounded"
                                    value={editingRequest.blood_group}
                                    onChange={e => setEditingRequest({ ...editingRequest, blood_group: e.target.value })}
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Units"
                                    required
                                    className="w-full border p-2 rounded"
                                    value={editingRequest.units_needed}
                                    onChange={e => setEditingRequest({ ...editingRequest, units_needed: e.target.value })}
                                />
                            </div>
                            <input
                                type="date"
                                required
                                className="w-full border p-2 rounded"
                                value={editingRequest.required_date}
                                onChange={e => setEditingRequest({ ...editingRequest, required_date: e.target.value })}
                            />
                            <select
                                className="w-full border p-2 rounded"
                                value={editingRequest.emergency_level}
                                onChange={e => setEditingRequest({ ...editingRequest, emergency_level: e.target.value })}
                            >
                                <option value="Normal">Normal</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Critical">Critical</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Contact Number"
                                required
                                className="w-full border p-2 rounded"
                                value={editingRequest.contact_number}
                                onChange={e => setEditingRequest({ ...editingRequest, contact_number: e.target.value })}
                            />
                            <select
                                className="w-full border p-2 rounded"
                                value={editingRequest.status}
                                onChange={e => setEditingRequest({ ...editingRequest, status: e.target.value })}
                            >
                                <option value="Open">Open</option>
                                <option value="Fulfilled">Fulfilled</option>
                                <option value="Closed">Closed</option>
                            </select>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingRequest(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700">Update Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Stock Modal */}
            {showStockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Add Blood Stock</h2>
                        <form onSubmit={handleStockSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                <select
                                    className="w-full border p-2 rounded"
                                    value={newStock.blood_group}
                                    onChange={e => setNewStock({ ...newStock, blood_group: e.target.value })}
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter donor name"
                                    required
                                    className="w-full border p-2 rounded"
                                    value={newStock.donor_name}
                                    onChange={e => setNewStock({ ...newStock, donor_name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Donation Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border p-2 rounded"
                                        value={newStock.donation_date}
                                        onChange={e => setNewStock({ ...newStock, donation_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border p-2 rounded"
                                        value={newStock.expiry_date}
                                        onChange={e => setNewStock({ ...newStock, expiry_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Units)</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    className="w-full border p-2 rounded"
                                    value={newStock.quantity}
                                    onChange={e => setNewStock({ ...newStock, quantity: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowStockModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700">Add Stock</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Stock Modal */}
            {showEditStockModal && editingStock && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Edit Blood Stock</h2>
                        <form onSubmit={handleUpdateStock} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                <select
                                    className="w-full border p-2 rounded"
                                    value={editingStock.blood_group}
                                    onChange={e => setEditingStock({ ...editingStock, blood_group: e.target.value })}
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border p-2 rounded"
                                    value={editingStock.donor_name}
                                    onChange={e => setEditingStock({ ...editingStock, donor_name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Donation Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border p-2 rounded"
                                        value={editingStock.donation_date}
                                        onChange={e => setEditingStock({ ...editingStock, donation_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border p-2 rounded"
                                        value={editingStock.expiry_date}
                                        onChange={e => setEditingStock({ ...editingStock, expiry_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="w-full border p-2 rounded"
                                        value={editingStock.quantity}
                                        onChange={e => setEditingStock({ ...editingStock, quantity: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        className="w-full border p-2 rounded"
                                        value={editingStock.status}
                                        onChange={e => setEditingStock({ ...editingStock, status: e.target.value })}
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Reserved">Reserved</option>
                                        <option value="Issued">Issued</option>
                                        <option value="Expired">Expired</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditStockModal(false);
                                        setEditingStock(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Detailed Stock Modal */}
            {showDetailedStockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                Detailed Blood Stock {stockFilter !== 'All' && <span className="text-primary">({stockFilter})</span>}
                            </h2>
                            <div className="flex items-center gap-4">
                                {stockFilter !== 'All' && (
                                    <button
                                        onClick={() => setStockFilter('All')}
                                        className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-gray-700 font-medium transition-colors"
                                    >
                                        Show All Groups
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDetailedStockModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-auto flex-1">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donated Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {detailedStock
                                        .filter(s => stockFilter === 'All' || s.blood_group === stockFilter)
                                        .map(stock => (
                                            <tr key={stock.id}>
                                                <td className="px-6 py-4 font-bold text-gray-900">{stock.blood_group}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{stock.donor_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{stock.donation_date}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={new Date(stock.expiry_date) < new Date() ? 'text-red-600 font-bold' : 'text-gray-600'}>
                                                        {stock.expiry_date}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stock.status === 'Available' ? 'bg-green-100 text-green-800' :
                                                        stock.status === 'Issued' ? 'bg-blue-100 text-blue-800' :
                                                            stock.status === 'Expired' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {stock.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm space-x-3">
                                                    <button onClick={() => {
                                                        handleEditStock(stock);
                                                        // setShowDetailedStockModal(false); // Optional: close detail modal when editing
                                                    }} className="text-gray-600 hover:text-gray-900 font-medium">Edit</button>
                                                    {stock.status === 'Available' && (
                                                        <>
                                                            <button onClick={() => updateStockStatus(stock.id, 'Issued')} className="text-blue-600 hover:underline">Issue</button>
                                                            <button onClick={() => updateStockStatus(stock.id, 'Expired')} className="text-orange-600 hover:underline">Mark Expired</button>
                                                        </>
                                                    )}
                                                    <button onClick={() => deleteStock(stock.id)} className="text-red-600 hover:underline">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    {detailedStock.filter(s => stockFilter === 'All' || s.blood_group === stockFilter).length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-600 font-medium">No results found for {stockFilter}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowDetailedStockModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HospitalDashboard;
