import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Activity, Users, MapPin, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';

const Landing = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] overflow-hidden relative selection:bg-indigo-500/30">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] opacity-50 animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] opacity-50 animate-pulse-slow delay-1000" />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 px-6 py-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="text-white font-bold text-xl">U</span>
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                        UrbanMind
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
                    <a href="#impact" className="hover:text-white transition-colors">Impact</a>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login">
                        <Button variant="ghost" className="text-gray-300 hover:text-white">Login</Button>
                    </Link>
                    <Link to="/register">
                        <Button className="bg-white text-black hover:bg-gray-100 border-none">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-32 px-6 md:px-12 max-w-7xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-gray-300 font-medium">AI-Powered Civic Intelligence</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                        Building Better Cities,<br />
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
                            Together.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Report issues, track progress, and earn rewards. UrbanMind connects citizens, contractors, and city officials to create smarter, safer communities.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register">
                            <Button size="lg" className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none shadow-lg shadow-indigo-500/25 px-8 h-14 text-lg">
                                Start Reporting
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="secondary" className="bg-white/5 hover:bg-white/10 border-white/10 h-14 text-lg px-8">
                                View Dashboard
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats / Floating Cards */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <GlassCard className="p-6 hover:border-indigo-500/30 transition-colors group">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Activity className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Real-time Tracking</h3>
                            <p className="text-gray-400">Monitor issue status from report to resolution with live updates and GPS tracking.</p>
                        </GlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                    >
                        <GlassCard className="p-6 hover:border-purple-500/30 transition-colors group">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Verified Contractors</h3>
                            <p className="text-gray-400">Issues are assigned to rated professionals with transparent performance metrics.</p>
                        </GlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                    >
                        <GlassCard className="p-6 hover:border-pink-500/30 transition-colors group">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-pink-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Community Driven</h3>
                            <p className="text-gray-400">Empower citizens to take action and improve their local infrastructure directly.</p>
                        </GlassCard>
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Simple steps to make a big difference in your city.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-linear-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 -translate-y-1/2 z-0" />

                        {[
                            { step: "01", title: "Report", desc: "Snap a photo and tag location", icon: MapPin },
                            { step: "02", title: "Assign", desc: "AI assigns best contractor", icon: Users },
                            { step: "03", title: "Resolve", desc: "Contractor fixes the issue", icon: Activity },
                            { step: "04", title: "Verify", desc: "Community verifies the fix", icon: CheckCircle },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="relative z-10"
                            >
                                <GlassCard className="p-8 text-center h-full hover:-translate-y-2 transition-transform duration-300 bg-[#0f172a]/80 backdrop-blur-xl">
                                    <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/40 text-white font-bold text-xl">
                                        {item.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-gray-400 text-sm">{item.desc}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative z-10">
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <GlassCard className="p-12 md:p-16 text-center relative overflow-hidden border-indigo-500/30">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />

                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to transform your city?</h2>
                        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto relative z-10">
                            Join thousands of citizens and contractors making a real difference today.
                        </p>
                        <div className="relative z-10">
                            <Link to="/register">
                                <Button size="lg" className="bg-white text-indigo-900 hover:bg-gray-100 border-none px-10 h-14 text-lg font-bold shadow-xl">
                                    Get Started Now
                                </Button>
                            </Link>
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#0f172a] py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">U</span>
                        </div>
                        <span className="text-xl font-bold text-white">UrbanMind</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                        © 2024 UrbanMind. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
