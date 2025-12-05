
import React, { useState, useEffect, useRef } from 'react';
import { MotorParams, MotorType, Language, ControlStrategy } from '../types';
import { TRANSLATIONS } from '../constants';
import { calculateTheoreticalMaxSpeed } from '../utils/motorPhysics';

interface ParameterInputProps {
  params: MotorParams;
  onChange: (newParams: MotorParams) => void;
  language: Language;
}

// Helper to convert number to string without scientific notation
const formatNumber = (num: number): string => {
  if (Math.abs(num) < 1e-9) return "0";
  return num.toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 10 });
};

// SmartInput handles the edge cases of typing numbers
const SmartInput = ({ 
  value, 
  onChange, 
  step = "any", 
  placeholder = "" 
}: { 
  value: number; 
  onChange: (val: number) => void; 
  step?: number | string; 
  placeholder?: string;
}) => {
  const [localValue, setLocalValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isFocused = document.activeElement === inputRef.current;
    const parsedLocal = parseFloat(localValue);
    const isNumericallySame = !isNaN(parsedLocal) && Math.abs(parsedLocal - value) < 1e-9;

    if (!isFocused) {
      if (!isNumericallySame || localValue === '') {
         setLocalValue(formatNumber(value));
      } else {
         if (parseFloat(localValue) !== value) {
            setLocalValue(formatNumber(value));
         }
      }
    } else {
      if (!isNumericallySame) {
        setLocalValue(formatNumber(value));
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setLocalValue(rawVal);
    
    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <input
      ref={inputRef}
      type="number"
      step={step}
      value={localValue}
      onChange={handleChange}
      // "appearance-none" and specific Webkit styles hide the spinner arrows to save space
      className="block w-full rounded-md border-gray-300 pl-3 pr-7 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-50 border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      placeholder={placeholder}
    />
  );
};

// Moved InputFieldWrapper outside to prevent re-mounting on every render
interface InputFieldWrapperProps {
  label: string;
  value: number;
  unit: string;
  step?: number;
  customAction?: React.ReactNode;
  onChange: (val: number) => void;
}

const InputFieldWrapper: React.FC<InputFieldWrapperProps> = ({ 
  label, 
  value, 
  unit, 
  step = 0.01,
  customAction,
  onChange
}) => (
  <div className="flex flex-col space-y-1">
    <div className="flex justify-between items-center">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate pr-2">
        {label}
      </label>
      {customAction}
    </div>
    <div className="relative rounded-md shadow-sm">
      <SmartInput 
        value={value}
        onChange={onChange}
        step={step}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <span className="text-gray-400 text-xs sm:text-sm">{unit}</span>
      </div>
    </div>
  </div>
);

const ParameterInput: React.FC<ParameterInputProps> = ({ params, onChange, language }) => {
  const t = TRANSLATIONS[language];

  const handleParamChange = (key: keyof MotorParams, numValue: number) => {
    if (key === 'rs') {
      onChange({ ...params, [key]: numValue / 1000 });
    } else {
      onChange({ ...params, [key]: numValue });
    }
  };

  const handleTypeChange = (type: MotorType) => {
    const newParams = { ...params, motorType: type };
    if (type === 'SPMSM') {
      newParams.lq = newParams.ld;
    }
    onChange(newParams);
  };
  
  const handleStrategyChange = (strategy: ControlStrategy) => {
    onChange({ ...params, controlStrategy: strategy });
  };
  
  const handleFwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...params, enableFluxWeakening: e.target.checked });
  };

  const handleLsChange = (numValue: number) => {
    onChange({ ...params, ld: numValue, lq: numValue });
  };

  const handleAutoMaxSpeed = () => {
    const speed = calculateTheoreticalMaxSpeed(params);
    onChange({ ...params, maxSpeed: speed });
  };

  const rsDisplay = parseFloat((params.rs * 1000).toFixed(4));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full overflow-y-auto">
      <div className="flex items-center space-x-2 mb-6">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-800">{t.motorParams}</h2>
      </div>

      {/* Control Strategy Selection */}
      <div className="mb-6">
         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
           {t.controlStrategy}
         </label>
         <div className="flex rounded-md shadow-sm mb-3" role="group">
           <button
             type="button"
             onClick={() => handleStrategyChange('MTPA')}
             className={`flex-1 px-4 py-2 text-sm font-medium border rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 ${
               params.controlStrategy === 'MTPA'
                 ? 'bg-blue-600 text-white border-blue-600'
                 : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
             }`}
           >
             {t.mtpa}
           </button>
           <button
             type="button"
             onClick={() => handleStrategyChange('Id=0')}
             className={`flex-1 px-4 py-2 text-sm font-medium border rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500 ${
               params.controlStrategy === 'Id=0'
                 ? 'bg-blue-600 text-white border-blue-600'
                 : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
             }`}
           >
             {t.idZero}
           </button>
         </div>
         
         <div className="flex items-center">
           <input
             id="fw-checkbox"
             type="checkbox"
             checked={params.enableFluxWeakening}
             onChange={handleFwChange}
             className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
           />
           <label htmlFor="fw-checkbox" className="ml-2 text-sm font-medium text-gray-900">
             {t.enableFw}
           </label>
         </div>
      </div>

      {/* Motor Type Selection */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
          {t.motorType}
        </label>
        <div className="flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => handleTypeChange('IPMSM')}
            className={`flex-1 px-4 py-2 text-sm font-medium border rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 ${
              params.motorType === 'IPMSM'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            IPMSM
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('SPMSM')}
            className={`flex-1 px-4 py-2 text-sm font-medium border rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500 ${
              params.motorType === 'SPMSM'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            SPMSM
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {params.motorType === 'IPMSM' ? t.ipmsmDesc : t.spmsmDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <InputFieldWrapper 
            label={t.statorResistance} 
            value={rsDisplay} 
            unit="mΩ" 
            step={0.1} 
            onChange={(val) => handleParamChange('rs', val)}
          />
          <InputFieldWrapper 
            label={t.fluxLinkage} 
            value={params.psif} 
            unit="Wb" 
            step={0.000001} 
            onChange={(val) => handleParamChange('psif', val)}
          />
        </div>

        {params.motorType === 'IPMSM' ? (
          <div className="grid grid-cols-2 gap-4">
            <InputFieldWrapper 
              label={t.dAxisInductance} 
              value={params.ld} 
              unit="H" 
              step={0.000001} 
              onChange={(val) => handleParamChange('ld', val)}
            />
            <InputFieldWrapper 
              label={t.qAxisInductance} 
              value={params.lq} 
              unit="H" 
              step={0.000001} 
              onChange={(val) => handleParamChange('lq', val)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t.syncInductance}
              </label>
              <div className="relative rounded-md shadow-sm">
                <SmartInput 
                  value={params.ld}
                  onChange={handleLsChange}
                  step={0.000001}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <span className="text-gray-400 text-xs sm:text-sm">H</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <InputFieldWrapper 
            label={t.polePairs} 
            value={params.p} 
            unit="-" 
            step={1} 
            onChange={(val) => handleParamChange('p', val)}
          />
          <InputFieldWrapper 
             label={t.maxSpeed} 
             value={params.maxSpeed} 
             unit="RPM" 
             step={100}
             onChange={(val) => handleParamChange('maxSpeed', val)}
             customAction={
               <button 
                 onClick={handleAutoMaxSpeed}
                 className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                 title="Calculate theoretical max speed"
               >
                 {t.autoCalc}
               </button>
             }
          />
        </div>

        <div className="border-t pt-4 mt-2">
          <h3 className="text-sm font-bold text-gray-700 mb-3">{t.inverterConstraints}</h3>
          <div className="grid grid-cols-2 gap-4">
             <InputFieldWrapper 
               label={t.dcBusVoltage} 
               value={params.vdc} 
               unit="V" 
               step={0.1} 
               onChange={(val) => handleParamChange('vdc', val)}
             />
             <InputFieldWrapper 
               label={t.maxCurrent} 
               value={params.imax} 
               unit="A" 
               step={0.1} 
               onChange={(val) => handleParamChange('imax', val)}
             />
          </div>
          <div className="mt-4">
             <InputFieldWrapper 
               label={t.voltageUtil} 
               value={params.voltageUtilization} 
               unit="ratio" 
               step={0.01} 
               onChange={(val) => handleParamChange('voltageUtilization', val)}
             />
          </div>
          {/* Explanation for Voltage */}
          <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800 border border-yellow-100">
             {t.voltageExplain}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-800">
          <strong>{t.noteInductance}</strong>
        </p>
      </div>
    </div>
  );
};

export default ParameterInput;
