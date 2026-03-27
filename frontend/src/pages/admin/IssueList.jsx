import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MoreVertical, UserPlus, X, CheckCircle, Clock, AlertCircle, Users, ArrowUpRight, FileText, Eye, Mic, DollarSign, Wrench, MapPin, Calendar, User, Image as ImageIcon } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import Loader from '../../components/common/Loader';
import { issueService } from '../../api/services/issueService';
import { adminService } from '../../api/services/adminService';
import toast from 'react-hot-toast';

const IssueList = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Assignment State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [contractors, setContractors] = useState([]);
    const [loadingContractors, setLoadingContractors] = useState(false);

    const fetchIssues = async () => {
        try {
            const data = await issueService.getAll();
            setIssues(data);
        } catch (error) {
            console.error('Failed to fetch issues:', error);
            toast.error('Failed to load issues');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const handleAssignClick = async (issue) => {
        setSelectedIssue(issue);
        setShowAssignModal(true);
        setLoadingContractors(true);
        try {
            const data = await adminService.getContractors();
            setContractors(data);
        } catch (error) {
            console.error('Failed to fetch contractors:', error);
            toast.error('Failed to load contractors');
        } finally {
            setLoadingContractors(false);
        }
    };

    const confirmAssignment = async (contractorId) => {
        try {
            await issueService.assignContractor(selectedIssue._id, contractorId);
            toast.success('Contractor assigned successfully');
            setShowAssignModal(false);
            fetchIssues(); // Refresh list
        } catch (error) {
            console.error('Assignment failed:', error);
            toast.error('Failed to assign contractor');
        }
    };

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            await issueService.updateStatus(issueId, newStatus);
            toast.success('Status updated');
            fetchIssues();
        } catch (error) {
            console.error('Status update failed:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredIssues = issues.filter(issue => {
        const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase()) ||
            (issue.userId?.name || 'Anonymous').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const generateReport = () => {
        const headers = ["Title", "Category", "Reporter", "Status", "Priority", "Date", "Description"];
        const csvContent = [
            headers.join(","),
            ...filteredIssues.map(issue => [
                `"${issue.title}"`,
                issue.category,
                `"${issue.userId?.name || 'Anonymous'}"`,
                issue.status,
                issue.priority,
                new Date(issue.createdAt).toLocaleDateString(),
                `"${issue.description.replace(/"/g, '""')}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "issues_report.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const stats = {
        total: issues.length,
        open: issues.filter(i => ['reported', 'assigned'].includes(i.status)).length,
        resolved: issues.filter(i => i.status === 'resolved').length,
        activeContractors: new Set(issues.map(i => i.contractorId?._id).filter(Boolean)).size
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader size="lg" color="indigo" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-indigo-200 mb-2">
                        Issue Management
                    </h1>
                    <p className="text-gray-400">Track and resolve community reports</p>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10 backdrop-blur-md">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search issues..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-none text-sm text-white pl-9 pr-4 py-2 focus:ring-0 w-48 md:w-64"
                        />
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex items-center gap-2 px-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer"
                        >
                            <option value="all" className="bg-gray-900">All Status</option>
                            <option value="reported" className="bg-gray-900">Reported</option>
                            <option value="assigned" className="bg-gray-900">Assigned</option>
                            <option value="under_contractor_survey" className="bg-gray-900">Under Survey</option>
                            <option value="fund_approval_pending" className="bg-gray-900">Fund Pending</option>
                            <option value="in_progress" className="bg-gray-900">In Progress</option>
                            <option value="resolved" className="bg-gray-900">Resolved</option>
                            <option value="closed" className="bg-gray-900">Closed</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={generateReport}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <FileText className="w-4 h-4" />
                    <span>Generate Report</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard title="Total Issues" value={stats.total} icon={AlertCircle} color="blue" />
                <StatsCard title="Open Issues" value={stats.open} icon={Clock} color="orange" />
                <StatsCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="green" />
                <StatsCard title="Active Contractors" value={stats.activeContractors} icon={Users} color="purple" />
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 uppercase text-xs font-medium tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Reporter</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Assigned To</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredIssues.map((issue) => (
                                <tr key={issue._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white group-hover:text-indigo-300 transition-colors">{issue.title}</div>
                                        <div className="text-xs text-gray-500 mt-1 px-2 py-0.5 bg-white/5 rounded-full w-fit">{issue.category}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-linear-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                                                {(issue.userId?.name || 'A').charAt(0)}
                                            </div>
                                            <span className="text-gray-300 text-sm">{issue.userId?.name || 'Anonymous'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={issue.status}
                                            onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border-none focus:ring-0 cursor-pointer transition-all duration-300 ${issue.status === 'resolved' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                                                issue.status === 'reported' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                                                    'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                                }`}
                                        >
                                            <option value="reported" className="bg-gray-900">Reported</option>
                                            <option value="assigned" className="bg-gray-900">Assigned</option>
                                            <option value="in_progress" className="bg-gray-900">In Progress</option>
                                            <option value="resolved" className="bg-gray-900">Resolved</option>
                                            <option value="closed" className="bg-gray-900">Closed</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {issue.contractorId ? (
                                            <div className="flex items-center gap-2 text-indigo-300">
                                                <Users className="w-4 h-4" />
                                                <span>{issue.contractorId.companyName}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-600 italic text-sm">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">{new Date(issue.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedIssue(issue);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-300"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {!issue.contractorId && (
                                                <button
                                                    onClick={() => handleAssignClick(issue)}
                                                    className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all duration-300"
                                                    title="Assign Contractor"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                </button>
                                            )}
                                            {issue.status === 'fund_approval_pending' && (
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`Approve funds of $${issue.fundAmount}?`)) {
                                                            try {
                                                                await issueService.approveFunds(issue._id);
                                                                toast.success('Funds approved!');
                                                                fetchIssues();
                                                            } catch (error) {
                                                                console.error('Failed to approve funds:', error);
                                                                toast.error('Failed to approve funds');
                                                            }
                                                        }
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-300 text-xs font-bold flex items-center gap-1"
                                                >
                                                    Approve ${issue.fundAmount}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Assignment Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
                        >
                            {/* Glow Effect */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
                                <h3 className="text-xl font-bold text-white">Assign Contractor</h3>
                                <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 relative z-10">
                                <p className="text-gray-400 mb-4 text-sm">Select a contractor for: <span className="text-white font-medium block mt-1 text-base">{selectedIssue?.title}</span></p>

                                {loadingContractors ? (
                                    <div className="flex justify-center py-8"><Loader color="indigo" /></div>
                                ) : contractors.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">No contractors found.</p>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                        {contractors.map(contractor => (
                                            <button
                                                key={contractor._id}
                                                onClick={() => confirmAssignment(contractor._id)}
                                                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 text-left group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 group-hover:border-indigo-500/50 transition-colors">
                                                        {contractor.companyName?.charAt(0) || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white group-hover:text-indigo-300 transition-colors">{contractor.companyName}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-gray-400">Rating:</span>
                                                            <span className="text-xs font-bold text-yellow-400">{contractor.rating?.toFixed(1) || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                                    <UserPlus className="w-4 h-4" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Issue Details Modal */}
            <AnimatePresence>
                {showDetailsModal && selectedIssue && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#020617]/80 backdrop-blur-[24px]">
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                            className="bg-[#09090b]/80 border border-white/10 rounded-[2rem] w-full max-w-5xl shadow-[0_0_120px_rgba(99,102,241,0.25)] relative max-h-[90vh] flex flex-col overflow-hidden backdrop-blur-3xl ring-1 ring-white/5"
                        >
                            {/* Intense Dynamic Neon Glows */}
                            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/30 blur-[120px] pointer-events-none mix-blend-screen" />
                            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none mix-blend-screen" />
                            <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none mix-blend-screen" />

                            {/* Ultra-Premium Header */}
                            <div className="px-6 md:px-10 py-8 relative z-10 bg-gradient-to-b from-white/[0.08] to-transparent border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                                <div className="pr-12">
                                    <div className="flex flex-wrap items-center gap-3 mb-5">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-y-0 border-r-0 border-l-4 shadow-lg backdrop-blur-md ${
                                            selectedIssue.priority === 'critical' ? 'bg-red-500/10 text-red-400 border-l-red-500 shadow-red-500/20' :
                                            selectedIssue.priority === 'high' ? 'bg-orange-500/10 text-orange-400 border-l-orange-500 shadow-orange-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-l-blue-500 shadow-blue-500/20'
                                        }`}>
                                            {selectedIssue.priority} Priority
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/20 text-white text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-md">
                                            {selectedIssue.category}
                                        </span>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-y-0 border-r-0 border-l-4 flex items-center gap-2 shadow-lg backdrop-blur-md ${
                                            selectedIssue.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-l-green-500 shadow-green-500/20' : 
                                            selectedIssue.status === 'fund_approval_pending' ? 'bg-amber-500/10 text-amber-400 border-l-amber-500 shadow-amber-500/20' :
                                            'bg-indigo-500/10 text-indigo-400 border-l-indigo-500 shadow-indigo-500/20'
                                        }`}>
                                            <div className={`w-2 h-2 rounded-full ${selectedIssue.status === 'resolved' ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : selectedIssue.status === 'fund_approval_pending' ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]' : 'bg-indigo-400 shadow-[0_0_10px_#818cf8]'} animate-pulse`} />
                                            {selectedIssue.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-100 via-white to-fuchsia-200 leading-tight drop-shadow-lg tracking-tight">
                                        {selectedIssue.title}
                                    </h2>
                                </div>
                                <button 
                                    onClick={() => setShowDetailsModal(false)} 
                                    className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/50 flex items-center justify-center text-gray-300 hover:text-red-400 hover:scale-110 transition-all duration-300 shadow-xl"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-1 relative z-10">
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left Column (Content) */}
                                    <div className="lg:col-span-2 space-y-8">
                                        
                                        {/* Description Card */}
                                        <section className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group shadow-2xl">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-400 to-fuchsia-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                                            <h4 className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 drop-shadow-md">
                                                <FileText className="w-4 h-4" /> Issue Description
                                            </h4>
                                            <p className="text-gray-200 text-sm md:text-lg whitespace-pre-wrap leading-relaxed font-medium">
                                                {selectedIssue.description}
                                            </p>
                                        </section>

                                        {/* Voice Note Card */}
                                        {selectedIssue.voiceNoteUrl && (
                                            <section className="bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 p-5 rounded-3xl flex items-center gap-5 shadow-[0_10px_30px_rgba(6,182,212,0.1)] relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.4)] z-10 hover:scale-110 transition-transform">
                                                    <Mic className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 w-full min-w-0 z-10">
                                                    <h4 className="text-sm font-black text-cyan-300 mb-2 tracking-wide">Audio Evidence</h4>
                                                    <audio
                                                        controls
                                                        className="w-full h-9 rounded-full opacity-90 custom-audio-player filter drop-shadow-lg"
                                                        src={selectedIssue.voiceNoteUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedIssue.voiceNoteUrl}` : selectedIssue.voiceNoteUrl}
                                                    />
                                                </div>
                                            </section>
                                        )}

                                        {/* Evidence Images Grid */}
                                        {selectedIssue.images && selectedIssue.images.length > 0 && (
                                            <section>
                                                <h4 className="text-xs font-black text-fuchsia-300 uppercase tracking-[0.2em] mb-5 flex items-center gap-2 ml-2">
                                                    <ImageIcon className="w-4 h-4" /> Attached Media Gallery
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    {selectedIssue.images.map((img, idx) => (
                                                        <a 
                                                            key={idx} 
                                                            href={img.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}` : img} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="block rounded-3xl overflow-hidden border border-white/20 group relative cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-black/50 aspect-video sm:aspect-auto sm:h-64"
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col items-center justify-end pb-6 backdrop-blur-[2px]">
                                                                <span className="bg-white text-fuchsia-900 text-xs px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] font-black tracking-widest flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                                   <Eye className="w-4 h-4" /> VIEW FULL
                                                                </span>
                                                            </div>
                                                            <img
                                                                src={img.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}` : img}
                                                                alt={`Evidence ${idx + 1}`}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        </a>
                                                    ))}
                                                </div>
                                            </section>
                                        )}
                                    </div>

                                    {/* Right Column (Cards) */}
                                    <div className="space-y-6">
                                        
                                        {/* Neon Location Card */}
                                        <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-3xl p-6 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300">
                                            <div className="absolute top-0 right-0 p-6 text-blue-400/10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                                                <MapPin className="w-32 h-32" />
                                            </div>
                                            <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 relative z-10">
                                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                                    <MapPin className="w-3 h-3 text-blue-300" />
                                                </div>
                                                Location Details
                                            </h4>
                                            <div className="space-y-4 relative z-10">
                                                <div className="flex justify-between items-center text-sm border-b border-blue-500/10 pb-3">
                                                    <span className="text-blue-200/60 font-medium">City</span>
                                                    <span className="text-white font-bold tracking-wide">{selectedIssue.city || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-b border-blue-500/10 pb-3">
                                                    <span className="text-blue-200/60 font-medium">District</span>
                                                    <span className="text-white font-bold tracking-wide">{selectedIssue.district || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-b border-blue-500/10 pb-3">
                                                    <span className="text-blue-200/60 font-medium">State</span>
                                                    <span className="text-white font-bold tracking-wide">{selectedIssue.state || 'N/A'}</span>
                                                </div>
                                                <div className="pt-2">
                                                    <span className="text-blue-200/60 text-xs font-bold block mb-2 uppercase tracking-wider">Exact Address / GPS</span>
                                                    <p className="text-blue-50 text-sm leading-relaxed bg-black/40 p-3.5 rounded-xl border border-blue-500/20 shadow-inner">
                                                        {selectedIssue.gps?.address || 'Address not listed'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Neon Reporter Card */}
                                        <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-3xl p-6 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300">
                                            <div className="absolute top-0 right-0 p-6 text-purple-400/10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                                                <User className="w-32 h-32" />
                                            </div>
                                            <h4 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 relative z-10">
                                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                                                    <User className="w-3 h-3 text-purple-300" />
                                                </div>
                                                Reporter Identity
                                            </h4>
                                            <div className="flex items-center gap-4 mb-6 relative z-10 bg-black/40 p-3 rounded-2xl border border-purple-500/20 shadow-inner">
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 border border-white/20 flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                                                    {(selectedIssue.userId?.name || 'A').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-black text-lg tracking-tight">{selectedIssue.userId?.name || 'Anonymous'}</p>
                                                    <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mt-0.5">Community Member</p>
                                                </div>
                                            </div>
                                            <div className="pt-2 flex justify-between items-center text-sm relative z-10 bg-purple-500/10 px-4 py-3 rounded-xl border border-purple-500/20">
                                                <span className="text-purple-200/80 font-bold flex items-center gap-2 text-xs uppercase tracking-wider"><Calendar className="w-3.5 h-3.5" /> Logged On</span>
                                                <span className="text-white font-black">{new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Hyper-Premium Fund Request Card */}
                                        {(selectedIssue.status === 'fund_approval_pending' || selectedIssue.fundRequest?.purpose || selectedIssue.fundAmount) && (
                                            <div className="bg-gradient-to-br from-amber-500/20 via-[#1e1b4b] to-orange-600/10 border border-amber-500/40 rounded-3xl p-7 relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)] group hover:shadow-[0_0_80px_rgba(245,158,11,0.3)] transition-all duration-500">
                                                {/* Animated glow */}
                                                <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/30 blur-[40px] rounded-full pointer-events-none group-hover:bg-amber-400/40 transition-colors duration-500" />
                                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 shadow-[0_0_20px_#f59e0b]" />
                                                
                                                <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 uppercase tracking-widest mb-6 flex items-center gap-2 drop-shadow-md">
                                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                                                        <DollarSign className="w-4 h-4 text-amber-300" />
                                                    </div>
                                                    Funding Proposal
                                                </h4>
                                                
                                                <div className="space-y-5 relative z-10">
                                                    {selectedIssue.fundRequest?.purpose && (
                                                        <div className="bg-black/40 p-4 rounded-2xl border border-amber-500/20 shadow-inner">
                                                            <span className="text-amber-500/80 text-[10px] font-black uppercase tracking-widest block mb-2">Core Objective</span>
                                                            <p className="text-amber-50 text-sm font-semibold leading-relaxed">{selectedIssue.fundRequest.purpose}</p>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {selectedIssue.fundRequest?.workType && (
                                                            <div className="bg-amber-950/40 p-3.5 rounded-2xl border border-amber-500/30 shadow-inner flex flex-col justify-center">
                                                                <span className="text-amber-500/80 text-[10px] font-black uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
                                                                    <Wrench className="w-3.5 h-3.5" /> Type
                                                                </span>
                                                                <span className="text-white text-sm font-black tracking-wide">
                                                                    {selectedIssue.fundRequest.workType}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {selectedIssue.fundRequest?.timeline && (
                                                            <div className="bg-amber-950/40 p-3.5 rounded-2xl border border-amber-500/30 shadow-inner flex flex-col justify-center">
                                                                <span className="text-amber-500/80 text-[10px] font-black uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
                                                                    <Clock className="w-3.5 h-3.5" /> ETA
                                                                </span>
                                                                <span className="text-white text-sm font-black tracking-wide">
                                                                    {selectedIssue.fundRequest.timeline} Days
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {selectedIssue.fundRequest?.materialsList?.length > 0 && (
                                                        <div className="bg-black/40 p-4.5 rounded-2xl border border-amber-500/20 shadow-inner mt-2 relative overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
                                                            <span className="text-amber-500/80 text-[10px] font-black uppercase tracking-widest block mb-3 pl-3">Budget Breakdown</span>
                                                            <div className="space-y-3 pl-3">
                                                                {selectedIssue.fundRequest.materialsList.map((mat, idx) => (
                                                                    <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-amber-500/10 last:border-0 last:pb-0">
                                                                        <span className="text-gray-300 font-semibold">{mat.name}</span>
                                                                        <span className="text-amber-400 font-mono font-black tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">₹{mat.cost?.toLocaleString()}</span>
                                                                    </div>
                                                                ))}
                                                                <div className="pt-4 mt-2 border-t border-amber-500/30 flex justify-between items-end">
                                                                    <span className="text-amber-500 font-black text-xs uppercase tracking-widest">Total Valuation</span>
                                                                    <span className="text-white font-black font-mono text-2xl tracking-tighter drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                                                                        <span className="text-amber-500 mr-1">₹</span>{selectedIssue.fundAmount?.toLocaleString() || '0'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedIssue.fundRequest?.notes && (
                                                        <div className="bg-orange-950/30 p-4 rounded-2xl border border-orange-500/30">
                                                            <span className="text-orange-400 text-[10px] font-black uppercase tracking-widest block mb-2">Contractor Remarks</span>
                                                            <p className="text-orange-100/90 text-xs leading-relaxed italic border-l-2 border-orange-500/50 pl-3">{selectedIssue.fundRequest.notes}</p>
                                                        </div>
                                                    )}

                                                    {selectedIssue.status === 'fund_approval_pending' && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await issueService.approveFunds(selectedIssue._id);
                                                                    toast.success('Funds approved successfully! ✅', {
                                                                        style: {
                                                                            background: '#020617',
                                                                            color: '#4ade80',
                                                                            border: '1px solid #22c55e',
                                                                            boxShadow: '0 0 20px rgba(34,197,94,0.3)',
                                                                        }
                                                                    });
                                                                    setShowDetailsModal(false);
                                                                    fetchIssues();
                                                                } catch (error) {
                                                                    toast.error('Failed to approve funds ❌');
                                                                }
                                                            }}
                                                            className="w-full mt-6 py-4 rounded-2xl bg-amber-500 text-black font-black text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.7)] hover:-translate-y-1 hover:bg-amber-400 group relative overflow-hidden"
                                                        >
                                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                                            <CheckCircle className="w-5 h-5 relative z-10" />
                                                            <span className="relative z-10">Authorize Transfer</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatsCard = ({ title, value, icon: Icon, color }) => (
    <GlassCard className="p-6 flex items-center gap-4 group hover:border-white/20 transition-all duration-300">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7" />
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">{value}</p>
                <ArrowUpRight className={`w-3 h-3 text-${color}-400`} />
            </div>
        </div>
    </GlassCard>
);

export default IssueList;
