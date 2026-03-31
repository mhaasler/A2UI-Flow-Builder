# A2UI (Agent-to-UI) Architecture & Specification

> **TARGET AUDIENCE:** Human Developers AND AI Coding Agents.
> **AI AGENT DIRECTIVE:** Read this document carefully before modifying, debugging, or extending the A2UI system. It contains critical architectural constraints and strict rules for code generation.

---

## 1. Core Philosophy & Architecture

A2UI is a framework designed specifically for Large Language Models (LLMs) to generate and render User Interfaces dynamically and progressively.

*   **UI as Data (Server-Driven UI):** The entire UI is described as a pure JSON object. There is no hardcoded JSX for dynamic forms or dashboards.
*   **AI-Native Flat Structure:** Instead of deeply nested JSON trees (which cause LLMs to hallucinate closing brackets and fail at progressive rendering), A2UI uses a **flat adjacency list**.
*   **Progressive Rendering (Streaming):** UIs are not loaded as a monolithic block. They are built incrementally via a JSONL (JSON Lines) stream.
*   **Separation of Concerns:** Strict separation between UI representation (JSON), State management, and Business Logic (Actions) using `@json-render/react`.

---

## 2. The A2UI Data Model (JSON Spec)

### Strict TypeScript Interfaces
AI Agents must adhere to this structure when generating or parsing A2UI specs:

```typescript
interface A2UISpec {
  root: string; // ID of the root element
  elements: Record<string, A2UIElement>; // Flat dictionary of all components
}

interface A2UIElement {
  type: string; // Must match a registered component in registry.tsx
  props?: Record<string, any>; // Component-specific properties
  children?: string[]; // Array of IDs referencing other elements in the dictionary
}
```

### Example (Valid A2UI Spec)
```json
{
  "root": "main-container",
  "elements": {
    "main-container": {
      "type": "Column",
      "props": { "gap": 4 },
      "children": ["title", "submit-btn"]
    },
    "title": {
      "type": "Text",
      "props": { "content": "Hello World", "variant": "h1" }
    },
    "submit-btn": {
      "type": "Button",
      "props": { "label": "Save", "action": "SaveData" }
    }
  }
}
```

---

## 3. Streaming Protocol (JSONL)

To eliminate waiting times, the AI streams the UI specification line by line. Each line MUST be a standalone, valid JSON object.

### Message Types

**1. `createSurface` (MUST BE FIRST)**
Initializes the canvas and defines the entry point.
```json
{"type": "createSurface", "root": "main-container"}
```

**2. `updateComponents` (CAN BE MULTIPLE)**
Adds new components to the `elements` map or updates existing ones.
```json
{"type": "updateComponents", "components": { "main-container": { "type": "Column", "children": ["title"] } }}
{"type": "updateComponents", "components": { "title": { "type": "Text", "props": { "content": "Hello World" } } }}
```

---

## 4. State & Action Management (`@json-render/react`)

State and logic are completely decoupled from the JSON UI.

*   **State (`useStateStore`):** A global Key-Value store. UI components (like `TextField`) bind automatically to this store via their `name` prop (e.g., `name: "email"` updates `state.email`).
*   **Actions (`useActions`):** UI components trigger events via strings (e.g., `action: "SaveProfile"`). The application catches these in a central dispatcher (`handleAction` in `useAppActions.ts`).
*   **Registry (`registry.tsx`):** Maps JSON `type` strings (e.g., `"Button"`) to actual React components.

---

## 5. SOLID React Architecture

When extending the codebase, AI Agents MUST follow the Single Responsibility Principle (SRP).

### Directory Structure
```text
src/
├── components/          # Dumb, pure UI components (Tailwind, Lucide)
│   ├── A2UI/            # Components registered in the Registry
│   └── ...
├── hooks/               # Business logic and API communication
│   ├── useAIGeneration.ts # Encapsulates Gemini API, Streaming & JSONL Parsing
│   ├── useAppActions.ts   # Encapsulates the Action Dispatcher and API calls
│   └── useSidebarSpec.ts  # Generates dynamic UI specs from data
├── registry.tsx         # Maps strings ("Button") to React components
├── catalog.json         # Defines allowed components and actions for the AI
└── App.tsx              # Pure Orchestrator (connects Hooks with UI)
```

---

## 6. CRITICAL CONSTRAINTS FOR AI AGENTS

When generating code, modifying the system, or writing prompts for the UI-generating LLM, you MUST follow these rules:

### Anti-Patterns (DO NOT DO THIS)
*   ❌ **DO NOT** use deeply nested JSON trees for the UI spec. Always use the flat `elements` dictionary.
*   ❌ **DO NOT** put business logic inside UI components. Use the `action` prop and handle it in `useAppActions.ts`.
*   ❌ **DO NOT** output markdown code blocks (e.g., \`\`\`json) when streaming A2UI JSONL. It breaks the parser.
*   ❌ **DO NOT** put massive logic blocks in `App.tsx`. Extract them into custom hooks.

### How to Extend the System
1.  **Adding a new UI Component:**
    *   Create the React component in `src/components/A2UI/`.
    *   Register it in `src/registry.tsx`.
    *   Add its name to `componentNames` in `src/catalog.ts`.
2.  **Adding a new Action:**
    *   Add the logic to the `handleAction` function in `src/hooks/useAppActions.ts`.
    *   Register the action string in `src/catalog.json` under `allowedActions`.
3.  **Updating the AI Prompt:**
    *   Modify `systemInstruction` in `src/hooks/useAIGeneration.ts`. Ensure you maintain the strict JSONL formatting rules.
