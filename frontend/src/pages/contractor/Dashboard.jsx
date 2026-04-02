import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, DollarSign, TrendingUp, Star, Activity, ArrowUpRight, AlertCircle, X } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { issueService } from '../../api/services/issueService';

const ContractorDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [estimateForm, setEstimateForm] = useState({
        materials: '',
        labor: '',
        equipment: '',
        description: '',
        purpose: '',
        workType: '',
        timeline: '',
        notes: '',
        materialsList: [{ name: '', cost: '' }]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksData, profileData] = await Promise.all([
                    issueService.getAssignedTasks(),
                    issueService.getProfile()
                ]);
                setTasks(tasksData);
                setProfile(profileData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const updateStatus = async (taskId, newStatus) => {
        try {
            await issueService.updateStatus(taskId, newStatus);
            setTasks(tasks.map(task =>
                task._id === taskId ? { ...task, status: newStatus } : task
            ));
            toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update task status');
        }
    };

    const openEstimateModal = (task) => {
        setSelectedTask(task);
        setEstimateForm({ materials: '', labor: '', equipment: '', description: '', purpose: '', workType: '', timeline: '', notes: '', materialsList: [{ name: '', cost: '' }] });
        setIsEstimateModalOpen(true);
    };

    const handleEstimateSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTask) return;

        try {
            const { materials, labor, equipment, description, purpose, workType, timeline, notes, materialsList } = estimateForm;
            const data = {
                issueId: selectedTask._id,
                materials,
                labor,
                equipment,
                description,
                purpose,
                workType,
                timeline: Number(timeline) || 0,
                notes,
                materialsList: materialsList.filter(m => m.name && m.cost)
            };

            await issueService.submitCostEstimate(data);

            toast.success('Cost estimate submitted successfully');

            const total = Number(materials) + Number(labor) + Number(equipment);
            setTasks(tasks.map(t => t._id === selectedTask._id ? { ...t, status: 'fund_approval_pending', fundAmount: total } : t));

            setIsEstimateModalOpen(false);
        } catch (error) {
            console.error('Failed to submit estimate:', error);
            toast.error('Failed to submit estimate');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader size="lg" color="indigo" />
            </div>
        );
    }

    const activeTasks = tasks.filter(t => t.status !== 'resolved');
    const resolvedTasks = tasks.filter(t => t.status === 'resolved');
    const lastContract = resolvedTasks.length > 0 ? resolvedTasks[0] : null;

    const stats = {
        totalEarnings: resolvedTasks.reduce((acc, curr) => acc + (curr.fundAmount || 0), 0),
        pendingFunds: activeTasks.reduce((acc, curr) => acc + (curr.status === 'fund_approval_pending' ? (curr.fundAmount || 0) : 0), 0),
        rating: profile?.rating || 0,
        efficiency: profile?.efficiency || 0
    };

    return (
        <div className="p-6 space-y-8 animate-fade-in">
            {/* Header & Welcome */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-indigo-200 mb-2">
                        Welcome, {profile?.companyName || 'Contractor'}
                    </h1>
                    <p className="text-gray-400 text-lg">Here's your performance overview and active work.</p>
                </div>
                <div className="flex items-center gap-3 bg-yellow-500/10 px-5 py-2.5 rounded-2xl border border-yellow-500/20 backdrop-blur-md">
                    <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div>
                        <span className="block text-2xl font-bold text-white leading-none">{stats.rating.toFixed(1)}</span>
                        <span className="text-xs text-yellow-500 font-medium uppercase tracking-wider">Rating</span>
                    </div>
                </div>
            </div>

            {/* Financial & Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="p-6 relative overflow-hidden group hover:border-green-500/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 rounded-xl bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform duration-300">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-gray-400 text-sm font-medium">Total Earnings</span>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">${stats.totalEarnings.toLocaleString()}</p>
                </GlassCard>

                <GlassCard className="p-6 relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform duration-300">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-gray-400 text-sm font-medium">Pending Funds</span>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">${stats.pendingFunds.toLocaleString()}</p>
                </GlassCard>

                <GlassCard className="p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-gray-400 text-sm font-medium">Active Tasks</span>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">{activeTasks.length}</p>
                </GlassCard>

                <GlassCard className="p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-gray-400 text-sm font-medium">Efficiency</span>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">{stats.efficiency}%</p>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Tasks List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Activity className="w-5 h-5 text-indigo-400" />
                        </div>
                        Active Tasks
                    </h2>

                    {activeTasks.length > 0 ? (
                        activeTasks.map((task) => (
                            <motion.div key={task._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <GlassCard className="group relative overflow-hidden hover:border-indigo-500/30 transition-all duration-300">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.priority === 'high' ? 'bg-red-500' :
                                        task.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                                        }`} />
                                    <div className="p-6 pl-8 flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{task.title}</h3>
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                    task.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {task.priority || 'Normal'}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{task.description}</p>
                                            <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center bg-white/5 px-2 py-1 rounded-md border border-white/5"><MapPin className="w-3 h-3 mr-1.5 text-indigo-400" /> {task.location || task.gps?.address || 'Location N/A'}</span>
                                                <span className="flex items-center bg-white/5 px-2 py-1 rounded-md border border-white/5"><Clock className="w-3 h-3 mr-1.5 text-indigo-400" /> {new Date(task.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end justify-center gap-3 min-w-40 border-l border-white/5 pl-6 md:pl-6">
                                            <div className="text-right w-full">
                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">Current Status</span>
                                                <span className={`inline-block font-bold capitalize px-3 py-1 rounded-lg text-sm w-full text-center ${task.status === 'fund_approval_pending' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                                                    task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                                                        'bg-gray-700 text-gray-300 border border-gray-600'
                                                    }`}>
                                                    {task.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>

                                            {task.status === 'assigned' && (
                                                <Button size="sm" onClick={() => updateStatus(task._id, 'under_contractor_survey')} className="w-full bg-indigo-600 hover:bg-indigo-700 border-none shadow-lg shadow-indigo-500/20">Start Survey</Button>
                                            )}
                                            {task.status === 'under_contractor_survey' && (
                                                <Button size="sm" onClick={() => openEstimateModal(task)} className="w-full bg-orange-600 hover:bg-orange-700 border-none shadow-lg shadow-orange-500/20">Submit Estimate</Button>
                                            )}
                                            {task.status === 'in_progress' && (
                                                <Button size="sm" onClick={() => updateStatus(task._id, 'resolved')} className="w-full bg-green-600 hover:bg-green-700 border-none shadow-lg shadow-green-500/20">Complete Task</Button>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-gray-400 text-lg font-medium">No active tasks assigned.</p>
                            <p className="text-gray-500 text-sm mt-1">Check back later for new assignments.</p>
                        </div>
                    )}
                </div>

                {/* Last Contract / Recent Activity */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        Last Contract
                    </h2>

                    {lastContract ? (
                        <GlassCard className="p-6 relative overflow-hidden group hover:border-green-500/30 transition-all duration-300">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <CheckCircle className="w-32 h-32 text-green-500" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{lastContract.title}</h3>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{lastContract.description}</p>

                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-gray-500">Completed On</span>
                                        <span className="text-white font-medium bg-white/5 px-2 py-1 rounded-md">{new Date(lastContract.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-gray-500">Funds Earned</span>
                                        <span className="text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">${lastContract.fundAmount || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-gray-500">Location</span>
                                        <span className="text-white truncate max-w-[120px] bg-white/5 px-2 py-1 rounded-md" title={lastContract.location || lastContract.gps?.address}>{lastContract.location || lastContract.gps?.address || 'N/A'}</span>
                                    </div>
                                </div>

                                <Button variant="secondary" className="w-full mt-6 bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20" onClick={() => window.location.href = '/contractor/completed'}>
                                    View All History
                                </Button>
                            </div>
                        </GlassCard>
                    ) : (
                        <GlassCard className="p-12 text-center border-dashed">
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <AlertCircle className="w-6 h-6 text-gray-600" />
                            </div>
                            <p className="text-gray-500">No completed contracts yet.</p>
                        </GlassCard>
                    )}
                </div>
            </div>

            {/* Estimate Modal */}
            {isEstimateModalOpen && (
                <Modal onClose={() => setIsEstimateModalOpen(false)}>
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white">Submit Cost Estimate</h2>
                            <p className="text-gray-400 text-sm mt-1">Provide a detailed breakdown for approval.</p>
                        </div>

                        <form onSubmit={handleEstimateSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                            {/* Purpose & Work Type */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Purpose</label>
                                    <select
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                                        value={estimateForm.purpose}
                                        onChange={(e) => setEstimateForm({ ...estimateForm, purpose: e.target.value })}
                                    >
                                        <option value="" className="bg-gray-900">Select...</option>
                                        <option value="repair" className="bg-gray-900">Repair</option>
                                        <option value="replacement" className="bg-gray-900">Replacement</option>
                                        <option value="new_installation" className="bg-gray-900">New Installation</option>
                                        <option value="maintenance" className="bg-gray-900">Maintenance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Work Type</label>
                                    <select
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                                        value={estimateForm.workType}
                                        onChange={(e) => setEstimateForm({ ...estimateForm, workType: e.target.value })}
                                    >
                                        <option value="" className="bg-gray-900">Select...</option>
                                        <option value="electrical" className="bg-gray-900">Electrical</option>
                                        <option value="plumbing" className="bg-gray-900">Plumbing</option>
                                        <option value="civil" className="bg-gray-900">Civil</option>
                                        <option value="roads" className="bg-gray-900">Roads</option>
                                        <option value="sanitation" className="bg-gray-900">Sanitation</option>
                                        <option value="other" className="bg-gray-900">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Estimated Timeline (days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                                    value={estimateForm.timeline}
                                    onChange={(e) => setEstimateForm({ ...estimateForm, timeline: e.target.value })}
                                    placeholder="e.g. 7"
                                />
                            </div>

                            {/* Materials List */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Materials Breakdown</label>
                                {estimateForm.materialsList.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Material name"
                                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                            value={item.name}
                                            onChange={(e) => {
                                                const list = [...estimateForm.materialsList];
                                                list[idx].name = e.target.value;
                                                setEstimateForm({ ...estimateForm, materialsList: list });
                                            }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Cost"
                                            min="0"
                                            className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                            value={item.cost}
                                            onChange={(e) => {
                                                const list = [...estimateForm.materialsList];
                                                list[idx].cost = e.target.value;
                                                setEstimateForm({ ...estimateForm, materialsList: list });
                                            }}
                                        />
                                        {estimateForm.materialsList.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const list = estimateForm.materialsList.filter((_, i) => i !== idx);
                                                    setEstimateForm({ ...estimateForm, materialsList: list });
                                                }}
                                                className="text-red-400 hover:text-red-300 px-2"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setEstimateForm({ ...estimateForm, materialsList: [...estimateForm.materialsList, { name: '', cost: '' }] })}
                                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mt-1"
                                >
                                    + Add Material
                                </button>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <h4 className="text-sm font-bold text-gray-300 mb-3">Cost Summary</h4>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Materials ($)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        value={estimateForm.materials}
                                        onChange={(e) => setEstimateForm({ ...estimateForm, materials: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Labor ($)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        value={estimateForm.labor}
                                        onChange={(e) => setEstimateForm({ ...estimateForm, labor: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Equipment ($)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        value={estimateForm.equipment}
                                        onChange={(e) => setEstimateForm({ ...estimateForm, equipment: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Total Preview */}
                            {(estimateForm.materials || estimateForm.labor || estimateForm.equipment) && (
                                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-center">
                                    <span className="text-sm text-gray-400">Total Estimate: </span>
                                    <span className="text-xl font-bold text-indigo-400">
                                        ${(Number(estimateForm.materials || 0) + Number(estimateForm.labor || 0) + Number(estimateForm.equipment || 0)).toLocaleString()}
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Additional Notes</label>
                                <textarea
                                    rows="2"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
                                    value={estimateForm.description}
                                    onChange={(e) => setEstimateForm({ ...estimateForm, description: e.target.value })}
                                    placeholder="Briefly describe the work required..."
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-none"
                                    onClick={() => setIsEstimateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none shadow-lg shadow-indigo-500/25"
                                >
                                    Submit Estimate
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ContractorDashboard;
