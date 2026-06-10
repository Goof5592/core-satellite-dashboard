import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MonthlyRecord, SectorAllocation } from '../../types';
import { SECTORS } from '../../constants/sectors';
import { formatCurrency } from '../../utils/simulation';

export default function MonthlyInput() {
  const { state, dispatch } = useApp();
  const { profile, records } = state;

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const existing = records.find(r => r.year === selectedYear && r.month === selectedMonth);

  const monthsSinceStart = (selectedYear - new Date(profile.startDate).getFullYear()) * 12 +
    (selectedMonth - (new Date(profile.startDate).getMonth() + 1));
  const amexMonthly = monthsSinceStart >= 0 && monthsSinceStart < profile.amexMonths
    ? Math.round(profile.amexSplit / profile.amexMonths)
    : 0;
  const planTotal = profile.defaultCash + profile.defaultVpoint + amexMonthly;
  const planSectors = Object.fromEntries(
    SECTORS.map(s => [s.key, Math.round(planTotal * profile.allocation[s.key] / 100)])
  ) as unknown as SectorAllocation;

  const defaultActual: MonthlyRecord['actual'] = existing?.actual ?? {
    cash: profile.defaultCash + (amexMonthly ? Math.round(amexMonthly * 0.5) : 0),
    vpoint: profile.defaultVpoint,
    sectors: { ...planSectors },
    portfolioValue: records.length > 0 ? records[records.length - 1].actual.portfolioValue : profile.initialInvestment,
  };

  const [cash, setCash] = useState(defaultActual.cash);
  const [vpoint, setVpoint] = useState(defaultActual.vpoint);
  const [sectors, setSectors] = useState<SectorAllocation>({ ...defaultActual.sectors });
  const [portfolioValue, setPortfolioValue] = useState(defaultActual.portfolioValue);
  const [notes, setNotes] = useState(existing?.notes ?? '');

  useEffect(() => {
    const rec = records.find(r => r.year === selectedYear && r.month === selectedMonth);
    if (rec) {
      setCash(rec.actual.cash);
      setVpoint(rec.actual.vpoint);
      setSectors({ ...rec.actual.sectors });
      setPortfolioValue(rec.actual.portfolioValue);
      setNotes(rec.notes);
    } else {
      setCash(profile.defaultCash);
      setVpoint(profile.defaultVpoint);
      setSectors({ ...planSectors });
      setPortfolioValue(records.length > 0 ? records[records.length - 1].actual.portfolioValue : 0);
      setNotes('');
    }
  // recordsを依存に含めることで、時価同期後にフォームが自動更新される
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth, records]);

  const actualTotal = cash + vpoint;
  const planTotalVal = profile.defaultCash + profile.defaultVpoint + amexMonthly;
  const sectorTotal = Object.values(sectors).reduce((s, v) => s + v, 0);

  const handleSave = () => {
    const record: MonthlyRecord = {
      year: selectedYear,
      month: selectedMonth,
      plan: { cash: profile.defaultCash + amexMonthly, vpoint: profile.defaultVpoint, sectors: planSectors },
      actual: { cash, vpoint, sectors, portfolioValue },
      notes,
    };
    dispatch({ type: 'UPSERT_RECORD', payload: record });
    alert('保存しました');
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">月次実績入力</h1>

      {/* 月選択 */}
      <div className="flex gap-3 mb-6">
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
        >
          {years.map(y => <option key={y} value={y}>{y}年</option>)}
        </select>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
        >
          {months.map(m => <option key={m} value={m}>{m}月</option>)}
        </select>
        {existing && <span className="px-3 py-2 bg-blue-900/50 text-blue-400 text-sm rounded-lg">記録済み</span>}
      </div>

      {/* 計画値参照 */}
      <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
        <p className="text-gray-400 text-xs mb-2">この月の計画値</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs">現金{amexMonthly > 0 ? '（アメックス込）' : ''}</p>
            <p className="text-gray-300">{formatCurrency(profile.defaultCash + amexMonthly)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Vポイント</p>
            <p className="text-gray-300">{formatCurrency(profile.defaultVpoint)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">合計</p>
            <p className="text-gray-300 font-bold">{formatCurrency(planTotalVal)}</p>
          </div>
        </div>
      </div>

      {/* 実績入力 */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-4">
        <h2 className="text-white font-bold mb-4">実績入力</h2>
        <div className="space-y-4">
          <NumberField label="現金投資額（円）" value={cash} onChange={setCash}
            diff={cash - (profile.defaultCash + amexMonthly)} />
          <NumberField label="Vポイント（pt）" value={vpoint} onChange={setVpoint}
            diff={vpoint - profile.defaultVpoint} />
        </div>
        <div className="mt-4 p-3 bg-gray-800 rounded-lg flex justify-between items-center">
          <span className="text-gray-400 text-sm">実績合計</span>
          <div className="text-right">
            <span className="text-white font-bold">{formatCurrency(actualTotal)}</span>
            <span className={`ml-2 text-xs ${actualTotal >= planTotalVal ? 'text-green-400' : 'text-red-400'}`}>
              ({actualTotal >= planTotalVal ? '+' : ''}{formatCurrency(actualTotal - planTotalVal)})
            </span>
          </div>
        </div>
      </div>

      {/* ポートフォリオ評価額 */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-4">
        <h2 className="text-white font-bold mb-4">ポートフォリオ時価評価額</h2>
        <NumberField label="評価額合計（円）" value={portfolioValue} onChange={setPortfolioValue} />
      </div>

      {/* セクター別配分 */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-4">
        <h2 className="text-white font-bold mb-4">セクター別投資額</h2>
        <div className="space-y-3">
          {SECTORS.map(s => (
            <div key={s.key} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-gray-300 text-sm w-28 shrink-0">{s.name}</span>
              <input
                type="number"
                value={sectors[s.key]}
                onChange={e => setSectors(prev => ({ ...prev, [s.key]: Number(e.target.value) }))}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-right focus:outline-none focus:border-blue-500"
              />
              <span className="text-gray-500 text-xs w-16 text-right">
                計: {formatCurrency(planSectors[s.key])}
              </span>
            </div>
          ))}
        </div>
        <div className={`mt-3 p-2 rounded-lg text-sm flex justify-between ${Math.abs(sectorTotal - actualTotal) < 100 ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
          <span>セクター合計</span>
          <span>{formatCurrency(sectorTotal)}</span>
        </div>
      </div>

      {/* メモ */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-6">
        <h2 className="text-white font-bold mb-3">メモ</h2>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="今月の投資状況についてメモ..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-lg"
      >
        保存する
      </button>
    </div>
  );
}

function NumberField({ label, value, onChange, diff }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  diff?: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-gray-400 text-sm">{label}</label>
        {diff !== undefined && (
          <span className={`text-xs ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            計画比 {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
          </span>
        )}
      </div>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-right focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}
