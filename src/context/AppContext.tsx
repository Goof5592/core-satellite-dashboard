import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, UserProfile, MonthlyRecord } from '../types';
import { loadState, saveState } from '../utils/storage';
import { RETURN_ASSUMPTIONS } from '../constants/sectors';

type Action =
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'COMPLETE_SETUP'; payload: UserProfile }
  | { type: 'UPSERT_RECORD'; payload: MonthlyRecord }
  | { type: 'DELETE_RECORD'; payload: { year: number; month: number } }
  | { type: 'IMPORT_STATE'; payload: AppState }
  | { type: 'UPDATE_SCENARIO'; payload: UserProfile['scenario'] };

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'COMPLETE_SETUP':
      return { ...state, profile: { ...action.payload, isSetupComplete: true } };
    case 'UPSERT_RECORD': {
      const { year, month } = action.payload;
      const existing = state.records.findIndex(r => r.year === year && r.month === month);
      const records = existing >= 0
        ? state.records.map((r, i) => i === existing ? action.payload : r)
        : [...state.records, action.payload];
      return { ...state, records: records.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month) };
    }
    case 'DELETE_RECORD':
      return {
        ...state,
        records: state.records.filter(r => !(r.year === action.payload.year && r.month === action.payload.month)),
      };
    case 'IMPORT_STATE':
      return action.payload;
    case 'UPDATE_SCENARIO': {
      const assumptions = RETURN_ASSUMPTIONS[action.payload];
      return {
        ...state,
        profile: { ...state.profile, scenario: action.payload, returnAssumptions: assumptions },
      };
    }
    default:
      return state;
  }
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
