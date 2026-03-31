import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { componentNames } from '../catalog';
import spec from '../spec.json';

export function useAIGeneration(
  setParsedSpec: (spec: any) => void,
  setJsonText: (text: string) => void,
  setToastMessage: (msg: any) => void,
  setShowKeyDialog: (show: boolean) => void,
  setError: (err: string | null) => void,
  currentPluginId: string | null,
  prompt: string,
  updateState?: (updates: any) => void,
  setState?: (key: string, value: any) => void
) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  const handleGenerateAI = async (overridePrompt?: string, targetPluginId?: string, profileDataToInject?: any) => {
    const currentPrompt = overridePrompt || prompt;
    if (!currentPrompt.trim()) return;
    
    const activePluginId = targetPluginId || currentPluginId;
    
    setIsGenerating(true);
    setStreamingText('');
    setToastMessage({ message: 'Generating UI...', type: 'info' });
    
    try {
      // Check for API key availability
      let hasKey = false;
      if (window.aistudio?.hasSelectedApiKey) {
        hasKey = await window.aistudio.hasSelectedApiKey();
      }
      
      const apiKey = (typeof process !== 'undefined' && process.env) ? (process.env.GEMINI_API_KEY || process.env.API_KEY) : undefined;
      
      if (!hasKey && !apiKey) {
        setShowKeyDialog(true);
        throw new Error('API Key missing. Please select an API key.');
      }

      let finalApiKey = apiKey;
      if (!finalApiKey) {
        try {
          const res = await fetch('/api/key');
          const data = await res.json();
          finalApiKey = data.key;
        } catch (e) {
          console.warn('Failed to fetch API key from server', e);
        }
      }

      if (!finalApiKey) {
        setShowKeyDialog(true);
        throw new Error('Could not retrieve API key. Please select one.');
      }

      const ai = new GoogleGenAI({ apiKey: finalApiKey });

      const systemInstruction = `You are an expert UI generator for the A2UI framework.
A2UI uses a flat JSON structure where 'root' points to the top-level element ID, and 'elements' is a dictionary of all components by ID.

CRITICAL: You MUST output using the A2UI Streaming Protocol.
This means you MUST output a sequence of JSON objects, one per line (JSONL format).
DO NOT output a single large JSON object. DO NOT wrap the output in markdown code blocks.

A2UI Streaming Protocol Messages:
1. createSurface: Defines the root element ID.
   Format: {"type": "createSurface", "root": "root_id"}
2. updateComponents: Adds or updates components in the elements dictionary.
   Format: {"type": "updateComponents", "components": {"element_id": {"type": "...", "props": {...}, "children": [...]}}}

Rules for generating the UI:
- Start with a single 'createSurface' message.
- Follow with multiple 'updateComponents' messages, streaming components progressively.
- You can send one component per message or group a few related components.
- Use ONLY the following component types: ${componentNames.join(', ')}.
- Ensure all children IDs referenced in a component are eventually defined in subsequent messages.
- For forms, ALWAYS include a 'TextField' with name: 'profileName' and label: 'Profile Name'.
- The final UI should be professional, well-structured, and use appropriate input types.

Example Output Stream:
{"type": "createSurface", "root": "root"}
{"type": "updateComponents", "components": {"root": {"type": "Column", "props": {"gap": 4}, "children": ["header", "form"]}}}
{"type": "updateComponents", "components": {"header": {"type": "Text", "props": {"content": "Settings", "variant": "h2"}}}}
{"type": "updateComponents", "components": {"form": {"type": "Form", "props": {}, "children": ["profileName"]}}}
{"type": "updateComponents", "components": {"profileName": {"type": "TextField", "props": {"name": "profileName", "label": "Profile Name"}}}}`;

      let pluginSchemaContext = '';
      if (activePluginId) {
        const plugin = spec.pluginDescriptors.find(p => p.id === activePluginId);
        if (plugin) {
          pluginSchemaContext = `\n\nTarget Plugin Schema (${plugin.displayName || plugin.id}):\n${JSON.stringify(plugin.schema, null, 2)}`;
        }
      }

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.1-flash-lite-preview',
        contents: currentPrompt + pluginSchemaContext,
        config: {
          systemInstruction,
          temperature: 0.2,
        }
      });

      let buffer = '';
      let accumulatedSpec: any = { root: 'loading', elements: {} };
      
      setParsedSpec(accumulatedSpec);

      for await (const chunk of responseStream) {
        if (chunk.text) {
          const text = chunk.text;
          setStreamingText(prev => prev + text);
          buffer += text;

          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (line) {
              try {
                const message = JSON.parse(line);
                if (message.type === 'createSurface' && message.root) {
                  accumulatedSpec.root = message.root;
                } else if (message.type === 'updateComponents' && message.components) {
                  accumulatedSpec.elements = { ...accumulatedSpec.elements, ...message.components };
                }
                
                setParsedSpec({ ...accumulatedSpec });
              } catch (e) {
                console.warn('Failed to parse streaming JSON line:', line, e);
              }
            }
          }
        }
      }

      if (buffer.trim()) {
        try {
          const message = JSON.parse(buffer.trim());
          if (message.type === 'createSurface' && message.root) {
            accumulatedSpec.root = message.root;
          } else if (message.type === 'updateComponents' && message.components) {
            accumulatedSpec.elements = { ...accumulatedSpec.elements, ...message.components };
          }
        } catch (e) {
          console.warn('Failed to parse final streaming JSON line:', buffer.trim(), e);
        }
      }

      // Final validation and injection
      if (!accumulatedSpec.root || accumulatedSpec.root === 'loading' || Object.keys(accumulatedSpec.elements).length === 0) {
        throw new Error("AI did not generate a valid A2UI spec stream.");
      }

      let hasProfileName = false;
      Object.values(accumulatedSpec.elements).forEach((el: any) => {
        if (el.type === 'TextField' && el.props?.name === 'profileName') {
          hasProfileName = true;
        }
      });

      if (!hasProfileName) {
        const formId = Object.keys(accumulatedSpec.elements).find(k => accumulatedSpec.elements[k].type === 'Form');
        if (formId) {
          const newProfileNameId = 'injected-profile-name';
          accumulatedSpec.elements[newProfileNameId] = {
            type: 'TextField',
            props: { name: 'profileName', label: 'Profile Name (Auto-added)', placeholder: 'e.g. Production' }
          };
          accumulatedSpec.elements[formId].children = [newProfileNameId, ...(accumulatedSpec.elements[formId].children || [])];
        }
      }

      setParsedSpec({ ...accumulatedSpec });
      setJsonText(JSON.stringify(accumulatedSpec, null, 2));
      
      if (activePluginId) {
        localStorage.setItem(`plugin_ui_${activePluginId}`, JSON.stringify(accumulatedSpec));
      }

      if (profileDataToInject) {
        if (updateState) {
          updateState(profileDataToInject);
        } else if (setState) {
          Object.keys(profileDataToInject).forEach(key => {
            setState(key, profileDataToInject[key]);
          });
        }
      }

      setToastMessage({ message: 'UI Generated Successfully', type: 'success' });
      setTimeout(() => setToastMessage(null), 3000);

    } catch (err: any) {
      console.error('Generation Error:', err);
      setError(err.message || 'Failed to generate UI');
      setToastMessage({ message: 'Generation failed', type: 'error' });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    setIsGenerating,
    streamingText,
    handleGenerateAI
  };
}
