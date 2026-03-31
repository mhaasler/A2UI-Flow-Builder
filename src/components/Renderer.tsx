import React from 'react';
import { A2UIComponent } from '../types';
import * as Layout from './A2UI/Layout';
import * as TextDisplay from './A2UI/TextDisplay';
import * as Inputs from './A2UI/Inputs';
import * as Collections from './A2UI/Collections';
import * as Flow from './A2UI/Flow';
import * as Actions from './A2UI/Actions';

const componentMap: Record<string, React.FC<any>> = {
  'Column': Layout.Column,
  'Row': Layout.Row,
  'Card': Layout.Card,
  'Divider': Layout.Divider,
  'Spacer': Layout.Spacer,
  'Text': TextDisplay.Text,
  'Code': TextDisplay.Code,
  'Badge': TextDisplay.Badge,
  'TextField': Inputs.TextField,
  'NumberField': Inputs.NumberField,
  'Select': Inputs.Select,
  'Checkbox': Inputs.Checkbox,
  'Table': Collections.Table,
  'TagList': Collections.TagList,
  'Wizard': Flow.Wizard,
  'Tabs': Flow.Tabs,
  'Button': Actions.Button,
  'Form': Actions.Form,
  'Toast': Actions.Toast,
};

interface RendererProps {
  componentId: string;
  componentsMap: Map<string, A2UIComponent>;
  onAction?: (actionId: string, payload?: any) => void;
}

export const Renderer: React.FC<RendererProps> = ({ componentId, componentsMap, onAction }) => {
  const comp = componentsMap.get(componentId);

  if (!comp) {
    return null;
  }

  const Component = componentMap[comp.component];

  if (!Component) {
    return (
      <div className="p-4 border border-red-500 bg-red-50 text-red-700 rounded-md">
        <strong>Error:</strong> Unknown component type <code>{comp.component}</code>
      </div>
    );
  }

  const { id, component, child, children, ...props } = comp;

  let childElements: React.ReactNode = null;
  if (child) {
    childElements = <Renderer key={child} componentId={child} componentsMap={componentsMap} onAction={onAction} />;
  } else if (children && Array.isArray(children)) {
    childElements = children.map(cId => (
      <Renderer key={cId} componentId={cId} componentsMap={componentsMap} onAction={onAction} />
    ));
  }

  return <Component {...props} onAction={onAction}>{childElements}</Component>;
};
