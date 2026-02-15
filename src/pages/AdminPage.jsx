import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Search, Shield, Filter, Mail, Calendar, User, Briefcase, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import Avatar from '../components/Avatar';

const AdminPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // pending | all
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0, mentors: 0, students: 0, pending: 0 });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setUsers(data.users);

                // Calculate Stats
                const s = { total: data.users.length, mentors: 0, students: 0, pending: 0 };
                data.users.forEach(u => {
                    if (u.role === 'mentor') s.mentors++;
                    if (u.role === 'student') s.students++;
                    if (u.role === 'mentor' && !u.isVerified && u.verificationStatus === 'pending') s.pending++;
                });
                setStats(s);
            } else {
                toast.error(data.message || "Failed to fetch users");
                if (data.message === "Admin Access Required") navigate('/dashboard');
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching users");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (userId, status) => {
        // status: 'verified' | 'rejected'
        if (!window.confirm(`Are you sure you want to mark this user as ${status}?`)) return;

        const toastId = toast.loading(`Updating user status to ${status}...`);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/admin/verify/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();

            if (data.success) {
                setUsers(users.map(u => u._id === userId ? { ...u, isVerified: status === 'verified', verificationStatus: status } : u));
                // Update active stats locally
                if (status === 'verified') setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
                toast.success(`User ${status} successfully!`, { id: toastId });
            } else {
                toast.error(data.message, { id: toastId });
            }
        } catch (error) {
            toast.error("Server Error", { id: toastId });
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === 'pending') {
            return matchesSearch && u.role === 'mentor' && !u.isVerified && u.verificationStatus !== 'rejected';
        }
        return matchesSearch;
    });

    const exportCSV = () => {
        const headers = ["ID,Username,Email,Role,College,Branch,Status,Joined"];
        const rows = filteredUsers.map(u =>
            `${u._id},"${u.username}","${u.email}",${u.role},"${u.college}","${u.branch}",${u.verificationStatus},${new Date(u.createdAt).toLocaleDateString()}`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "users_export.csv");
        document.body.appendChild(link);
        link.click();
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="text-blue-600" size={32} /> Admin Panel
                        </h1>
                        <p className="text-gray-500 mt-1">Manage users, approve mentors, and oversee the platform.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={exportCSV} className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                            <Download size={18} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Users" value={stats.total} icon={User} color="blue" />
                    <StatCard label="Mentors" value={stats.mentors} icon={Briefcase} color="purple" />
                    <StatCard label="Students" value={stats.students} icon={Briefcase} color="green" />
                    <StatCard label="Pending Aprovals" value={stats.pending} icon={Shield} color="orange" />
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Tabs & Search */}
                    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                        <div className="flex bg-gray-200/80 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-4 py-2Rounded-lg text-sm font-bold transition-all rounded-lg ${activeTab === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Pending Verifications
                                {stats.pending > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{stats.pending}</span>}
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2Rounded-lg text-sm font-bold transition-all rounded-lg ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                All Users
                            </button>
                        </div>

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No users found matching your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(u => (
                                        <tr key={u._id} className="hover:bg-gray-50/50 transition duration-150">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={u.username} src={u.image} size="w-10 h-10" />
                                                    <div>
                                                        <div className="font-bold text-gray-900">{u.username}</div>
                                                        <div className="text-sm text-gray-500">{u.email}</div>
                                                        <div className="text-xs text-gray-400 flex gap-2 mt-0.5">
                                                            <span>{u.college || "No College"}</span>
                                                            <span>•</span>
                                                            <span>{u.branch || "No Branch"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${u.role === 'mentor' ? 'bg-purple-50 text-purple-700 border-purple-100' : (u.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100')}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={u.verificationStatus} isVerified={u.isVerified} role={u.role} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {activeTab === 'pending' || (u.role === 'mentor' && !u.isVerified) ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleVerify(u._id, 'verified')}
                                                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                                            title="Approve"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleVerify(u._id, 'rejected')}
                                                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                                            title="Reject"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-medium">No actions</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4`}>
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
            <Icon size={24} />
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-900 leading-none">{value}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">{label}</div>
        </div>
    </div>
);

const StatusBadge = ({ status, isVerified, role }) => {
    if (role === 'student') return <span className="text-green-600 text-xs font-bold flex items-center gap-1"><Check size={12} /> Auto-Verified</span>;

    if (status === 'verified' || isVerified) return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">Verified</span>;
    if (status === 'rejected') return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200">Rejected</span>;
    return <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-bold border border-yellow-200 animate-pulse">Pending Review</span>;
};

export default AdminPage;
