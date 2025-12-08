
import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { SimulationResult, Language, MotorParams } from '../types';
import { COLORS, TRANSLATIONS } from '../constants';

interface ResultsPanelProps {
  result: SimulationResult;
  params: MotorParams;
  language: Language;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-xl rounded-lg text-sm">
        <p className="font-bold text-gray-700 mb-2">{`${label} RPM`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(2)} {entry.unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, params, language }) => {
  const { points, maxTorque, maxPower, baseSpeed } = result;
  const { motorType, enableFluxWeakening } = params;
  const [showFormulas, setShowFormulas] = useState(false);
  const t = TRANSLATIONS[language];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800">{t.calcPerformance}</h2>
        </div>
        
        <div className="flex space-x-4 text-sm">
           <div className="px-3 py-1 bg-gray-100 rounded-md">
             <span className="text-gray-500 block text-xs">{t.maxTorque}</span>
             <span className="font-bold text-gray-800">{maxTorque.toFixed(1)} Nm</span>
           </div>
           <div className="px-3 py-1 bg-gray-100 rounded-md">
             <span className="text-gray-500 block text-xs">{t.baseSpeed}</span>
             <span className="font-bold text-gray-800">{baseSpeed.toFixed(0)} RPM</span>
           </div>
           <div className="px-3 py-1 bg-gray-100 rounded-md">
             <span className="text-gray-500 block text-xs">{t.peakPower}</span>
             <span className="font-bold text-gray-800">{maxPower.toFixed(1)} kW</span>
           </div>
        </div>
      </div>

      <div className="flex-1 min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={points}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis 
              dataKey="speedRPM" 
              label={{ value: t.speedRPM, position: 'insideBottomRight', offset: -10 }} 
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            {/* Y Axis for Torque */}
            <YAxis 
              yAxisId="left" 
              label={{ value: t.torqueNm, angle: -90, position: 'insideLeft' }}
            />
            {/* Y Axis for Power */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              label={{ value: t.powerkW, angle: 90, position: 'insideRight' }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36}/>

            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="torque" 
              name={t.torqueNm.split(' ')[0]} 
              unit="Nm"
              fill="url(#colorTorque)" 
              fillOpacity={0.1}
              stroke={COLORS.primary} 
              strokeWidth={3}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="power" 
              name={t.powerkW.split(' ')[0]} 
              unit="kW"
              stroke={COLORS.secondary} 
              strokeWidth={3}
              dot={false}
            />
            
            <defs>
              <linearGradient id="colorTorque" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
              </linearGradient>
            </defs>

            {baseSpeed > 0 && (
               <ReferenceLine x={baseSpeed} stroke="red" strokeDasharray="3 3" label={{ value: t.baseSpeed, position: 'insideTopLeft', fill: 'red', fontSize: 12 }} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Stats and Formulas Toggle */}
      <div className="mt-6 border-t pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 mb-4">
          <div>
            <span className="block font-semibold">{t.motorType}</span>
            {motorType}
          </div>
          <div>
              <span className="block font-semibold">{t.mtpaAngle}</span>
              {result.points[0]?.currentAngle.toFixed(1)}°
          </div>
          <div>
              <span className="block font-semibold">{t.maxFwAngle}</span>
              {result.points[result.points.length - 1]?.currentAngle.toFixed(1)}°
          </div>
          <div>
              <span className="block font-semibold">{t.voltageUtilResult}</span>
              {(result.points[result.points.length - 1]?.voltageIndex * 100).toFixed(1)}%
          </div>
        </div>

        <button 
          onClick={() => setShowFormulas(!showFormulas)}
          className="text-blue-600 text-xs font-semibold hover:text-blue-800 flex items-center"
        >
          {showFormulas ? t.hideFormulas : t.showFormulas}
          <svg className={`w-4 h-4 ml-1 transform transition-transform ${showFormulas ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showFormulas && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 font-mono overflow-x-auto">
            <h4 className="font-bold text-gray-900 mb-3 border-b pb-1">{t.mathModel}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="font-semibold text-xs text-gray-500 uppercase mb-1">{t.voltageEq}</p>
                <div className="space-y-2">
                  <p>v<sub>d</sub> = R<sub>s</sub>i<sub>d</sub> - ω<sub>e</sub>L<sub>q</sub>i<sub>q</sub></p>
                  <p>v<sub>q</sub> = R<sub>s</sub>i<sub>q</sub> + ω<sub>e</sub>(L<sub>d</sub>i<sub>d</sub> + ψ<sub>f</sub>)</p>
                  <p>v<sub>s</sub> = √(v<sub>d</sub>² + v<sub>q</sub>²) ≤ V<sub>max</sub></p>
                  <p className="text-xs text-gray-400 mt-1">V<sub>max</sub> = (V<sub>dc</sub>/√3) · η</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-xs text-gray-500 uppercase mb-1">{t.torqueFlux}</p>
                <div className="space-y-2">
                  <p>T<sub>e</sub> = 1.5 · p · [ψ<sub>f</sub>i<sub>q</sub> + (L<sub>d</sub> - L<sub>q</sub>)i<sub>d</sub>i<sub>q</sub>]</p>
                  <p>ψ<sub>d</sub> = L<sub>d</sub>i<sub>d</sub> + ψ<sub>f</sub></p>
                  <p>ψ<sub>q</sub> = L<sub>q</sub>i<sub>q</sub></p>
                </div>
              </div>

              <div>
                 {/* Base Speed Section */}
                 <p className="font-semibold text-xs text-gray-500 uppercase mb-1">{t.baseSpeedFormula}</p>
                 <div className="space-y-2 mb-4 border-b border-gray-200 pb-3">
                   <p>ω<sub>base</sub> ≈ V<sub>lim</sub> / ψ<sub>total</sub></p>
                   <p className="text-xs text-gray-600">ψ<sub>total</sub> = √[(L<sub>q</sub>i<sub>q</sub>)² + (L<sub>d</sub>i<sub>d</sub>+ψ<sub>f</sub>)²]</p>
                   <p className="text-xs text-gray-400">i<sub>d</sub>, i<sub>q</sub> @ I<sub>max</sub> (MTPA)</p>
                 </div>

                 <p className="font-semibold text-xs text-gray-500 uppercase mb-1">{t.maxSpeedTheory}</p>
                 {enableFluxWeakening ? (
                    <div className="space-y-2 bg-blue-50 p-2 rounded">
                      <p className="text-xs font-bold text-blue-700 mb-1">Flux Weakening Mode</p>
                      <p className="text-xs text-gray-600">Char. Current: I<sub>ch</sub> = ψ<sub>f</sub> / L<sub>d</sub></p>
                      <p>If I<sub>max</sub> &ge; I<sub>ch</sub>: <br/> &nbsp; ω<sub>max</sub> &to; ∞</p>
                      <p>If I<sub>max</sub> &lt; I<sub>ch</sub>: <br/> &nbsp; ω<sub>max</sub> = V<sub>lim</sub> / |ψ<sub>f</sub> - L<sub>d</sub>I<sub>max</sub>|</p>
                    </div>
                 ) : (
                    <div className="space-y-2 bg-orange-50 p-2 rounded">
                      <p className="text-xs font-bold text-orange-700 mb-1">No-Load (Back EMF) Mode</p>
                      <p>V<sub>lim</sub> = ω<sub>e</sub> · ψ<sub>f</sub></p>
                      <p>ω<sub>max</sub> = V<sub>lim</sub> / ψ<sub>f</sub></p>
                      <p className="text-xs text-gray-400 mt-1">Limited by generated voltage matching DC bus.</p>
                    </div>
                 )}
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 italic">
               {t.modelNote}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;
