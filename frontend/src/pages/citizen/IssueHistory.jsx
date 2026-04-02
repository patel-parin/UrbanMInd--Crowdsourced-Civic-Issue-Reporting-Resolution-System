import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { issueService } from '../../api/services/issueService';


const IssueHistory = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const data = await issueService.getMyIssues();
                setIssues(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch issues:", error);
                setIssues([]);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, []);

    const filteredIssues = issues.filter((issue) => {
        const matchesFilter = filter === 'all' || issue.status === filter;
        const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader size="lg" color="blue" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">My Reports</h1>
                <p className="text-gray-400">Track the status of your reported issues.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                        placeholder="Search issues..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['all', 'pending', 'in_progress', 'resolved'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Issues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIssues.map((issue, index) => (
                    <motion.div
                        key={issue._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link to={`/citizen/issue/${issue._id}`}>
                            <Card hover className="h-full flex flex-col p-0 overflow-hidden group">

                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={issue.images && issue.images.length > 0 ? `${import.meta.env.VITE_API_URL}${issue.images[0]}` : "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400"}
                                        alt={issue.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.src =
                                                "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400";
                                        }}
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${issue.status === "resolved"
                                                    ? "bg-green-500/80 text-white"
                                                    : issue.status === "pending"
                                                        ? "bg-orange-500/80 text-white"
                                                        : "bg-blue-500/80 text-white"
                                                }`}
                                        >
                                            {issue.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                        {issue.title}
                                    </h3>

                                    <div className="flex items-center text-gray-400 text-sm mb-2">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {new Date(issue.createdAt).toLocaleDateString()}
                                    </div>

                                    <div className="flex items-center text-gray-400 text-sm mb-4">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {issue.gps?.address || "No location"}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-700 flex justify-between items-center">
                                        <span className="text-sm text-gray-500 capitalize">
                                            {issue.category}
                                        </span>

                                        <span className="text-blue-400 text-sm font-medium">
                                            View Details →
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {filteredIssues.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Filter className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No issues found</h3>
                    <p className="text-gray-400">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
};

export default IssueHistory;
