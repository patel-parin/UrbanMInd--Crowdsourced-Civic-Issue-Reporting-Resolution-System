import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { issueService } from '../../api/services/issueService';

const IssueList = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const data = await issueService.getAll();
                setIssues(data);
            } catch (error) {
                console.error('Failed to fetch issues:', error);
                // Fallback mock data
                setIssues([
                    { id: 1, title: 'Pothole on Main St', category: 'pothole', status: 'pending', date: '2023-10-25', reporter: 'John Doe' },
                    { id: 2, title: 'Broken Streetlight', category: 'streetlight', status: 'resolved', date: '2023-10-20', reporter: 'Jane Smith' },
                    { id: 3, title: 'Garbage Dump', category: 'garbage', status: 'in_progress', date: '2023-10-22', reporter: 'Mike Johnson' },
                    { id: 4, title: 'Water Leakage', category: 'water', status: 'pending', date: '2023-10-26', reporter: 'Sarah Wilson' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchIssues();
    }, []);

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
                    <h1 className="text-3xl font-bold text-white mb-2">Issue Management</h1>
                    <p className="text-gray-400">View and manage reported issues.</p>
                </div>
            </div>

            <Card className="mb-6 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <Input
                            placeholder="Search issues..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="secondary" icon={Filter}>Filter</Button>
                </div>
            </Card>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800 text-gray-400 uppercase text-xs font-medium">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Reporter</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {issues.map((issue) => (
                                <tr key={issue.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{issue.title}</td>
                                    <td className="px-6 py-4 text-gray-300 capitalize">{issue.category}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${issue.status === 'resolved'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : issue.status === 'pending'
                                                        ? 'bg-orange-500/20 text-orange-400'
                                                        : 'bg-blue-500/20 text-blue-400'
                                                }`}
                                        >
                                            {issue.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{issue.date}</td>
                                    <td className="px-6 py-4 text-gray-300">{issue.reporter}</td>
                                    <td className="px-6 py-4">
                                        <Button variant="ghost" size="sm" icon={MoreVertical} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default IssueList;
