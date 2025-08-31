# AgentOwnOroasis

# 🧑‍💻 VS Code AI Chat Extension  

A **Visual Studio Code extension** that integrates an AI-powered chat with **Ollama models**, using **Angular 20** in a WebView as the UI.  
It includes **context persistence**, **state management with NgRx-Signals**, **workspace file selection**, and supports both **ollama.generate** and **ollama.chat** flows.  

---

## ✨ Features  

| Feature | Description |
|---------|-------------|
| ✅ Angular 20 UI | Chat interface built with Angular and **NgRx-Signals** for reactive state. |
| ✅ VS Code WebView | Loads the Angular app inside VS Code. |
| ✅ Ollama Integration | Host connects with Ollama via `generate` (fast + context) and `chat` (agents/tools). |
| ✅ Context Persistence | Memento Workspaces vscode, stores conversation history and context. |
| ✅ Streaming Responses | Word-by-word streaming from host to WebView. |
| ✅ Multi-model Support | Example: **llama3** for coding, **llava** for vision. |
| ✅ File Mentions | Autocomplete files with `@filename` from workspace. |
| ✅ Animated Dropdown | Smooth animations when suggesting files. |
| ✅ Context ↔ Messages | Switch between `generate` and `chat` flows seamlessly. |

---

## 📂 Architecture  

### **Host (VS Code Extension - Backend)**  
- **Language:** TypeScript  
- **Responsibilities:**  
  - Communicate with Ollama (`generate`, `chat`)  
  - Manage context and migrate from messages  
  - Persist chat and context in **vscode.Memento**  
  - Provide APIs to WebView (`getModels`, `listFiles`, `sendChat`, etc.)  

### **WebView (Frontend - Angular)**  
- **Language:** Angular 20 + NgRx-Signals  
- **Responsibilities:**  
  - Render chat interface  
  - Manage messages and loading state  
  - Autocomplete files with `@` mentions  
  - Animate dropdown for file selection  
  - Send messages to host via `VscodeService`  

---

## 🔑 Chat Flow  

1. User writes a message in the WebView.  
2. Mentions (`@file`) are extracted → `ChatStore` resolves files.  
3. Message is sent to Host →  
   - **Normal mode:** `ollama.generate` with context  
   - **Agent/tools mode:** `ollama.chat` with messages  
4. Host streams partial responses back to WebView.  
5. WebView updates the last assistant message in real time.  
6. Context is saved in vscode.Memento.  

---

## 📦 Main Dependencies  

### **Host**  
- `ollama` (Node.js client)  
- `better-sqlite3` (fast SQLite persistence)  
- `vscode` (VS Code API)  

### **WebView**  
- `@angular/core` (v20)  
- `@ngrx/signals` (state management)  
- `@angular/material` (styling)  
- `@angular/material` (animations)  

---

## 🗂️ Global State (ChatStore)  

```ts
type ChatState = {
  isLoading: boolean;
  error?: string;
  models?: IListModelsResponse;
  messages: IMessage[];
  preferredModel?: string;
  files: string[];
  typeMessage: 'Ask' | 'Edit' | 'Agent';
  currentModel: string;
  context?: number[]
}
```
