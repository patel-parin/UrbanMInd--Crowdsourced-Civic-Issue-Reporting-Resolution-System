import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, ChevronUp, Crown, Zap } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import Loader from '../../components/common/Loader';
import { gamificationService } from '../../api/services/gamificationService';
import { useAuth } from '../../context/AuthContext';

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [myStats, setMyStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' or 'city'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [board, stats] = await Promise.all([
                    gamificationService.getLeaderboard(filter === 'city' ? user?.city : ''),
                    gamificationService.getMyStats()
                ]);
                setLeaderboard(board);
                setMyStats(stats);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filter, user?.city]);

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="text-gray-400 font-bold text-lg w-6 text-center">{rank}</span>;
    };

    const getRankBg = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20';
        if (rank === 2) return 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 border-gray-400/20';
        if (rank === 3) return 'bg-gradient-to-r from-amber-700/10 to-orange-700/10 border-amber-600/20';
        return 'bg-white/5 border-white/5';
    };

    const getLevelTitle = (level) => {
        if (level >= 10) return 'Civic Champion';
        if (level >= 7) return 'City Hero';
        if (level >= 5) return 'Active Leader';
        if (level >= 3) return 'Rising Star';
        return 'Civic Starter';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader size="lg" color="indigo" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 mb-2">
                        Leaderboard
                    </h1>
                    <p className="text-gray-400">Top civic contributors in the community</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === 'all' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        All Cities
                    </button>
                    <button
                        onClick={() => setFilter('city')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === 'city' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {user?.city || 'My City'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* My Stats Card */}
                {myStats && (
                    <div className="lg:col-span-1 space-y-6">
                        <GlassCard className="p-6 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-indigo-400" />
                                Your Stats
                            </h3>

                            <div className="text-center mb-6">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 mb-3">
                                    <div className="w-full h-full bg-[#0f172a] rounded-full flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white">{myStats.level}</span>
                                    </div>
                                </div>
                                <p className="text-indigo-400 font-bold text-sm">{getLevelTitle(myStats.level)}</p>
                                <p className="text-gray-500 text-xs mt-1">Level {myStats.level}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Impact Points</span>
                                    <span className="text-white font-bold text-lg">{myStats.points}</span>
                                </div>

                                <div className="w-full bg-white/5 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                        style={{ width: `${Math.min((myStats.points % 100), 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    {myStats.nextLevelPoints - myStats.points} points to Level {myStats.level + 1}
                                </p>

                                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                                    <span className="text-gray-400 text-sm">Global Rank</span>
                                    <span className="text-amber-400 font-bold text-xl flex items-center gap-1">
                                        <ChevronUp className="w-4 h-4" />
                                        #{myStats.rank}
                                    </span>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Points Guide */}
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400" />
                                How to Earn Points
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Report an issue</span>
                                    <span className="text-green-400 font-bold">+10 pts</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Upvote an issue</span>
                                    <span className="text-green-400 font-bold">+2 pts</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Submit feedback</span>
                                    <span className="text-green-400 font-bold">+5 pts</span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className={`${myStats ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <GlassCard className="p-0 overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                Top Contributors
                            </h3>
                            <span className="text-xs text-gray-500 font-medium">{leaderboard.length} citizens</span>
                        </div>

                        {leaderboard.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>No contributors found yet.</p>
                                <p className="text-sm mt-1">Start reporting issues to climb the leaderboard!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {leaderboard.map((entry, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={`flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors ${getRankBg(entry.rank)} border-l-2 ${
                                            entry.name === user?.name ? 'bg-indigo-500/5 border-indigo-500/50' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 flex justify-center">
                                                {getRankIcon(entry.rank)}
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-white font-bold border border-white/10">
                                                {entry.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className={`font-medium ${entry.name === user?.name ? 'text-indigo-300' : 'text-white'}`}>
                                                    {entry.name} {entry.name === user?.name && <span className="text-xs text-indigo-400 ml-1">(You)</span>}
                                                </p>
                                                <p className="text-xs text-gray-500">{entry.city || 'Unknown'} • Lv. {entry.level}</p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-white font-bold flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3 text-green-400" />
                                                {entry.points}
                                            </p>
                                            <p className="text-xs text-gray-500">points</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
