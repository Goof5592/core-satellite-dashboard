import React from 'react';
import { LayoutDashboard, PlusCircle, History, TrendingUp, Settings, BarChart3, BookOpen } from 'lucide-react';

export type TabId = 'dashboard' | 'input' | 'history' | 'simulation' | 'report' | 'settings' | 'help';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'ホーム', icon: <LayoutDashboard size={20} /> },
  { id: 'input', label: '実績入力', icon: <PlusCircle size={20} /> },
  { id: 'history', label: '履歴', icon: <History size={20} /> },
  { id: 'simulation', label: 'シミュレーション', icon: <TrendingUp size={20} /> },
  { id: 'report', label: 'レポート', icon: <BarChart3 size={20} /> },
  { id: 'settings', label: '設定', icon: <Settings size={20} /> },
  { id: 'help', label: '使い方', icon: <BookOpen size={20} /> },
];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function Navigation({ active, onChange }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-gray-900 border-r border-gray-800 min-h-screen">
        <div className="p-5 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white leading-tight">コアサテライト<br />ダッシュボード</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${active === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
        <div className="flex justify-around">
          {ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 text-xs transition-colors
                ${active === item.id ? 'text-blue-400' : 'text-gray-500'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
