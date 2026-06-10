import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, SectorAllocation } from '../../types';
import { SECTORS, RETURN_ASSUMPTIONS } from '../../constants/sectors';
import { formatCurrency } from '../../utils/simulation';
import { exportJSON, importJSON } from '../../utils/storage';
import { Upload, Download, AlertTriangle } from 'lucide-react';

export default function SettingsView() {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState<UserProfile>({ ...state.profile });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof UserProfile, value: any) => setForm(f => ({ ...f, [key]: value }));
  const updateAlloc = (key: keyof SectorAllocation, value: number) => {
    setForm(f => ({ ...f, allocation: { ...f.allocation, [key]: value } }));
  };
  const totalAlloc = Object.values(form.allocation).reduce((s, v) => s + v, 0);

  const handleSave = () => {
    if (Math.abs(totalAlloc - 100) > 0.5) {
      alert('配分比率の合計が100%になるように調整してください');
      return;
    }
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: { ...form, returnAssumptions: RETURN_ASSUMPTIONS[form.scenario] },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importJSON(file);
      if (window.confirm('現在のデータを上書きします。よろしいですか？')) {
        dispatch({ type: 'IMPORT_STATE', payload: data });
        setForm({ ...data.profile });
        alert('インポートしました');
      }
    } catch {
      alert('インポートに失敗しました');
    }
    e.target.value = '';
  };

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">設定</h1>

      {/* 基本設定 */}
      <Section title="基本設定">
        <Field label="投資開始日">
          <input type="date" value={form.startDate}
            onChange={e => update('startDate', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
        </Field>
        <Field label="目標運用期間">
          <select value={form.targetYears} onChange={e => update('targetYears', Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
            <option value={10}>10年</option>
            <option value={15}>15年</option>
            <option value={20}>20年</option>
          </select>
        </Field>
        <Field label="初期投資額（円）">
          <input type="number" value={form.initialInvestment}
            onChange={e => update('initialInvestment', Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
        </Field>
        <Field label="アメックス総額（円）">
          <input type="number" value={form.amexSplit}
            onChange={e => update('amexSplit', Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
        </Field>
        <Field label="アメックス分割月数">
          <input type="number" value={form.amexMonths}
            onChange={e => update('amexMonths', Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
        </Field>
      </Section>

      {/* 月間計画 */}
      <Section title="デフォルト月間計画">
        <Field label="月間現金投資額（円）">
          <input type="number" value={form.defaultCash}
            onChange={e => update('defaultCash', Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
        </Field>
        <Field label="月間Vポイント（pt）">
          <input type="number" value={form.defaultVpoint}
            onChange={e => update('defaultVpoint', Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
        </Field>
        <div className="p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
          月間合計: <span className="text-white font-bold">{formatCurrency(form.defaultCash + form.defaultVpoint)}</span>
        </div>
      </Section>

      {/* 配分比率 */}
      <Section title="セクター別配分比率">
        {SECTORS.map(s => (
          <div key={s.key} className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-gray-300 text-sm w-32 shrink-0">{s.name}</span>
            <input
              type="number" min={0} max={100} value={form.allocation[s.key]}
              onChange={e => updateAlloc(s.key, Number(e.target.value))}
              className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-center focus:outline-none focus:border-blue-500"
            />
            <span className="text-gray-400">%</span>
          </div>
        ))}
        <div className={`p-2 rounded-lg text-sm ${Math.abs(totalAlloc - 100) < 0.5 ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
          合計: {totalAlloc}%
        </div>
      </Section>

      {/* シナリオ */}
      <Section title="リターン仮定シナリオ">
        <div className="flex gap-3">
          {(['conservative', 'moderate', 'aggressive'] as const).map(s => (
            <button key={s}
              onClick={() => update('scenario', s)}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${form.scenario === s ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              {{ conservative: '保守的', moderate: '中位', aggressive: '強気' }[s]}
            </button>
          ))}
        </div>
      </Section>

      {/* 保存 */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl font-bold transition-colors text-lg mb-6 ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        {saved ? '保存しました ✓' : '設定を保存'}
      </button>

      {/* 初期購入データ登録 */}
      <Section title="初期購入データ登録">
        <p className="text-gray-400 text-sm mb-3">
          iFナス (2840) 37株 × 2,647円 = 97,939円（2026年5月）と SBI NASDAQ-100 12,000円（2026年6月）を登録します。
        </p>
        <button
          onClick={() => {
            const planTotal = state.profile.defaultCash + state.profile.defaultVpoint;
            const may: any = {
              year: 2026, month: 5,
              plan: { cash: state.profile.defaultCash, vpoint: state.profile.defaultVpoint, sectors: { core: Math.round(planTotal*0.70), semiconductor: Math.round(planTotal*0.06), cleanEnergy: Math.round(planTotal*0.06), healthcare: Math.round(planTotal*0.06), defense: Math.round(planTotal*0.06), autonomous: Math.round(planTotal*0.06) } },
              actual: { cash: 97939, vpoint: 0, sectors: { core: 97939, semiconductor: 0, cleanEnergy: 0, healthcare: 0, defense: 0, autonomous: 0 }, portfolioValue: 97939 },
              notes: 'iFナス100H無（2840）37株 × 2,647円 = 97,939円。NISAスタート月。',
            };
            const jun: any = {
              year: 2026, month: 6,
              plan: { cash: state.profile.defaultCash, vpoint: state.profile.defaultVpoint, sectors: { core: Math.round(planTotal*0.70), semiconductor: Math.round(planTotal*0.06), cleanEnergy: Math.round(planTotal*0.06), healthcare: Math.round(planTotal*0.06), defense: Math.round(planTotal*0.06), autonomous: Math.round(planTotal*0.06) } },
              actual: { cash: 12000, vpoint: 0, sectors: { core: 12000, semiconductor: 0, cleanEnergy: 0, healthcare: 0, defense: 0, autonomous: 0 }, portfolioValue: 97939 + 12000 },
              notes: 'SBI NASDAQ100インデックス・ファンド 11,496口（12,000円）購入。本日スタート。',
            };
            dispatch({ type: 'UPSERT_RECORD', payload: may });
            dispatch({ type: 'UPSERT_RECORD', payload: jun });
            alert('2026年5月・6月のデータを登録しました');
          }}
          className="w-full py-2.5 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
        >
          iFナス＋SBI NASDAQ の初期データを登録
        </button>
      </Section>

      {/* データ管理 */}
      <Section title="データ管理">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => exportJSON(state)}
            className="flex items-center justify-center gap-2 py-2.5 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
          >
            <Download size={16} />
            JSONバックアップ
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2.5 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
          >
            <Upload size={16} />
            JSONインポート
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg flex gap-2">
          <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-yellow-400 text-xs">データはブラウザのLocalStorageに保存されています。定期的にJSONバックアップを取ることを推奨します。</p>
        </div>
      </Section>

      {/* リセット */}
      <div className="mt-4">
        <button
          onClick={() => {
            if (window.confirm('すべてのデータを削除して初期設定に戻します。本当によろしいですか？')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="w-full py-2.5 border border-red-700/50 text-red-400 rounded-lg text-sm hover:bg-red-900/20 transition-colors"
        >
          データをリセット（初回設定に戻る）
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-4">
      <h2 className="text-white font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
      <label className="text-gray-400 text-sm w-44 shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

