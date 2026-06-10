import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import SetupWizard from './components/Setup/SetupWizard';
import Navigation, { TabId } from './components/Layout/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import MonthlyInput from './components/Input/MonthlyInput';
import HistoryView from './components/History/HistoryView';
import SimulationView from './components/Simulation/SimulationView';
import ReportView from './components/Report/ReportView';
import SettingsView from './components/Settings/SettingsView';
import HelpView from './components/Help/HelpView';

function AppInner() {
  const { state } = useApp();
  const [tab, setTab] = useState<TabId>('dashboard');

  if (!state.profile.isSetupComplete) {
    return <SetupWizard />;
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Navigation active={tab} onChange={setTab} />
      <main className="flex-1 overflow-y-auto">
        {tab === 'dashboard' && <Dashboard onNavigate={(t) => setTab(t as TabId)} />}
        {tab === 'input' && <MonthlyInput />}
        {tab === 'history' && <HistoryView />}
        {tab === 'simulation' && <SimulationView />}
        {tab === 'report' && <ReportView />}
        {tab === 'settings' && <SettingsView />}
        {tab === 'help' && <HelpView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
