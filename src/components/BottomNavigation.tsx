import React from 'react';
import { Building2, Filter, BarChart3, Phone, Info } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'building', label: 'Зграда', icon: Building2 },
    { id: 'filters', label: 'Филтри', icon: Filter },
    { id: 'analytics', label: 'Статистики', icon: BarChart3 },
    { id: 'contact', label: 'Контакт', icon: Phone },
    { id: 'info', label: 'Инфо', icon: Info }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/10 backdrop-blur-xl border-t border-white/20 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-cyan-500/30 text-cyan-300 scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;