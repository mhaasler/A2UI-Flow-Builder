import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react';
import { z } from 'zod';

export const componentNames = [
  'Column', 'Row', 'Card', 'Text', 'TextField', 'NumberField', 'StringArrayField', 'Select', 'Checkbox',
  'Button', 'Form', 'Badge', 'Code', 'Divider', 'Spacer', 'Table', 'TagList', 'Tabs', 'Wizard', 'Icon'
];

export const catalog = defineCatalog(schema, {
  components: {
    Icon: {
      props: z.object({
        name: z.string(),
        size: z.number().optional(),
        className: z.string().optional(),
      }),
    },
    Column: {
      props: z.object({
        gap: z.number().optional(),
        className: z.string().optional(),
      }),
      slots: ['children'],
    },
    Row: {
      props: z.object({
        gap: z.number().optional(),
        align: z.enum(['start', 'center', 'end']).optional(),
        justify: z.enum(['start', 'center', 'end', 'between']).optional(),
        wrap: z.boolean().optional(),
        className: z.string().optional(),
      }),
      slots: ['children'],
    },
    Card: {
      props: z.object({
        padding: z.number().optional(),
        className: z.string().optional(),
      }),
      slots: ['children'],
    },
    Text: {
      props: z.object({
        content: z.string().optional(),
        variant: z.enum(['h1', 'h2', 'h3', 'body', 'small']).optional(),
        className: z.string().optional(),
      }),
      slots: ['children'],
    },
    TextField: {
      props: z.object({
        name: z.string().optional(),
        label: z.string().optional(),
        placeholder: z.string().optional(),
        value: z.string().optional(),
        isSecret: z.boolean().optional(),
        className: z.string().optional(),
      }),
    },
    NumberField: {
      props: z.object({
        name: z.string().optional(),
        label: z.string().optional(),
        placeholder: z.string().optional(),
        value: z.number().optional(),
        className: z.string().optional(),
      }),
    },
    StringArrayField: {
      props: z.object({
        name: z.string().optional(),
        label: z.string().optional(),
        placeholder: z.string().optional(),
        value: z.array(z.string()).optional(),
        className: z.string().optional(),
      }),
    },
    Select: {
      props: z.object({
        name: z.string().optional(),
        label: z.string().optional(),
        options: z.array(z.object({
          label: z.string(),
          value: z.string(),
        })).optional(),
        value: z.string().optional(),
        className: z.string().optional(),
      }),
    },
    Checkbox: {
      props: z.object({
        name: z.string().optional(),
        label: z.string().optional(),
        checked: z.boolean().optional(),
        className: z.string().optional(),
      }),
    },
    Button: {
      props: z.object({
        label: z.string(),
        variant: z.enum(['primary', 'secondary', 'danger', 'ghost']).optional(),
        justify: z.enum(['start', 'center', 'end']).optional(),
        className: z.string().optional(),
        action: z.string().optional(),
        payload: z.any().optional(),
      }),
    },
    Form: {
      props: z.object({
        onSubmitAction: z.string().optional(),
        className: z.string().optional(),
      }),
      slots: ['children'],
    },
    Badge: {
      props: z.object({
        content: z.string(),
        color: z.enum(['slate', 'blue', 'green', 'red', 'yellow']).optional(),
        className: z.string().optional(),
      }),
    },
    Code: {
      props: z.object({
        content: z.string(),
        className: z.string().optional(),
      }),
    },
    Divider: {
      props: z.object({
        className: z.string().optional(),
      }),
    },
    Spacer: {
      props: z.object({
        size: z.number().optional(),
        horizontal: z.boolean().optional(),
      }),
    },
    Table: {
      props: z.object({
        columns: z.array(z.object({
          header: z.string(),
          accessor: z.string(),
        })).optional(),
        data: z.array(z.any()).optional(),
        className: z.string().optional(),
      }),
    },
    TagList: {
      props: z.object({
        tags: z.array(z.string()).optional(),
        className: z.string().optional(),
      }),
    },
    Tabs: {
      props: z.object({
        tabs: z.array(z.string()).optional(),
        className: z.string().optional(),
      }),
      slots: ['children'],
    },
    Wizard: {
      props: z.object({
        steps: z.array(z.string()).optional(),
        className: z.string().optional(),
      }),
      slots: ['children'],
    },
  },
  actions: {
    ExportSchemaBundle: { params: z.any() },
    LoadProject: { params: z.any() },
    SaveProject: { params: z.any() },
    ValidateConfig: { params: z.any() },
    ListProfiles: { params: z.any() },
    UpsertProfile: { params: z.any() },
    DeleteProfile: { params: z.any() },
    CreateProfile: { params: z.any() },
    LoadProfile: { params: z.any() },
    EncryptCredentials: { params: z.any() },
    LoadPlugin: { params: z.any() },
    dummy: { params: z.object({}) },
  },
});
