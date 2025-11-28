import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowLeft, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

const Register = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { register } = useAuth();

    // Prevent admin registration via URL manipulation
    const role = (location.state?.role === 'admin' || location.state?.role === 'superadmin')
        ? 'citizen'
        : (location.state?.role || 'citizen');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '', // Optional
        role: role,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const success = await register(formData);
            if (!success) {
                setLoading(false);
            }
        } catch (err) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-900">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900" />
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 w-full max-w-md">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-6 pl-0 hover:bg-transparent hover:text-blue-400"
                    onClick={() => navigate('/login', { state: { role } })}
                    icon={ArrowLeft}
                >
                    Back to Login
                </Button>

                <Card className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-gray-400">
                            Join as a <span className="text-blue-400 capitalize">{role}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Full Name"
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Phone Number (Optional)"
                            type="tel"
                            name="phone"
                            placeholder="+1 234 567 8900"
                            value={formData.phone}
                            onChange={handleChange}
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full mt-4"
                            isLoading={loading}
                        >
                            Create Account
                        </Button>

                        <div className="text-center mt-6">
                            <p className="text-gray-400 text-sm">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    state={{ role }}
                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Register;
