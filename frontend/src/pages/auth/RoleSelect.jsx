import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Shield, HardHat } from 'lucide-react';
import Card from '../../components/common/Card';

const RoleSelect = () => {
    const navigate = useNavigate();

    const roles = [
        {
            id: 'citizen',
            title: 'Citizen',
            description: 'Report issues and track their status in your neighborhood.',
            icon: User,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'hover:border-blue-500',
        },
        {
            id: 'contractor',
            title: 'Contractor',
            description: 'View assigned tasks, update status, and upload proof.',
            icon: HardHat,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            border: 'hover:border-orange-500',
        },
        {
            id: 'admin',
            title: 'Admin',
            description: 'Manage issues, assign contractors, and view analytics.',
            icon: Shield,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            border: 'hover:border-purple-500',
        },
    ];

    const handleRoleSelect = (roleId) => {
        // For now, we just navigate to login. 
        // In a real app, we might pass the selected role to the login page or store it.
        // Here we'll pass it as state to the login page.
        navigate('/login', { state: { role: roleId } });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900" />
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 text-center mb-16"
            >
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Urban Mind</span>
                </h1>
                <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed">
                    Connecting citizens, contractors, and administrators for a better urban environment.
                    Select your role to continue.
                </p>
            </motion.div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full px-4">
                {roles.map((role, index) => (
                    <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full"
                    >
                        <div
                            onClick={() => handleRoleSelect(role.id)}
                            className={`
                                group relative h-full flex flex-col items-center text-center p-8 
                                bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl
                                hover:bg-slate-800/60 transition-all duration-300 cursor-pointer
                                hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2
                            `}
                        >
                            <div className={`
                                p-6 rounded-2xl mb-6 transition-transform duration-300 group-hover:scale-110
                                ${role.bg}
                            `}>
                                <role.icon className={`w-12 h-12 ${role.color}`} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{role.title}</h3>
                            <p className="text-slate-400 text-lg leading-relaxed">{role.description}</p>

                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default RoleSelect;
