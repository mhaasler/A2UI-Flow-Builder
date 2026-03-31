import { useState, useEffect, useRef } from 'react';
import spec from '../spec.json';
import catalogJson from '../catalog.json';

export function useAppActions(
  setJsonText: (text: string) => void,
  setToastMessage: (msg: any) => void,
  handleGenerateAI: (prompt: string, pluginId: string, profileData?: any) => void,
  setPrompt: (prompt: string) => void,
  getSnapshot: any,
  stateRef: any,
  update: any,
  set: any
) {
  const [profiles, setProfiles] = useState<Array<{ id: string, pluginId: string, name: string, data: any }>>([]);
  const profilesRef = useRef(profiles);
  useEffect(() => { profilesRef.current = profiles; }, [profiles]);
  
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const currentProfileIdRef = useRef(currentProfileId);
  useEffect(() => { currentProfileIdRef.current = currentProfileId; }, [currentProfileId]);

  const [currentPluginId, setCurrentPluginId] = useState<string | null>(null);
  const currentPluginIdRef = useRef(currentPluginId);
  useEffect(() => { currentPluginIdRef.current = currentPluginId; }, [currentPluginId]);

  // Fetch profiles on mount
  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProfiles(data);
        }
      })
      .catch(err => console.error('Failed to fetch profiles:', err));
  }, []);

  const loadPluginUI = (pluginId: string, profileData?: any) => {
    // Check cache first
    const cachedSpec = localStorage.getItem(`plugin_ui_${pluginId}`);
    if (cachedSpec) {
      if (!cachedSpec.includes('"profileName"')) {
        console.log('Invalidating cache because profileName field is missing');
        localStorage.removeItem(`plugin_ui_${pluginId}`);
      } else {
        setJsonText(cachedSpec);
        setToastMessage({ message: `Loaded UI for ${pluginId}`, type: 'success' });
        
        const currentState = getSnapshot ? getSnapshot() : stateRef.current;
        if (update) {
          const updates: any = {};
          Object.keys(currentState).forEach(key => {
            updates[key] = '';
          });
          update(updates);
        } else {
          Object.keys(currentState).forEach(key => {
            set(key, '');
          });
        }
        
        if (profileData) {
          if (update) {
            update(profileData);
          } else {
            Object.keys(profileData).forEach(key => {
              set(key, profileData[key]);
            });
          }
        }
        return;
      }
    }

    const plugin = spec.pluginDescriptors.find(p => p.id === pluginId);
    
    // Skip AI generation for workflow plugins
    if (plugin?.kind === 'workflow') {
      setJsonText(JSON.stringify({ root: 'empty', elements: { empty: { type: 'Column' } } }));
      
      const currentState = getSnapshot ? getSnapshot() : stateRef.current;
      if (update) {
        const updates: any = {};
        Object.keys(currentState).forEach(key => updates[key] = '');
        update(updates);
      } else {
        Object.keys(currentState).forEach(key => set(key, ''));
      }
      
      if (profileData) {
        if (update) {
          update(profileData);
        } else {
          Object.keys(profileData).forEach(key => set(key, profileData[key]));
        }
      }
      return;
    }

    const availableProfiles = profilesRef.current.map(p => ({ label: p.name || 'Unnamed', value: p.id, pluginId: p.pluginId }));
    const profilesContext = availableProfiles.length > 0 
      ? `\nAvailable profiles for references (use these for Select options if the schema requires a profile ID): ${JSON.stringify(availableProfiles)}`
      : `\nNo profiles available yet for references.`;

    const loadPrompt = `Generate a professional configuration form for the "${plugin?.displayName || pluginId}" plugin.
Structure:
1. Root: A 'Column' with gap: 6 and padding: 8.
2. Header: A 'Row' with a 'Text' (variant: h2, content: 'Configure ${plugin?.displayName || pluginId}') and a 'Badge' (content: 'v1.0').
3. Form: A 'Form' component with onSubmitAction: 'UpsertProfile'.
4. Fields: Inside the form, use a 'Column' with gap: 4 containing all necessary input components based on the plugin's schema in the spec.
   - ADD A 'TextField' FIRST with name: 'profileName', label: 'Profile Name', placeholder: 'e.g. Production Shop'.
   - Use 'TextField' for short string properties.
   - Use 'TextAreaField' (with rows: 10) for long string properties like JSON, mapping rules, or expressions.
   - Use 'NumberField' for number properties.
   - Use 'StringArrayField' for array of string properties.
   - Use 'Select' for enum properties or profile references. Provide 'options' array with {label, value}.
   - IMPORTANT: Every input component MUST have a 'name' prop matching the schema property key.
5. Actions: A 'Row' at the bottom with justify: 'end' containing a 'Button' (variant: 'primary', label: 'Save Configuration').${profilesContext}`;
    
    setPrompt(loadPrompt);
    handleGenerateAI(loadPrompt, pluginId, profileData);
  };

  const handleAction = async (actionId: string, payload?: any) => {
    console.log(`Action triggered: ${actionId}`, payload);
    
    if (actionId === 'CreateProfile') {
      const { pluginId } = payload;
      setCurrentPluginId(pluginId);
      setCurrentProfileId(null);
      loadPluginUI(pluginId);
      return;
    }

    if (actionId === 'LoadProfile') {
      const { profileId, pluginId } = payload;
      setCurrentPluginId(pluginId);
      setCurrentProfileId(profileId);
      const profile = profilesRef.current.find(p => p.id === profileId);
      loadPluginUI(pluginId, profile?.data);
      return;
    }

    if (actionId === 'LoadPlugin') {
      const pluginId = payload?.plugin;
      setCurrentPluginId(pluginId);
      setCurrentProfileId(null);
      loadPluginUI(pluginId);
      return;
    }

    if (actionId === 'UpsertProfile') {
      const pluginId = currentPluginIdRef.current || payload?.pluginId || payload?.type;
      if (!pluginId) {
        setToastMessage({ message: 'No plugin selected', type: 'error' });
        return;
      }
      
      const currentState = stateRef.current;
      const profileName = currentState?.profileName || 'Unnamed Profile';
      const currentProfileId = currentProfileIdRef.current;
      
      try {
        if (currentProfileId) {
          await fetch(`/api/profiles/${currentProfileId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: profileName, data: currentState })
          });
          setProfiles(prev => prev.map(p => p.id === currentProfileId ? { ...p, name: profileName, data: currentState } : p));
          setToastMessage({ message: `Profile '${profileName}' updated`, type: 'success' });
        } else {
          const newId = Math.random().toString(36).substr(2, 9);
          await fetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: newId, pluginId, name: profileName, data: currentState })
          });
          setProfiles(prev => [...prev, { id: newId, pluginId, name: profileName, data: currentState }]);
          setCurrentProfileId(newId);
          if (!currentPluginIdRef.current) {
            setCurrentPluginId(pluginId);
          }
          setToastMessage({ message: `Profile '${profileName}' created`, type: 'success' });
        }
      } catch (err) {
        console.error('Failed to save profile:', err);
        setToastMessage({ message: 'Failed to save profile', type: 'error' });
      }
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (actionId === 'DeleteProfile') {
      const { profileId } = payload;
      try {
        await fetch(`/api/profiles/${profileId}`, {
          method: 'DELETE'
        });
        setProfiles(prev => prev.filter(p => p.id !== profileId));
        if (currentProfileIdRef.current === profileId) {
          setCurrentProfileId(null);
          const currentState = getSnapshot ? getSnapshot() : stateRef.current;
          if (update) {
            const updates: any = {};
            Object.keys(currentState).forEach(key => {
              updates[key] = '';
            });
            update(updates);
          } else {
            Object.keys(currentState).forEach(key => {
              set(key, '');
            });
          }
        }
        setToastMessage({ message: `Profile deleted`, type: 'success' });
      } catch (err) {
        console.error('Failed to delete profile:', err);
        setToastMessage({ message: 'Failed to delete profile', type: 'error' });
      }
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const isAllowed = catalogJson.allowedActions.some(a => a.id === actionId);
    if (!isAllowed) {
      setToastMessage({ message: `Action ${actionId} is not defined in catalog.`, type: 'error' });
      return;
    }

    setToastMessage({ message: `Executed: ${actionId}`, type: 'success' });
    setTimeout(() => setToastMessage(null), 3000);
  };

  return {
    profiles,
    currentProfileId,
    currentPluginId,
    handleAction
  };
}
