import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, SectorAllocation } from '../../types';
import { SECTORS, RETURN_ASSUMPTIONS } from '../../constants/sectors';
import { formatCurrency } from '../../utils/simulation';

const STEPS = ['基本設定', '月間計画', '配分設定', 'シナリオ', '確認'];

export default function SetupWizard() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<UserProfile>({ ...state.profile });

  const update = (key: keyof UserProfile, value: any) => setForm(f => ({ ...f, [key]: value }));
  const updateAlloc = (key: keyof SectorAllocation, value: number) => {
    setForm(f => ({ ...f, allocation: { ...f.allocation, [key]: value } }));
  };

  const totalAlloc = Object.values(form.allocation).reduce((s, v) => s + v, 0);

  const handleComplete = () => {
    if (Math.abs(totalAlloc - 100) > 0.5) {
      alert('配分比率の合計が100%になるように調整してください');
      return;
    }
    dispatch({
      type: 'COMPLETE_SETUP',
      payload: { ...form, returnAssumptions: RETURN_ASSUMPTIONS[form.scenario] },
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">コアサテライト戦略</h1>
          <p className="text-gray-400">初期設定ウィザード</p>
        </div>

        {/* ステップインジケーター */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${i <= step ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                {i + 1}
              </div>
              <span className={`ml-2 text-xs hidden sm:block ${i <= step ? 'text-blue-400' : 'text-gray-500'}`}>{s}</span>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 ${i < step ? 'bg-blue-600' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          {step === 0 && (
            <Step1 form={form} update={update} />
          )}
          {step === 1 && (
            <Step2 form={form} update={update} />
          )}
          {step === 2 && (
            <Step3 form={form} updateAlloc={updateAlloc} totalAlloc={totalAlloc} />
          )}
          {step === 3 && (
            <Step4 form={form} update={update} />
          )}
          {step === 4 && (
            <Step5 form={form} totalAlloc={totalAlloc} />
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="px-6 py-2 rounded-lg bg-gray-700 text-gray-300 disabled:opacity-30 hover:bg-gray-600 transition-colors"
            >
              戻る
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                次へ
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-bold"
              >
                設定完了
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
      <label className="text-gray-400 text-sm w-48 shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function textInput(value: any, onChange: (v: any) => void, type = 'text') {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
    />
  );
}

function Step1({ form, update }: { form: UserProfile; update: (k: keyof UserProfile, v: any) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">基本設定</h2>
      <InputRow label="投資開始日">{textInput(form.startDate, v => update('startDate', v), 'date')}</InputRow>
      <InputRow label="目標運用期間">
        <select
          value={form.targetYears}
          onChange={e => update('targetYears', Number(e.target.value))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          <option value={10}>10年</option>
          <option value={15}>15年</option>
          <option value={20}>20年</option>
        </select>
      </InputRow>
      <InputRow label="初期投資額（メットライフ）">{textInput(form.initialInvestment, v => update('initialInvestment', v), 'number')}</InputRow>
      <InputRow label="初期投資日">{textInput(form.initialInvestmentDate, v => update('initialInvestmentDate', v), 'date')}</InputRow>
      <InputRow label="アメックス分割総額">{textInput(form.amexSplit, v => update('amexSplit', v), 'number')}</InputRow>
      <InputRow label="分割月数">{textInput(form.amexMonths, v => update('amexMonths', v), 'number')}</InputRow>
    </div>
  );
}

function Step2({ form, update }: { form: UserProfile; update: (k: keyof UserProfile, v: any) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">月間計画</h2>
      <InputRow label="デフォルト現金投資額（円）">{textInput(form.defaultCash, v => update('defaultCash', v), 'number')}</InputRow>
      <InputRow label="デフォルトVポイント（pt）">{textInput(form.defaultVpoint, v => update('defaultVpoint', v), 'number')}</InputRow>
      <div className="mt-4 p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-sm">月間合計（デフォルト）</p>
        <p className="text-2xl font-bold text-white">{formatCurrency(form.defaultCash + form.defaultVpoint)}</p>
        <p className="text-gray-500 text-xs mt-1">※ アメックス分は最初の{form.amexMonths}ヶ月間は追加で{formatCurrency(form.amexSplit / form.amexMonths)}/月加算</p>
      </div>
    </div>
  );
}

function Step3({ form, updateAlloc, totalAlloc }: {
  form: UserProfile;
  updateAlloc: (k: keyof SectorAllocation, v: number) => void;
  totalAlloc: number;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">セクター別配分比率</h2>
      <p className="text-gray-400 text-sm mb-4">合計が100%になるよう設定してください</p>
      {SECTORS.map(s => (
        <div key={s.key} className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
          <span className="text-gray-300 text-sm w-36 shrink-0">{s.name}</span>
          <input
            type="number"
            min={0}
            max={100}
            value={form.allocation[s.key]}
            onChange={e => updateAlloc(s.key, Number(e.target.value))}
            className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-center focus:outline-none focus:border-blue-500"
          />
          <span className="text-gray-400">%</span>
        </div>
      ))}
      <div className={`mt-4 p-3 rounded-lg ${Math.abs(totalAlloc - 100) < 0.5 ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
        <p className={`font-bold ${Math.abs(totalAlloc - 100) < 0.5 ? 'text-green-400' : 'text-red-400'}`}>
          合計: {totalAlloc}% {Math.abs(totalAlloc - 100) < 0.5 ? '✓' : `（${totalAlloc > 100 ? '+' : ''}${(totalAlloc - 100).toFixed(1)}%）`}
        </p>
      </div>
    </div>
  );
}

function Step4({ form, update }: { form: UserProfile; update: (k: keyof UserProfile, v: any) => void }) {
  const scenarios = [
    { key: 'conservative', label: '保守的', desc: '控えめな成長を想定', color: 'blue' },
    { key: 'moderate', label: '中位', desc: '平均的な成長を想定（推奨）', color: 'green' },
    { key: 'aggressive', label: '強気', desc: '高成長シナリオ', color: 'orange' },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">リターン仮定シナリオ</h2>
      <div className="space-y-3">
        {scenarios.map(s => (
          <button
            key={s.key}
            onClick={() => update('scenario', s.key)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${form.scenario === s.key
              ? 'border-blue-500 bg-blue-900/30'
              : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 ${form.scenario === s.key ? 'border-blue-500 bg-blue-500' : 'border-gray-500'}`} />
              <div>
                <p className="font-bold text-white">{s.label}</p>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              {SECTORS.map(sec => {
                const r = RETURN_ASSUMPTIONS[s.key][sec.key];
                return (
                  <div key={sec.key} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sec.color }} />
                    <span className="text-gray-400">{sec.name}:</span>
                    <span className="text-gray-200">{(r * 100).toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step5({ form, totalAlloc }: { form: UserProfile; totalAlloc: number }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">設定内容の確認</h2>
      <div className="space-y-3 text-sm">
        <Row label="投資開始日" value={form.startDate} />
        <Row label="目標期間" value={`${form.targetYears}年`} />
        <Row label="初期投資（メットライフ）" value={formatCurrency(form.initialInvestment)} />
        <Row label="アメックス分割" value={`${formatCurrency(form.amexSplit)} ÷ ${form.amexMonths}ヶ月`} />
        <Row label="月間デフォルト" value={`現金${formatCurrency(form.defaultCash)} + Vポイント${formatCurrency(form.defaultVpoint)}`} />
        <Row label="シナリオ" value={{ conservative: '保守的', moderate: '中位', aggressive: '強気' }[form.scenario]!} />
        <Row label="配分合計" value={`${totalAlloc}%`} />
      </div>
      <div className="mt-4">
        <p className="text-gray-400 text-sm mb-2">セクター配分</p>
        {SECTORS.map(s => (
          <div key={s.key} className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-gray-300 text-sm flex-1">{s.name}</span>
            <span className="text-white font-bold">{form.allocation[s.key]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}
