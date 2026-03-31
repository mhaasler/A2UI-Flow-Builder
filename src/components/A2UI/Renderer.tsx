import React from 'react';
import { useActions } from '@json-render/react';

interface UIElement {
  type: string;
  props?: any;
  children?: string[];
}

interface UISpec {
  root: string;
  elements: Record<string, UIElement>;
}

interface RendererProps {
  spec: UISpec;
  registry: any;
}

const ElementRenderer: React.FC<{ elementId: string; spec: UISpec; registry: any }> = ({ elementId, spec, registry }) => {
  const element = spec.elements[elementId];
  if (!element) {
    return <div className="p-2 text-red-500 text-xs border border-red-200 bg-red-50">Missing ID: {elementId}</div>;
  }

  // Handle both direct access and registry methods
  const Component = registry.components?.[element.type] || 
                    registry[element.type] ||
                    (registry.getComponent && registry.getComponent(element.type)) ||
                    (registry.config?.components?.[element.type]);

  if (!Component) {
    console.error(`Unknown Component: ${element.type}`, { registry, element });
    return (
      <div className="p-3 text-amber-700 text-xs border border-amber-200 bg-amber-50 rounded-md mb-2">
        <div className="font-bold mb-1 flex items-center gap-2">
          <span className="bg-amber-200 px-1.5 py-0.5 rounded text-[10px]">UNKNOWN</span>
          {element.type}
        </div>
        <div className="opacity-70 italic">Component not found in registry.</div>
      </div>
    );
  }

  const slots: Record<string, React.ReactNode> = {};
  if (element.children && element.children.length > 0) {
    slots.children = element.children.map(childId => (
      <ElementRenderer key={childId} elementId={childId} spec={spec} registry={registry} />
    ));
  }

  try {
    return (
      <div className="element-wrapper" data-type={element.type} data-id={elementId}>
        <Component props={element.props || {}} slots={slots} />
      </div>
    );
  } catch (err: any) {
    console.error(`Render Error in ${element.type}:`, err);
    return (
      <div className="p-3 text-red-700 text-xs border border-red-200 bg-red-50 rounded-md mb-2">
        <div className="font-bold mb-1 flex items-center gap-2">
          <span className="bg-red-200 px-1.5 py-0.5 rounded text-[10px]">ERROR</span>
          {element.type}
        </div>
        <div className="opacity-70">{err.message || 'Error rendering component'}</div>
      </div>
    );
  }
};

export const Renderer: React.FC<RendererProps> = ({ spec, registry }) => {
  if (!spec || !spec.root || !spec.elements) {
    return <div className="p-4 text-slate-400 italic">Invalid UI Specification</div>;
  }

  return (
    <div className="json-render-root">
      <ElementRenderer elementId={spec.root} spec={spec} registry={registry} />
    </div>
  );
};
