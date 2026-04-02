import React from 'react';

const GlassCard = ({ children, className = '', hover = false, ...props }) => {
    return (
        <div
            className={`
        glass-panel rounded-2xl p-6 relative overflow-hidden
        ${hover ? 'hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.2)] hover:border-indigo-500/30 transition-all duration-300 cursor-pointer' : ''}
        ${className}
      `}
            {...props}
        >
            {/* Ambient Glow Effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default GlassCard;
