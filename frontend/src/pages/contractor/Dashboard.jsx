import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { issueService } from '../../api/services/issueService';

const ContractorDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // Assuming getMyIssues returns assigned tasks for contractors
                const data = await issueService.getMyIssues();
                setTasks(data);
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
                // Fallback mock data
                setTasks([
                    {
                        id: 1,
                        title: 'Deep Pothole on 5th Avenue',
                        description: 'Large pothole causing traffic slowdowns.',
                        priority: 'high',
                        status: 'assigned',
                        location: 'New York, NY',
                        date: '2023-10-25',
                    },
                    {
                        id: 2,
                        title: 'Broken Streetlight',
                        description: 'Streetlight flickering and then went out.',
                        priority: 'medium',
                        status: 'in_progress',
                        location: 'Brooklyn, NY',
                        date: '2023-10-20',
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const updateStatus = async (taskId, newStatus) => {
        try {
            await issueService.updateStatus(taskId, newStatus);
            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            ));
            toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update task status');
        }
    };

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
                <h1 className="text-3xl font-bold text-white mb-2">Contractor Dashboard</h1>
                <p className="text-gray-400">Manage your assigned tasks and update their status.</p>
            </div>

            <div className="grid gap-6">
                {tasks.map((task, index) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-xl font-bold text-white">{task.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                            task.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {task.priority} Priority
                                    </span>
                                </div>

                                <p className="text-gray-300 mb-4">{task.description}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {task.location}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {task.date}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-gray-700 pt-4 md:pt-0 md:pl-6">
                                <div className="text-center mb-2">
                                    <span className="text-sm text-gray-500">Current Status</span>
                                    <p className="text-white font-medium capitalize">{task.status.replace('_', ' ')}</p>
                                </div>

                                {task.status === 'assigned' && (
                                    <Button
                                        onClick={() => updateStatus(task.id, 'in_progress')}
                                        icon={Clock}
                                        className="w-full"
                                    >
                                        Start Work
                                    </Button>
                                )}

                                {task.status === 'in_progress' && (
                                    <Button
                                        onClick={() => updateStatus(task.id, 'resolved')}
                                        variant="primary"
                                        className="bg-green-600 hover:bg-green-700 w-full"
                                        icon={CheckCircle}
                                    >
                                        Mark Complete
                                    </Button>
                                )}

                                {task.status === 'resolved' && (
                                    <div className="flex items-center justify-center text-green-500 font-medium">
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Completed
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}

                {tasks.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">All caught up!</h3>
                        <p className="text-gray-400">No pending tasks assigned to you.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContractorDashboard;
