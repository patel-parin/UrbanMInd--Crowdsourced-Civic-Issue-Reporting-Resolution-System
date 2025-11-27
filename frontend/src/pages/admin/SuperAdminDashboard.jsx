import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, MapPin, Shield } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        city: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/create-admin', formData);
            toast.success(`City Admin for ${formData.city} created successfully!`);
            setFormData({ name: '', email: '', password: '', city: '' });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 w-full min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
                    <p className="text-gray-400">Manage City Administrators and Government Officials</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Create Admin Form */}
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-600/20 rounded-lg text-blue-500">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Create City Admin</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Official Name"
                                required
                            />
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="official@city.gov"
                                required
                            />
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Secure Password"
                                required
                            />
                            <Input
                                label="City / Jurisdiction"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="e.g., New York, Mumbai"
                                icon={MapPin}
                                required
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full mt-4"
                                isLoading={loading}
                                icon={Shield}
                            >
                                Create Administrator
                            </Button>
                        </form>
                    </Card>

                    {/* Info / Stats (Placeholder) */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-blue-600/10 border-blue-600/20">
                            <h3 className="text-lg font-bold text-white mb-2">System Overview</h3>
                            <p className="text-gray-400">
                                As Super Admin, you have the authority to appoint administrators for specific cities.
                                These administrators will manage issues and contractors within their jurisdiction.
                            </p>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Recent Actions</h3>
                            <div className="text-gray-500 text-sm text-center py-8">
                                No recent actions recorded.
                            </div>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SuperAdminDashboard;
