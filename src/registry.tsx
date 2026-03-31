import React from 'react';
import { defineRegistry, useActions } from '@json-render/react';
import { catalog } from './catalog';
import { Column, Row, Card, Divider, Spacer } from './components/A2UI/Layout';
import { TextField, NumberField, StringArrayField, Select, Checkbox, TextAreaField } from './components/A2UI/Inputs';
import { Button, Form } from './components/A2UI/Actions';
import { Text, Code, Badge } from './components/A2UI/TextDisplay';
import { Table, TagList } from './components/A2UI/Collections';
import { Wizard, Tabs } from './components/A2UI/Flow';
import * as LucideIcons from 'lucide-react';

export const createRegistry = (onAction: (actionId: string, params?: any) => void) => {
  console.log('Creating Registry with onAction handler');
  
  const components = {
    Icon: ({ props }: any) => {
      if (!props) return null;
      const { name, size = 20, className = '' } = props;
      if (!name) return null;
      
      const pascalName = name
        .split(/[-_]/)
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      
      const LucideIcon = (LucideIcons as any)[pascalName] || (LucideIcons as any)[name] || (LucideIcons as any).HelpCircle;
      if (!LucideIcon) {
        return <div className={`inline-block bg-slate-100 rounded ${className}`} style={{ width: size, height: size }} />;
      }
      return <LucideIcon size={size} className={className} />;
    },
    Column: ({ props, slots }: any) => <Column {...props}>{slots.children}</Column>,
    Row: ({ props, slots }: any) => <Row {...props}>{slots.children}</Row>,
    Card: ({ props, slots }: any) => <Card {...props}>{slots.children}</Card>,
    Text: ({ props, slots }: any) => <Text {...props}>{slots.children}</Text>,
    TextField: ({ props }: any) => <TextField {...props} />,
    TextAreaField: ({ props }: any) => <TextAreaField {...props} />,
    NumberField: ({ props }: any) => <NumberField {...props} />,
    StringArrayField: ({ props }: any) => <StringArrayField {...props} />,
    Select: ({ props }: any) => <Select {...props} />,
    Checkbox: ({ props }: any) => <Checkbox {...props} />,
    Button: ({ props }: any) => {
      const { execute } = useActions();
      return (
        <Button
          {...props}
          onAction={(action: string, params: any) => execute({ action, params })}
        />
      );
    },
    Form: ({ props, slots }: any) => {
      const { execute } = useActions();
      return (
        <Form
          {...props}
          onAction={(action: string, params: any) => execute({ action, params })}
        >
          {slots.children}
        </Form>
      );
    },
    Badge: ({ props }: any) => <Badge {...props} />,
    Code: ({ props }: any) => <Code {...props} />,
    Divider: ({ props }: any) => <Divider {...props} />,
    Spacer: ({ props }: any) => <Spacer {...props} />,
    Table: ({ props }: any) => <Table {...props} />,
    TagList: ({ props }: any) => <TagList {...props} />,
    Tabs: ({ props, slots }: any) => <Tabs {...props}>{slots.children}</Tabs>,
    Wizard: ({ props, slots }: any) => <Wizard {...props}>{slots.children}</Wizard>,
  };

  const actions = {
    ExportSchemaBundle: async (params: any) => onAction('ExportSchemaBundle', params),
    LoadProject: async (params: any) => onAction('LoadProject', params),
    SaveProject: async (params: any) => onAction('SaveProject', params),
    ValidateConfig: async (params: any) => onAction('ValidateConfig', params),
    ListProfiles: async (params: any) => onAction('ListProfiles', params),
    UpsertProfile: async (params: any) => onAction('UpsertProfile', params),
    DeleteProfile: async (params: any) => onAction('DeleteProfile', params),
    CreateProfile: async (params: any) => onAction('CreateProfile', params),
    LoadProfile: async (params: any) => onAction('LoadProfile', params),
    EncryptCredentials: async (params: any) => onAction('EncryptCredentials', params),
    LoadPlugin: async (params: any) => onAction('LoadPlugin', params),
  };

  return { components, actions };
};
