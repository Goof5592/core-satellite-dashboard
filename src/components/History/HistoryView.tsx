import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/simulation';
import { SECTORS } from '../../constants/sectors';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function HistoryView() {
  const { state, dispatch } = useApp();
  const sorted = [...state.records].sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => setExpanded(k => k === key ? null : key);

  if (sorted.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>まだ実績データがありません</p>
        <p className="text-sm mt-2">「実績入力」タブから記録してください</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6">
      <h1 className="text-xl font-bold text-white mb-6">月次履歴</h1>
      <div className="space-y-3">
        {sorted.map(r => {
          const key = `${r.year}-${r.month}`;
          const planTotal = r.plan.cash + r.plan.vpoint;
          const actualTotal = r.actual.cash + r.actual.vpoint;
          const diff = actualTotal - planTotal;
          const isOpen = expanded === key;

          return (
            <div key={key} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <button
                onClick={() => toggle(key)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold">{r.year}年{r.month}月</span>
                  <span className="text-gray-400 text-sm">{formatCurrency(actualTotal)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${diff >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm hidden sm:block">評価額: {formatCurrency(r.actual.portfolioValue)}</span>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-800">
                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <CompareCell label="現金" plan={r.plan.cash} actual={r.actual.cash} />
                    <CompareCell label="Vポイント" plan={r.plan.vpoint} actual={r.actual.vpoint} />
                    <CompareCell label="合計" plan={planTotal} actual={actualTotal} bold />
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-500 text-xs mb-2">セクター別</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SECTORS.map(s => (
                        <div key={s.key} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="text-gray-400 text-xs">{s.name}</span>
                          <span className="text-white text-xs ml-auto">{formatCurrency(r.actual.sectors[s.key])}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {r.notes && (
                    <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-xs">{r.notes}</p>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        if (window.confirm(`${r.year}年${r.month}月のデータを削除しますか？`)) {
                          dispatch({ type: 'DELETE_RECORD', payload: { year: r.year, month: r.month } });
                        }
                      }}
                      className="flex items-center gap-1 text-red-400 text-sm hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={14} />
                      削除
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompareCell({ label, plan, actual, bold }: { label: string; plan: number; actual: number; bold?: boolean }) {
  const diff = actual - plan;
  return (
    <div>
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`text-gray-400 text-xs`}>計画: {formatCurrency(plan)}</p>
      <p className={`${bold ? 'font-bold' : ''} text-white text-sm`}>実績: {formatCurrency(actual)}</p>
      <p className={`text-xs ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
      </p>
    </div>
  );
}
