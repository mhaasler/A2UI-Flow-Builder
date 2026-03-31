import React, { useState } from 'react';

export const Wizard: React.FC<any> = ({ steps = [], children, className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {steps.map((step: string, idx: number) => (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-medium text-sm ${
                idx <= currentStep
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-slate-300 text-slate-500'
              }`}
            >
              {idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  idx < currentStep ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
        <h3 className="text-lg font-medium text-slate-900 mb-4">{steps[currentStep]}</h3>
        {/* Render the child corresponding to the current step */}
        {React.Children.toArray(children)[currentStep]}
      </div>

      {/* Controls */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export const Tabs: React.FC<any> = ({ tabs = [], children, className = '' }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === idx
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-4">
        {React.Children.toArray(children)[activeTab]}
      </div>
    </div>
  );
};
