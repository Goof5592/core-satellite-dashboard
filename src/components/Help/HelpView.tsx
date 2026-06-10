import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Section {
  id: string;
  emoji: string;
  title: string;
  content: React.ReactNode;
}

export default function HelpView() {
  const [openSection, setOpenSection] = useState<string>('overview');

  const toggle = (id: string) => setOpenSection(s => s === id ? '' : id);

  const sections: Section[] = [
    {
      id: 'overview',
      emoji: '🗺️',
      title: 'このアプリの全体像',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            コアサテライト戦略ダッシュボードは、NASDAQ-100をコアとした長期投資を管理するアプリです。
            「計画を立てる」→「毎月記録する」→「進捗を確認する」の3ステップで運用できます。
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <FlowCard emoji="📋" label="計画" desc="シミュレーションで将来を試算" color="blue" />
            <div className="flex items-center justify-center text-gray-600 text-2xl">→</div>
            <FlowCard emoji="✏️" label="記録" desc="毎月の実績を入力" color="green" />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <FlowCard emoji="📊" label="確認" desc="計画vs実績をグラフで比較" color="purple" />
            <div className="flex items-center justify-center text-gray-600 text-2xl">←</div>
            <FlowCard emoji="🔄" label="更新" desc="時価を同期して含み損益を把握" color="orange" />
          </div>
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/40 rounded-xl">
            <p className="text-blue-300 text-sm font-bold mb-2">💡 コアサテライト戦略とは？</p>
            <p className="text-gray-300 text-xs leading-relaxed">
              資産の大部分（コア：70%）を安定したNASDAQ-100インデックスに投資し、
              残り（サテライト：各6%）をAI・半導体・クリーンエネルギーなど成長分野に分散投資する戦略です。
              リスクを抑えながら、高いリターンを狙います。
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'home',
      emoji: '🏠',
      title: 'ホーム画面の見方',
      content: (
        <div className="space-y-4">
          <ScreenMockup title="ホーム画面">
            <MockCard color="blue" label="ポートフォリオ評価額" value="113,306円" sub="含み益 +3,367円" />
            <MockCard color="gray" label="累積投資額" value="109,939円" sub="実投資額合計" />
            <MockCard color="gray" label="今年の投資額(YTD)" value="109,939円" sub="2ヶ月分" />
            <MockCard color="green" label="含み損益" value="+3,367円" sub="3.1%" />
          </ScreenMockup>

          <div className="space-y-3">
            <HelpItem emoji="💰" title="ポートフォリオ評価額" desc="現在の時価評価額。「時価を同期」ボタンで最新価格に更新されます。" />
            <HelpItem emoji="📥" title="累積投資額" desc="実際に投資した合計額（月次実績に入力した金額の総計）。" />
            <HelpItem emoji="📅" title="今年の投資額(YTD)" desc="今年1月以降に投資した合計額。年初来の投資ペースを確認できます。" />
            <HelpItem emoji="📈" title="含み損益" desc="評価額 − 累積投資額 の差分。プラスなら利益、マイナスなら損失中。" />
          </div>

          <div className="p-3 bg-gray-800 rounded-xl">
            <p className="text-gray-400 text-xs font-bold mb-2">🔵 時価同期バー（画面上部）</p>
            <p className="text-gray-300 text-xs leading-relaxed">
              investment-dashboardをGitHubにpushすると<code className="bg-gray-700 px-1 rounded">data.json</code>が更新されます。
              その後「時価を同期」ボタンを押すと、iFナス(2840)の最新株価とNDX変動率から評価額を自動計算します。
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'input',
      emoji: '✏️',
      title: '月次実績の入力方法',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">毎月末〜翌月初に前月分を入力するのがおすすめです。</p>

          <div className="space-y-2">
            <StepCard step={1} title="月を選択" desc="画面上部の年・月セレクターで入力したい月を選びます。過去月も編集可能です。" />
            <StepCard step={2} title="実績を入力" desc="現金投資額とVポイントを入力。グレーで計画値が表示されているので参考にしながら入力します。" />
            <StepCard step={3} title="ポートフォリオ評価額を入力" desc="その月末時点の保有資産の時価合計を入力します。「時価を同期」後にホームで確認できる金額が使えます。" />
            <StepCard step={4} title="セクター別投資額を入力" desc="各ファンドにいくら投資したかを入力。未投資のセクターは0のままでOKです。" />
            <StepCard step={5} title="メモを記入して保存" desc="「今月はVポイントが多かった」など自由にメモ。最後に「保存する」ボタンをクリック。" />
          </div>

          <div className="p-3 bg-yellow-900/20 border border-yellow-700/40 rounded-xl">
            <p className="text-yellow-300 text-xs">
              ⚠️ <strong>入力のタイミング</strong>：毎月の実績はいつでも入力・編集できます。
              過去月のデータも「月を選択」で遡って修正可能です。
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'sync',
      emoji: '🔄',
      title: '時価の同期方法',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            investment-dashboardリポジトリとの連携で、リアルタイムの株価を取得できます。
          </p>

          <div className="space-y-2">
            <StepCard step={1} title="investment-dashboardをpush" desc="GitHubにpushすると、GitHub ActionsがYahoo Financeからデータを取得しdata.jsonを更新します。" />
            <StepCard step={2} title="「時価を同期」をクリック" desc="ホーム画面上部の青いボタンを押すと、最新のdata.jsonを読み込みます。" />
            <StepCard step={3} title="評価額が自動計算される" desc="iFナス(2840)：37株 × 現在株価、SBI NASDAQ：NDX変動率で推定。合計が自動でポートフォリオ評価額に反映されます。" />
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs font-bold mb-2">📐 計算式</p>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 bg-gray-900 rounded">
                <span className="text-blue-400">iFナス評価額</span> = 37株 × 現在株価(2840)
              </div>
              <div className="p-2 bg-gray-900 rounded">
                <span className="text-purple-400">SBI NASDAQ評価額</span> = 11,496口 × 購入時NAV × (現在NDX ÷ 購入時NDX)
              </div>
              <div className="p-2 bg-gray-900 rounded">
                <span className="text-green-400">合計評価額</span> = iFナス + SBI NASDAQ
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'simulation',
      emoji: '📊',
      title: 'シミュレーションの見方',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            現在の月次積立計画を継続した場合の将来資産を予測します。
            メットライフの返戻金が入ったときに「設定 → 初期投資額」を更新すると、予測が大きく跳ね上がります。
          </p>

          <div className="grid grid-cols-2 gap-3">
            <ScenarioCard name="保守的" color="gray" returns="NASDAQ: 12%, 半導体: 15%..." desc="市場が低調だった場合の試算" />
            <ScenarioCard name="中位（推奨）" color="blue" returns="NASDAQ: 16.5%, 半導体: 20%..." desc="過去平均に近い想定" />
            <ScenarioCard name="強気" color="green" returns="NASDAQ: 19%, 半導体: 24%..." desc="市場好調時の試算" />
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-gray-400 text-xs font-bold mb-1">💡 使い方のコツ</p>
              <p className="text-gray-400 text-xs">3つのシナリオを切り替えて、最良・最悪・中間のケースを確認しましょう。</p>
            </div>
          </div>

          <HelpItem emoji="📅" title="マイルストーンカード" desc="5年・10年・15年・20年後の予想資産、利益額、倍率が一目でわかります。" />
          <HelpItem emoji="📈" title="資産推移グラフ" desc="複利効果で後半に急加速するカーブが確認できます。累積投資（点線）との差が「運用益」です。" />
          <HelpItem emoji="🎯" title="セクター別積み上げ" desc="各セクターがどれだけ資産に貢献するかを棒グラフで確認できます。" />
        </div>
      ),
    },
    {
      id: 'history',
      emoji: '📅',
      title: '履歴の使い方',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            入力済みの全月次データを一覧表示します。タップで詳細を展開できます。
          </p>
          <HelpItem emoji="🟢" title="緑バッジ" desc="その月の実績が計画を上回ったことを示します（計画比プラス）。" />
          <HelpItem emoji="🔴" title="赤バッジ" desc="その月の実績が計画を下回ったことを示します（計画比マイナス）。" />
          <HelpItem emoji="🗑️" title="削除ボタン" desc="誤入力したデータは削除できます。削除後は再入力してください。" />
          <div className="p-3 bg-gray-800 rounded-xl">
            <p className="text-gray-400 text-xs">
              💡 月をタップすると現金・Vポイント・セクター別の詳細と、入力したメモが表示されます。
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'report',
      emoji: '📋',
      title: 'レポートの使い方',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            累積・年間の投資パフォーマンスを俯瞰するページです。
          </p>
          <HelpItem emoji="📆" title="年間サマリー" desc="今年のYTD計画・実績・達成率が確認できます。" />
          <HelpItem emoji="💹" title="累積サマリー" desc="実際に投資した合計額・評価額・含み損益・リターン率を表示します。" />
          <HelpItem emoji="📊" title="月次グラフ" desc="直近12ヶ月の計画vs実績を棒グラフで比較できます。" />
          <HelpItem emoji="🏷️" title="セクター別パフォーマンス" desc="各セクターの累積計画額と実績額を比較し、達成率をバーで表示します。" />

          <div className="p-4 bg-gray-800 rounded-xl space-y-3">
            <p className="text-white text-sm font-bold">💾 データのエクスポート</p>
            <div className="flex gap-3">
              <div className="flex-1 p-3 bg-gray-700 rounded-lg text-center">
                <p className="text-2xl mb-1">📄</p>
                <p className="text-white text-xs font-bold">CSV</p>
                <p className="text-gray-400 text-xs mt-1">Excelで開ける形式。月次データを表で分析したいときに。</p>
              </div>
              <div className="flex-1 p-3 bg-gray-700 rounded-lg text-center">
                <p className="text-2xl mb-1">💾</p>
                <p className="text-white text-xs font-bold">JSON</p>
                <p className="text-gray-400 text-xs mt-1">全データのバックアップ。別のブラウザやPCに移行するときにも使えます。</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'settings',
      emoji: '⚙️',
      title: '設定の変更方法',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            設定はいつでも変更できます。変更後は「設定を保存」を必ずクリックしてください。
          </p>
          <HelpItem emoji="💴" title="初期投資額" desc="メットライフの返戻金が入ったら、実際の金額を入力して保存。シミュレーションが自動で再計算されます。" />
          <HelpItem emoji="💳" title="アメックス分割" desc="アメックスポイントの現金化額・分割月数を変更できます。" />
          <HelpItem emoji="📆" title="月間デフォルト計画" desc="現金投資額・Vポイントの毎月の目標値。実績入力時の初期値として表示されます。" />
          <HelpItem emoji="🥧" title="セクター別配分比率" desc="各ファンドへの配分割合。合計が100%になるように設定してください。" />
          <HelpItem emoji="📊" title="シナリオ" desc="保守的・中位・強気のいずれかを選択。シミュレーションのリターン仮定に使われます。" />

          <div className="p-3 bg-green-900/20 border border-green-700/40 rounded-xl">
            <p className="text-green-300 text-xs">
              ✅ <strong>初期購入データ登録ボタン</strong>：iFナス(2840) 37株と SBI NASDAQ-100 の初期データを一発で登録できます。データが消えた場合に使用してください。
            </p>
          </div>

          <div className="p-3 bg-red-900/20 border border-red-700/40 rounded-xl">
            <p className="text-red-300 text-xs">
              ⚠️ <strong>データリセット</strong>：設定画面の一番下にあるリセットボタンはすべてのデータが消えます。
              実行前に必ずJSONバックアップを取ってください。
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'routine',
      emoji: '📅',
      title: '毎月の運用ルーティン',
      content: (
        <div className="space-y-3">
          <p className="text-gray-300 text-sm">このサイクルを毎月繰り返すことで、長期投資の進捗を正確に把握できます。</p>
          <div className="space-y-2">
            <RoutineCard week="月初" emoji="🔄" title="時価を同期" desc='investment-dashboardをpush → ホームの「時価を同期」をクリック' />
            <RoutineCard week="月中" emoji="✏️" title="実績を入力" desc="先月の現金・Vポイント・各ファンドへの投資額を入力して保存" />
            <RoutineCard week="月末" emoji="💾" title="バックアップ" desc="レポート画面からJSONバックアップをダウンロードして保存" />
            <RoutineCard week="随時" emoji="📊" title="シミュレーション確認" desc="市場環境に合わせてシナリオを切り替えて将来予測を確認" />
            <RoutineCard week="随時" emoji="⚙️" title="設定の更新" desc="メットライフ入金時・月間投資額変更時は設定を更新" />
          </div>
        </div>
      ),
    },
    {
      id: 'faq',
      emoji: '❓',
      title: 'よくある質問',
      content: (
        <div className="space-y-3">
          <FaqItem q="データはどこに保存されていますか？" a="ブラウザのLocalStorage（このブラウザ・このデバイス専用）に保存されています。ブラウザのデータを削除するとすべて消えるので、定期的にJSONバックアップを取ってください。" />
          <FaqItem q="別のデバイスでも使えますか？" a="JSONエクスポート → 別のデバイスでJSONインポートすることでデータを移行できます。設定画面の「データ管理」セクションから操作できます。" />
          <FaqItem q="SBI NASDAQの評価額はなぜ概算なのですか？" a="SBI NASDAQ100は投資信託のため取引所に株価がなく、購入時のNDX値を基準にNDX変動率で推定しています。実際のNAV（基準価額）とは若干異なる場合があります。" />
          <FaqItem q="メットライフの返戻金が入ったらどうすればいいですか？" a="設定タブの「初期投資額」に実際の金額を入力して保存してください。シミュレーションが自動で再計算されます。" />
          <FaqItem q="配分比率を変えたらどうなりますか？" a="次回の実績入力時にセクター別投資額の計画値が新しい比率で計算されます。過去のデータには影響しません。" />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">📖 使い方ガイド</h1>
        <p className="text-gray-400 text-sm mt-1">コアサテライト戦略ダッシュボードの取扱説明書</p>
      </div>

      <div className="space-y-3">
        {sections.map(s => (
          <div key={s.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <button
              onClick={() => toggle(s.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-white font-bold">{s.title}</span>
              </div>
              {openSection === s.id
                ? <ChevronUp size={18} className="text-gray-400 shrink-0" />
                : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
            </button>
            {openSection === s.id && (
              <div className="px-4 pb-5 border-t border-gray-800 pt-4">
                {s.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/40 rounded-xl text-center">
        <p className="text-blue-300 text-sm">💬 使い方がわからないことがあれば、Claude Codeに聞いてください。</p>
      </div>
    </div>
  );
}

// ── 小コンポーネント ──────────────────────────

function FlowCard({ emoji, label, desc, color }: { emoji: string; label: string; desc: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-900/30 border-blue-700/50',
    green: 'bg-green-900/30 border-green-700/50',
    purple: 'bg-purple-900/30 border-purple-700/50',
    orange: 'bg-orange-900/30 border-orange-700/50',
  };
  return (
    <div className={`p-3 rounded-xl border ${colors[color]}`}>
      <p className="text-2xl mb-1">{emoji}</p>
      <p className="text-white text-sm font-bold">{label}</p>
      <p className="text-gray-400 text-xs mt-1">{desc}</p>
    </div>
  );
}

function MockCard({ color, label, value, sub }: { color: string; label: string; value: string; sub: string }) {
  return (
    <div className={`bg-gray-800 rounded-lg p-3 border ${color === 'blue' ? 'border-blue-700/50' : color === 'green' ? 'border-green-700/50' : 'border-gray-700'}`}>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-white font-bold text-sm">{value}</p>
      <p className={`text-xs ${color === 'green' ? 'text-green-400' : color === 'blue' ? 'text-green-400' : 'text-gray-500'}`}>{sub}</p>
    </div>
  );
}

function ScreenMockup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-950 rounded-xl border border-gray-700 p-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <div className="w-2 h-2 rounded-full bg-yellow-500" />
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-gray-500 text-xs ml-2">{title}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{children}</div>
    </div>
  );
}

function HelpItem({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-xl shrink-0">{emoji}</span>
      <div>
        <p className="text-white text-sm font-bold">{title}</p>
        <p className="text-gray-400 text-xs leading-relaxed mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{step}</div>
      <div className="flex-1 pb-3 border-b border-gray-800">
        <p className="text-white text-sm font-bold">{title}</p>
        <p className="text-gray-400 text-xs leading-relaxed mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function ScenarioCard({ name, color, returns, desc }: { name: string; color: string; returns: string; desc: string }) {
  const colors: Record<string, string> = {
    gray: 'border-gray-600',
    blue: 'border-blue-600 bg-blue-900/20',
    green: 'border-green-600',
  };
  return (
    <div className={`p-3 rounded-xl border ${colors[color]}`}>
      <p className="text-white text-sm font-bold">{name}</p>
      <p className="text-gray-400 text-xs mt-1">{returns}</p>
      <p className="text-gray-500 text-xs mt-1">{desc}</p>
    </div>
  );
}

function RoutineCard({ week, emoji, title, desc }: { week: string; emoji: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3 items-start p-3 bg-gray-800 rounded-xl">
      <div className="w-12 text-center shrink-0">
        <p className="text-xs text-blue-400 font-bold">{week}</p>
        <p className="text-2xl mt-1">{emoji}</p>
      </div>
      <div>
        <p className="text-white text-sm font-bold">{title}</p>
        <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="p-3 bg-gray-800 rounded-xl">
      <p className="text-white text-sm font-bold">Q. {q}</p>
      <p className="text-gray-400 text-xs leading-relaxed mt-2">A. {a}</p>
    </div>
  );
}
