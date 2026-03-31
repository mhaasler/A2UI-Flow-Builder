import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StateProvider, VisibilityProvider, ActionProvider, useStateStore } from '@json-render/react';
import { Renderer } from './components/A2UI/Renderer';
import { createRegistry } from './registry';
import { Save, CheckCircle, AlertCircle, Layers, Sparkles, Loader2 } from 'lucide-react';
import { WorkflowEditor } from './components/WorkflowEditor';
import { useAIGeneration } from './hooks/useAIGeneration';
import { useAppActions } from './hooks/useAppActions';
import { useSidebarSpec } from './hooks/useSidebarSpec';
import spec from './spec.json';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const defaultSpec = {
  root: 'root',
  elements: {
    'root': {
      type: 'Column',
      props: { gap: 6, className: 'w-full max-w-3xl mx-auto p-8' },
      children: ['header', 'divider-1', 'main-card', 'info-card']
    },
    'header': {
      type: 'Row',
      props: { justify: 'between', align: 'center' },
      children: ['title', 'status-badge']
    },
    'title': {
      type: 'Text',
      props: { content: 'Shopware App OAuth Configuration', variant: 'h1' }
    },
    'status-badge': {
      type: 'Badge',
      props: { content: 'Draft', color: 'yellow' }
    },
    'divider-1': {
      type: 'Divider'
    },
    'main-card': {
      type: 'Card',
      props: { padding: 8 },
      children: ['form']
    },
    'form': {
      type: 'Form',
      props: { onSubmitAction: 'UpsertProfile' },
      children: ['profile-name', 'client-id', 'client-secret', 'spacer-1', 'actions-row']
    },
    'profile-name': {
      type: 'TextField',
      props: { name: 'profileName', label: 'Profile Name', placeholder: 'e.g. Production Shop' }
    },
    'client-id': {
      type: 'TextField',
      props: { name: 'clientId', label: 'Client ID', placeholder: 'Enter your Shopware Client ID' }
    },
    'client-secret': {
      type: 'TextField',
      props: { name: 'clientSecret', label: 'Client Secret', placeholder: 'Enter your Shopware Client Secret', isSecret: true }
    },
    'spacer-1': {
      type: 'Spacer',
      props: { size: 4 }
    },
    'actions-row': {
      type: 'Row',
      props: { justify: 'end', gap: 4 },
      children: ['btn-validate', 'btn-save']
    },
    'btn-validate': {
      type: 'Button',
      props: { label: 'Validate', variant: 'secondary', action: 'ValidateConfig' }
    },
    'btn-save': {
      type: 'Button',
      props: { label: 'Save Profile', variant: 'primary', action: 'UpsertProfile', payload: { type: 'connection.shopware.app_oauth' } }
    },
    'info-card': {
      type: 'Card',
      props: { padding: 6, className: 'bg-slate-50 border-slate-200' },
      children: ['info-text', 'info-code']
    },
    'info-text': {
      type: 'Text',
      props: { content: 'This configuration uses the connection.shopware.app_oauth plugin descriptor.', variant: 'small' }
    },
    'info-code': {
      type: 'Code',
      props: { content: '{\n  "clientId": "...",\n  "clientSecret": "..."\n}', className: 'mt-2' }
    }
  }
};

const RendererWrapper = ({ spec, registry }: { spec: any, registry: any }) => {
  return (
    <VisibilityProvider>
      {(!spec || !spec.elements || Object.keys(spec.elements).length === 0) ? (
        <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
          No UI elements to display.
        </div>
      ) : (
        <Renderer spec={spec} registry={registry} />
      )}
    </VisibilityProvider>
  );
};

const AppContent = () => {
  const { state, set, update, getSnapshot } = useStateStore();
  const stateRef = useRef(state);
  stateRef.current = state;

  const [jsonText, setJsonText] = useState(JSON.stringify(defaultSpec, null, 2));
  const [parsedSpec, setParsedSpec] = useState<any>(defaultSpec);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  const [prompt, setPrompt] = useState('');
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.root || !parsed.elements) {
        throw new Error("JSON must be a json-render spec (root and elements properties).");
      }
      setParsedSpec(parsed);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [jsonText]);

  const {
    profiles,
    currentProfileId,
    currentPluginId,
    handleAction
  } = useAppActions(
    setJsonText,
    setToastMessage,
    (p, id, data) => handleGenerateAI(p, id, data),
    setPrompt,
    getSnapshot,
    stateRef,
    update,
    set
  );

  const {
    isGenerating,
    setIsGenerating,
    streamingText,
    handleGenerateAI
  } = useAIGeneration(
    setParsedSpec,
    setJsonText,
    setToastMessage,
    setShowKeyDialog,
    setError,
    currentPluginId,
    prompt,
    update,
    set
  );

  const registry = useMemo(() => createRegistry(handleAction), [profiles, currentPluginId, currentProfileId]);
  const sidebarSpec = useSidebarSpec(profiles, currentPluginId, currentProfileId);

  const handleOpenKeySelection = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-900">
      <ActionProvider handlers={registry.actions}>
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Spec Editor */}
        <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm relative">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Layers size={18} className="text-indigo-600" />
              A2UI Spec Editor
            </h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <textarea
              className="w-full h-full p-4 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the UI you want..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isGenerating) {
                    handleGenerateAI();
                  }
                }}
              />
              <button 
                onClick={() => handleGenerateAI()}
                disabled={isGenerating || !prompt.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isGenerating ? 'Generating...' : 'Generate UI'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Pane: Plugin Selection (Now driven by json-render!) */}
          <div className="w-64 bg-white border-r border-slate-200 flex flex-col overflow-y-auto z-10">
            <div className="p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Plugins</h2>
            </div>
            <RendererWrapper spec={sidebarSpec} registry={registry} />
          </div>

          {/* Right Pane: Renderer */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white shadow-sm z-10">
              <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                <Layers size={16} className="text-indigo-600" />
                Flow Preview
              </div>
              <div className="flex gap-2">
                {currentPluginId && (
                  <button 
                    onClick={() => {
                      localStorage.removeItem(`plugin_ui_${currentPluginId}`);
                      handleAction('LoadPlugin', { plugin: currentPluginId });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200"
                    title="Clear cache and regenerate UI with AI"
                  >
                    <Sparkles size={14} /> Regenerate UI
                  </button>
                )}
                <button 
                  onClick={() => handleAction('ValidateConfig')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200"
                >
                  <CheckCircle size={14} /> Validate
                </button>
                <button 
                  onClick={() => handleAction('ExportSchemaBundle')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm"
                >
                  <Save size={14} /> Export
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 border-2 border-dashed border-slate-200 m-4 rounded-xl bg-white relative">
              {showKeyDialog ? (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto p-8">
                  <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">API Key Required</h3>
                  <p className="text-slate-500 text-sm mb-8">
                    To use the AI generation features, you must select a valid Gemini API key from a paid Google Cloud project.
                  </p>
                  <div className="flex flex-col gap-3 w-full">
                    <button 
                      onClick={handleOpenKeySelection}
                      className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                    >
                      Select API Key
                    </button>
                    <button 
                      onClick={() => setShowKeyDialog(false)}
                      className="w-full py-3 bg-white text-slate-600 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Back to Preview
                    </button>
                  </div>
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-6 text-xs text-indigo-600 hover:underline"
                  >
                    Learn about Gemini API billing
                  </a>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <AlertCircle size={48} className="mb-4 opacity-50" />
                  <p>{error}</p>
                </div>
              ) : (
                <>
                  {isGenerating && parsedSpec.root === 'loading' ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <Loader2 size={48} className="mb-4 animate-spin text-indigo-600" />
                      <p className="text-slate-600 font-medium">AI is crafting your UI...</p>
                      <p className="text-slate-400 text-sm mt-4">Waiting for first chunks...</p>
                    </div>
                  ) : spec.pluginDescriptors.find(p => p.id === currentPluginId)?.kind === 'workflow' ? (
                    <WorkflowEditor 
                      pluginId={currentPluginId} 
                      profiles={profiles} 
                      onSave={() => handleAction('UpsertProfile')} 
                    />
                  ) : (
                    <RendererWrapper spec={parsedSpec} registry={registry} />
                  )}

                  {isGenerating && (
                    <div className="absolute bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 flex flex-col animate-in slide-in-from-bottom-5">
                      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin text-indigo-600" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Live Stream</span>
                        </div>
                        <button 
                          onClick={() => setIsGenerating(false)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 rounded hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                      {streamingText && (
                        <div className="bg-slate-900 p-3 font-mono text-[10px] text-emerald-400 h-32 overflow-y-auto flex flex-col-reverse">
                          <pre className="whitespace-pre-wrap break-all opacity-80">
                            {streamingText}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Toast Notification */}
            {toastMessage && (
              <div className="absolute bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border ${
                  toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                  toastMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  {toastMessage.type === 'success' ? <CheckCircle size={18} /> : 
                   toastMessage.type === 'info' ? <Loader2 size={18} className="animate-spin" /> : 
                   <AlertCircle size={18} />}
                  <span className="text-sm font-medium">{toastMessage.message}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </ActionProvider>
    </div>
  );
};

export default function App() {
  return (
    <StateProvider>
      <AppContent />
    </StateProvider>
  );
}
