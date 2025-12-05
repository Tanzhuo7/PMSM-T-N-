import React, { useState, useMemo } from 'react';
import { MotorParams, Language } from './types';
import { DEFAULT_PARAMS, TRANSLATIONS } from './constants';
import { calculateMotorCharacteristics } from './utils/motorPhysics';
import ParameterInput from './components/ParameterInput';
import ResultsPanel from './components/ResultsPanel';

const App: React.FC = () => {
  const [params, setParams] = useState<MotorParams>(DEFAULT_PARAMS);
  const [language, setLanguage] = useState<Language>('zh');

  const t = TRANSLATIONS[language];

  // Use useMemo to prevent unnecessary recalculations on re-renders if params haven't changed
  const result = useMemo(() => {
    return calculateMotorCharacteristics(params);
  }, [params]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="bg-blue-600 p-2 rounded-lg">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
             </div>
             <div>
               <h1 className="text-xl font-bold text-gray-900 tracking-tight">{t.appTitle}</h1>
               <p className="text-xs text-gray-500">{t.appSubtitle}</p>
             </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setLanguage(l => l === 'en' ? 'zh' : 'en')}
              className="px-3 py-1 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {language === 'en' ? '中文' : 'English'}
            </button>
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 hidden sm:block">
              {t.documentation}
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 xl:col-span-3">
            <ParameterInput params={params} onChange={setParams} language={language} />
          </div>

          {/* Right Column: Charts */}
          <div className="lg:col-span-8 xl:col-span-9 min-h-[500px]">
            <ResultsPanel result={result} params={params} language={language} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            PMSM Performance Analyzer &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;