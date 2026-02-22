
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    onClick: () => void;
    color: string;
    delay?: number;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    description,
    icon: Icon,
    onClick,
    color,
    delay = 0
}) => {
    return (
        <div
            onClick={onClick}
            className={`relative group overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100`}
            style={{ animationDelay: `${delay}s` }}
        >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full transition-transform group-hover:scale-110`} />

            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4 shadow-md group-hover:shadow-lg transition-all`}>
                    <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all">
                    {title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
    );
};
