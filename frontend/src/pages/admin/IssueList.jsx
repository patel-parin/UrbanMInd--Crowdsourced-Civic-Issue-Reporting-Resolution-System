import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MoreVertical, UserPlus, X, CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
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

    const stats = {
        total: issues.length,
        open: issues.filter(i => ['reported', 'assigned'].includes(i.status)).length,
        resolved: issues.filter(i => i.status === 'resolved').length,
        activeContractors: new Set(issues.map(i => i.contractorId?._id).filter(Boolean)).size
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader size="lg" color="blue" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Issue Management</h1>
                    <p className="text-gray-400">View and manage reported issues.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard title="Total Issues" value={stats.total} icon={AlertCircle} color="blue" />
                <StatsCard title="Open Issues" value={stats.open} icon={Clock} color="orange" />
                <StatsCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="green" />
                <StatsCard title="Active Contractors" value={stats.activeContractors} icon={Users} color="purple" />
            </div>

            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <Input
                            placeholder="Search issues or reporters..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="reported">Reported</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        <Button variant="secondary" icon={Filter}>Filter</Button>
                    </div>
                </div>
            </Card>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800 text-gray-400 uppercase text-xs font-medium">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Reporter</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Assigned To</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredIssues.map((issue) => (
                                <tr key={issue._id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{issue.title}</div>
                                        <div className="text-xs text-gray-400">{issue.category}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {issue.userId?.name || issue.userId?.email || 'Anonymous'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={issue.status}
                                            onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                                            className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border-none focus:ring-0 cursor-pointer ${issue.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                                                issue.status === 'reported' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}
                                        >
                                            <option value="reported" className="bg-gray-800 text-white">Reported</option>
                                            <option value="assigned" className="bg-gray-800 text-white">Assigned</option>
                                            <option value="in_progress" className="bg-gray-800 text-white">In Progress</option>
                                            <option value="resolved" className="bg-gray-800 text-white">Resolved</option>
                                            <option value="closed" className="bg-gray-800 text-white">Closed</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {issue.contractorId?.companyName || <span className="text-gray-500 italic">Unassigned</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{new Date(issue.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 flex gap-2 items-center">
                                        {!issue.contractorId && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleAssignClick(issue)}
                                                className="bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Assign
                                            </Button>
                                        )}
                                        {issue.status === 'fund_approval_pending' && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-orange-400 font-bold text-sm">${issue.fundAmount}</span>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
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
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Approve
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Assignment Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Assign Contractor</h3>
                                <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-400 mb-4">Select a contractor for: <span className="text-white font-medium">{selectedIssue?.title}</span></p>

                                {loadingContractors ? (
                                    <div className="flex justify-center py-8"><Loader /></div>
                                ) : contractors.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">No contractors found.</p>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                                        {contractors.map(contractor => (
                                            <button
                                                key={contractor._id}
                                                onClick={() => confirmAssignment(contractor._id)}
                                                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-left group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                                        {contractor.companyName?.charAt(0) || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{contractor.companyName}</p>
                                                        <p className="text-xs text-gray-400">Rating: {contractor.rating || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <UserPlus className="w-4 h-4 text-gray-500 group-hover:text-indigo-400" />
                                            </button>
                                        ))}
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
    <Card className="p-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${color}-500/20 text-${color}-400`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </Card>
);

export default IssueList;
