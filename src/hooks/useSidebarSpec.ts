import { useMemo } from 'react';
import spec from '../spec.json';

export function useSidebarSpec(
  profiles: Array<{ id: string, pluginId: string, name: string, data: any }>,
  currentPluginId: string | null,
  currentProfileId: string | null
) {
  return useMemo(() => {
    const elements: any = {
      'sidebar-root': {
        type: 'Column',
        props: { gap: 4, className: 'p-4' },
        children: spec.pluginDescriptors.map(p => `plugin-section-${p.id}`)
      }
    };
    
    spec.pluginDescriptors.forEach(p => {
      const pluginProfiles = profiles.filter(prof => prof.pluginId === p.id);
      
      pluginProfiles.forEach(prof => {
        elements[`profile-row-${prof.id}`] = {
          type: 'Row',
          props: { justify: 'between', align: 'center', className: 'w-full group' },
          children: [`profile-${prof.id}`, `delete-${prof.id}`]
        };
        
        elements[`profile-${prof.id}`] = {
          type: 'Button',
          props: {
            label: prof.name || 'Unnamed Profile',
            variant: currentProfileId === prof.id ? 'secondary' : 'ghost',
            justify: 'start',
            action: 'LoadProfile',
            payload: { profileId: prof.id, pluginId: p.id },
            className: 'flex-1 text-left truncate text-sm'
          }
        };

        elements[`delete-${prof.id}`] = {
          type: 'Button',
          props: {
            label: '✕',
            variant: 'ghost',
            action: 'DeleteProfile',
            payload: { profileId: prof.id },
            className: 'opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 px-2'
          }
        };
      });
      
      elements[`plugin-section-${p.id}`] = {
        type: 'Column',
        props: { gap: 1 },
        children: [
          `plugin-header-${p.id}`,
          ...pluginProfiles.map(prof => `profile-row-${prof.id}`),
          `add-new-${p.id}`
        ]
      };
      
      elements[`plugin-header-${p.id}`] = {
        type: 'Text',
        props: { content: p.displayName || p.id, variant: 'small', className: 'font-bold text-slate-500 uppercase tracking-wider mb-2' }
      };
      
      elements[`add-new-${p.id}`] = {
        type: 'Button',
        props: {
          label: '+ Add New Profile',
          variant: (currentPluginId === p.id && !currentProfileId) ? 'secondary' : 'ghost',
          justify: 'start',
          action: 'CreateProfile',
          payload: { pluginId: p.id },
          className: 'w-full text-left truncate text-sm text-indigo-600'
        }
      };
    });

    return {
      root: 'sidebar-root',
      elements
    };
  }, [profiles, currentPluginId, currentProfileId]);
}
