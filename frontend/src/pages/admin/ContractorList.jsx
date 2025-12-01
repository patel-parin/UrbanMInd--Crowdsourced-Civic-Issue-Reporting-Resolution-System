import { useEffect, useState } from 'react';
import { Users, Star, TrendingUp, DollarSign, Award } from 'lucide-react';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { adminService } from '../../api/services/adminService';

const ContractorList = () => {
    const [contractors, setContractors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('rating');

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader size="lg" color="blue" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Contractors</h1>
                    <p className="text-gray-400">Manage contractors and view performance metrics.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="rating">Rating</option>
                        <option value="efficiency">Efficiency</option>
                        <option value="cost">Lowest Cost</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contractors.map((contractor) => {
                    const isTopPerformer = contractor.rating >= 4.5 && contractor.efficiency >= 90;
                    const isBestValue = contractor.costPerTask < 500 && contractor.rating >= 4.0;

                    return (
                        <Card key={contractor._id} hover className="flex flex-col p-6 relative overflow-hidden">
                            {isTopPerformer && (
                                <div className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-500 text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                                    <Award className="w-3 h-3" /> Top Performer
                                </div>
                            )}
                            {isBestValue && !isTopPerformer && (
                                <div className="absolute top-0 right-0 bg-green-500/20 text-green-500 text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" /> Best Value
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400">
                                    {contractor.companyName?.charAt(0) || <Users className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{contractor.companyName}</h3>
                                    <p className="text-gray-400 text-sm">{contractor.userId?.email || 'No Email'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-800/50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-yellow-500 mb-1">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-bold">{contractor.rating?.toFixed(1) || 'N/A'}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Rating</p>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-500 mb-1">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="font-bold">{contractor.efficiency || 0}%</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Efficiency</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Completed Tasks</span>
                                    <span className="text-white font-medium">{contractor.completedTasks || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Avg Cost/Task</span>
                                    <span className="text-white font-medium">${contractor.costPerTask || 0}</span>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default ContractorList;
