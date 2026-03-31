export interface A2UIComponent {
  id: string;
  component: string;
  child?: string;
  children?: string[];
  [key: string]: any;
}

export interface A2UIMessage {
  version: "v0.9";
  updateComponents?: {
    surfaceId: string;
    components: A2UIComponent[];
  };
}
