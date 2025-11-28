import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    // Default to citizen if no role selected, but usually they come from role select
    const role = location.state?.role || 'citizen';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
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
            const success = await login(formData.email, formData.password);
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
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 w-full max-w-md">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-6 pl-0 hover:bg-transparent hover:text-blue-400"
                    onClick={() => navigate('/role-select')}
                    icon={ArrowLeft}
                >
                    Back to Role Selection
                </Button>

                <Card className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400">
                            Login to your <span className="text-blue-400 capitalize">{role}</span> account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            containerClassName="mb-4"
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
                            className="w-full"
                            isLoading={loading}
                        >
                            Sign In
                        </Button>

                        <div className="text-center mt-6">
                            <p className="text-gray-400 text-sm">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    state={{ role }}
                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Login;
