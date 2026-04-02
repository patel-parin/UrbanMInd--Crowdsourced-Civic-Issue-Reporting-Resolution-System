import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, User, HardHat, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import GlassCard from '../../components/common/GlassCard';
import ParticleBackground from '../../components/ParticleBackground';

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [role, setRole] = useState(location.state?.role || 'citizen');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (location.state?.role) {
            setRole(location.state.role);
        }
    }, [location.state]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Pass role to login function if your auth context supports it, 
            // otherwise just login and let backend handle role verification
            const success = await login(formData.email, formData.password, role);
            if (!success) {
                setLoading(false);
            }
        } catch (err) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    const roles = [
        { id: 'citizen', label: 'Citizen', icon: User, color: 'text-blue-400', activeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
        { id: 'contractor', label: 'Contractor', icon: HardHat, activeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/50' },
        { id: 'admin', label: 'Admin', icon: Shield, activeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
    ];

    return (
        <div className="fixed inset-0 w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-[#0f172a]">
            {/* Animated Background Elements */}
            <ParticleBackground />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-6 pl-0 hover:bg-transparent text-gray-400 hover:text-white transition-colors group"
                        onClick={() => navigate('/')}
                        icon={ArrowLeft}
                    >
                        <span className="group-hover:-translate-x-1 transition-transform inline-block">Back to Home</span>
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <GlassCard className="p-8 md:p-10 backdrop-blur-2xl border-white/10 shadow-2xl shadow-indigo-500/10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
                            <p className="text-gray-400">
                                Login to your account
                            </p>
                        </div>

                        {/* Role Selection Tabs */}
                        <div className="flex p-1 mb-8 bg-black/20 rounded-xl border border-white/5">
                            {roles.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => setRole(r.id)}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-300
                                        ${role === r.id
                                            ? `${r.activeClass} shadow-lg`
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <r.icon className={`w-4 h-4 ${role === r.id ? '' : 'opacity-70'}`} />
                                    {r.label}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    icon={Mail}
                                    className="bg-white/5 border-white/10 focus:border-indigo-500/50 focus:bg-white/10 h-12"
                                />

                                <Input
                                    label="Password"
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    icon={Lock}
                                    className="bg-white/5 border-white/10 focus:border-indigo-500/50 focus:bg-white/10 h-12"
                                />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 border-none text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                isLoading={loading}
                            >
                                Sign In as {roles.find(r => r.id === role)?.label}
                            </Button>

                            <div className="text-center mt-6 pt-4 border-t border-white/5">
                                {role !== 'admin' ? (
                                    <p className="text-gray-400 text-sm">
                                        Don't have an account?{' '}
                                        <Link
                                            to="/register"
                                            state={{ role }}
                                            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors hover:underline decoration-2 underline-offset-4"
                                        >
                                            Create {roles.find(r => r.id === role)?.label} Account
                                        </Link>
                                    </p>
                                ) : (
                                    <p className="text-gray-500 text-sm italic">
                                        Admin accounts are invitation only.
                                    </p>
                                )}
                            </div>
                        </form>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
