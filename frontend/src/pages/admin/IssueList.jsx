import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MoreVertical, UserPlus, X, CheckCircle, Clock, AlertCircle, Users, ArrowUpRight, FileText, Eye, Mic } from 'lucide-react';
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
                            <option value="in_progress" className="bg-gray-900">In Progress</option>
                            <option value="resolved" className="bg-gray-900">Resolved</option>
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h3 className="text-xl font-bold text-white">Issue Details</h3>
                                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">{selectedIssue.title}</h2>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedIssue.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                            selectedIssue.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {selectedIssue.priority} Priority
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider">
                                            {selectedIssue.category}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedIssue.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/20 text-indigo-400'
                                            }`}>
                                            {selectedIssue.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                                        {selectedIssue.description}
                                    </p>

                                    {selectedIssue.voiceNoteUrl && (
                                        <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                            <h4 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                                                <Mic className="w-4 h-4" /> Voice Note
                                            </h4>
                                            <audio
                                                controls
                                                className="w-full h-8"
                                                src={selectedIssue.voiceNoteUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL}${selectedIssue.voiceNoteUrl}` : selectedIssue.voiceNoteUrl}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Location Details</h4>
                                        <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">City:</span>
                                                <span className="text-white">{selectedIssue.city}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">District:</span>
                                                <span className="text-white">{selectedIssue.district}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">State:</span>
                                                <span className="text-white">{selectedIssue.state}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Address:</span>
                                                <span className="text-white text-right truncate max-w-[200px]" title={selectedIssue.address}>{selectedIssue.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Reporter Info</h4>
                                        <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Name:</span>
                                                <span className="text-white">{selectedIssue.userId?.name || 'Anonymous'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Date:</span>
                                                <span className="text-white">{new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedIssue.imageUrl && (
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Attached Image</h4>
                                        <div className="rounded-xl overflow-hidden border border-white/10">
                                            <img src={selectedIssue.imageUrl} alt="Issue" className="w-full h-auto object-cover max-h-[400px]" />
                                        </div>
                                    </div>
                                )}
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
