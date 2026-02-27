import { useEffect, useState } from 'react';
import { Users, Star, TrendingUp, DollarSign, Award, Search, Filter } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import Loader from '../../components/common/Loader';
import { adminService } from '../../api/services/adminService';

const ContractorList = () => {
    const [contractors, setContractors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('rating');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchContractors = async () => {
        setLoading(true);
        try {
            const data = await adminService.getContractors({ sortBy });
            setContractors(data);
        } catch (error) {
            console.error('Failed to fetch contractors:', error);
            setContractors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContractors();
    }, [sortBy]);

    const filteredContractors = contractors.filter(c =>
        c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedContractors = [...filteredContractors].sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'efficiency') return (b.efficiency || 0) - (a.efficiency || 0);
        if (sortBy === 'cost') return (a.costPerTask || 0) - (b.costPerTask || 0);
        return 0;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader size="lg" color="indigo" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-indigo-200 mb-2">
                        Contractors
                    </h1>
                    <p className="text-gray-400">Manage workforce performance and metrics</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10 backdrop-blur-md">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search contractors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none text-sm text-white pl-9 pr-4 py-2 focus:ring-0 w-48 md:w-64"
                        />
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex items-center gap-2 px-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer"
                        >
                            <option value="rating" className="bg-gray-900">Highest Rated</option>
                            <option value="efficiency" className="bg-gray-900">Most Efficient</option>
                            <option value="cost" className="bg-gray-900">Lowest Cost</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedContractors.map((contractor, index) => {
                    const isTopPerformer = contractor.rating >= 4.5 && contractor.efficiency >= 90;
                    const isBestValue = contractor.costPerTask < 500 && contractor.rating >= 4.0;

                    return (
                        <GlassCard
                            key={contractor._id}
                            hover
                            className="flex flex-col group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Badges */}
                            <div className="absolute top-0 right-0 flex gap-2 p-4">
                                {isTopPerformer && (
                                    <div className="bg-yellow-500/20 text-yellow-400 p-1.5 rounded-lg backdrop-blur-md border border-yellow-500/30" title="Top Performer">
                                        <Award className="w-4 h-4" />
                                    </div>
                                )}
                                {isBestValue && (
                                    <div className="bg-green-500/20 text-green-400 p-1.5 rounded-lg backdrop-blur-md border border-green-500/30" title="Best Value">
                                        <DollarSign className="w-4 h-4" />
                                    </div>
                                )}
                            </div>

                            {/* Profile Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 p-0.5">
                                    <div className="w-full h-full bg-[#1a1f2e] rounded-xl flex items-center justify-center text-2xl font-bold text-white">
                                        {contractor.companyName?.charAt(0).toUpperCase() || <Users className="w-8 h-8" />}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                                        {contractor.companyName}
                                    </h3>
                                    <p className="text-gray-400 text-sm">{contractor.email}</p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-indigo-300/80">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        Active Now
                                    </div>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-2 text-yellow-400 mb-1">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-bold text-lg">{contractor.rating?.toFixed(1) || 'N/A'}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Rating</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="font-bold text-lg">{contractor.efficiency || 0}%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Efficiency</p>
                                </div>
                            </div>

                            {/* Footer Stats */}
                            <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Tasks Completed</span>
                                    <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">
                                        {contractor.completedTasks || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Avg Cost / Task</span>
                                    <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">
                                        ${contractor.costPerTask || 0}
                                    </span>
                                </div>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>
        </div>
    );
};

export default ContractorList;
