# AgentOwnOrasis

## 🧑‍💻 VS Code AI Chat Extension

AgentOwnOrasis is a **Visual Studio Code extension** that integrates an AI-powered chat using **Ollama models**. The user interface is built with **Angular 20** and leverages **NgRx-Signals** for state management. This project is designed to enhance the development experience by providing advanced tools for code generation, context persistence, and support for multiple AI models.

---

## ✨ Current Features

| Feature | Description |
|---------|-------------|
| **Angular 20 UI** | Provides a modern and reactive chat interface built with Angular. It ensures smooth user interactions and integrates seamlessly with the VS Code WebView. |
| **VS Code WebView** | Loads the Angular application inside VS Code, enabling a rich and interactive user experience. |
| **Ollama Integration** | Supports two main flows: `ollama.generate` for fast context-based generation and `ollama.chat` for agent-based interactions with tools. |
| **Context Persistence** | Stores conversation history and context using `vscode.Memento`, allowing users to resume their sessions without losing data. |
| **Streaming Responses** | Delivers word-by-word responses from the host to the WebView, providing real-time feedback to the user. |
| **Multi-model Support** | Allows users to switch between different AI models, such as **llama3** for coding tasks and **llava** for vision-related tasks. |
| **File Mentions** | Enables autocompletion of workspace files using `@filename`, making it easier to reference files in conversations. |
| **Animations** | Includes animated dropdowns for file suggestions, enhancing the visual appeal and usability of the interface. |
| **Chat Flow** | Allows seamless switching between `generate` and `chat` flows, adapting to the user's needs dynamically. |

---

## 📂 Architecture

### **Host (VS Code Extension - Backend)**
- **Language:** TypeScript
- **Responsibilities:**
  - Communicate with Ollama (`generate`, `chat`).
  - Manage context and migrate messages.
  - Persist chat and context in **vscode.Memento**.
  - Provide APIs to the WebView (`getModels`, `listFiles`, `sendChat`, etc.).

### **WebView (Frontend - Angular)**
- **Language:** Angular 20 + NgRx-Signals
- **Responsibilities:**
  - Render the chat interface.
  - Manage messages and loading state.
  - Autocomplete files with `@` mentions.
  - Animate dropdown for file selection.
  - Send messages to the host via `VscodeService`.

---

## 🔑 Chat Flow

1. The user writes a message in the WebView.
2. Mentions (`@file`) are extracted, and files are resolved.
3. The message is sent to the host:
   - **Normal Mode:** `ollama.generate` with context.
   - **Agent/Tools Mode:** `ollama.chat` with messages.
4. The host streams partial responses back to the WebView.
5. The WebView updates the last assistant message in real time.
6. The context is saved in `vscode.Memento`.

---

## 📦 Main Dependencies

### **Host**
- `ollama` (Node.js client): Facilitates communication with Ollama models.
- `better-sqlite3` (Fast SQLite persistence): Ensures efficient storage and retrieval of data.
- `vscode` (VS Code API): Provides the necessary APIs for extension development.

### **WebView**
- `@angular/core` (v20): Core framework for building the WebView interface.
- `@ngrx/signals` (State management): Manages the state of the WebView application.
- `@angular/material` (Styling and animations): Adds styling and animations to the WebView.

---

## 🚀 Proposed New Features

| Proposal | Description |
|----------|-------------|
| **Support for More AI Providers** | Integrate providers like OpenAI, Anthropic, or Google Bard to expand the extension's capabilities. |
| **Code Analysis** | Add tools to analyze and optimize code in real time, providing suggestions for improvements. |
| **Real-Time Collaboration** | Enable multiple users to collaborate in a single chat session, synchronizing context and messages. |
| **Plugin Support** | Allow users to develop and integrate their own plugins for customized workflows. |
| **User Experience Improvements** | Introduce custom themes and real-time notifications for better usability. |
| **Git Integration** | Display recent repository changes and generate messages based on commit history. |
| **Data Visualization Support** | Integrate charts and tables to visualize AI-generated data. |

---

## 📋 Project Status

| Task | Status | Description |
|------|--------|-------------|
| **Ollama Integration** | ✅ Completed | Fully integrated with `ollama.generate` and `ollama.chat` flows. |
| **Context Persistence** | ✅ Completed | Stores and retrieves conversation history seamlessly. |
| **Streaming Responses** | ✅ Completed | Provides real-time feedback to the user. |
| **Multi-model Support** | ✅ Completed | Supports switching between different AI models. |
| **File Mentions** | ✅ Completed | Enables easy referencing of workspace files. |
| **Dropdown Animations** | ✅ Completed | Adds smooth animations for file suggestions. |
| **Support for More AI Providers** | ⬜ Pending | Expand compatibility to include additional AI providers. |
| **Code Analysis** | ⬜ Pending | Tools for real-time code analysis and optimization. |
| **Real-Time Collaboration** | ⬜ Pending | Synchronize chat sessions across multiple users. |
| **Plugin Support** | ⬜ Pending | Allow integration of user-developed plugins. |
| **User Experience Improvements** | ⬜ Pending | Enhance usability with themes and notifications. |
| **Git Integration** | ⬜ Pending | Display repository changes and commit history. |
| **Data Visualization** | ⬜ Pending | Add support for visualizing AI-generated data. |

---

## 🛠️ Backend Core Functionalities

The `oroasis/src/core` folder contains the main backend functionalities of the project. Below is a detailed breakdown of its subfolders and their purposes:

### `adapters/`
Handles communication with external AI providers. Each adapter is responsible for interfacing with a specific provider:
- **`anthropic.adapter.ts`**: Adapter for Anthropic AI.
- **`google.adapter.ts`**: Adapter for Google AI.
- **`ollama.adapters.ts`**: Adapter for Ollama models.
- **`openai.adapter.ts`**: Adapter for OpenAI.

### `commands/`
Defines commands that the extension can execute. These commands are the entry points for various user actions:
- **`agent.commands.ts`**: Commands related to agent interactions.
- **`comment.commands.ts`**: Commands for managing comments.
- **`config.commands.ts`**: Commands for configuration settings.
- **`examples.commands.ts`**: Commands for providing examples.
- **`headers.commands.ts`**: Commands for managing headers.
- **`webview.commands.chat.ts`**: Commands specific to the chat WebView.
- **`webview.commands.ts`**: General WebView commands.
- **`webview.workspace.commands.ts`**: Commands for workspace-related operations.

### `controllers/`
Manages high-level logic and orchestrates operations between different components:
- **`comment.controller.ts`**: Handles operations related to comments.
- **`workspace.controller.ts`**: Manages workspace-related logic.

### `factories/`
Implements factory patterns for creating objects:
- **`repository-factory.ts`**: Factory for creating repository instances.

### `handlers/`
Handles specific tasks and events. These are the core processing units:
- **`chat.handler.ts`**: Handles chat-related operations.
- **`config.handler.ts`**: Manages configuration settings.
- **`registers.handler.ts`**: Handles registration of components.
- **`workspace.handler.ts`**: Manages workspace-related tasks.

### `interfaces/`
Defines TypeScript interfaces for type safety and consistency:
- **`global-workspace-repository-state.interface.service.ts`**: Interface for global workspace repository state.
- **`preview-diff.interface.service.ts`**: Interface for previewing differences.
- **`provider.interface.service.ts`**: Interface for AI providers.
- **`repository-factory.interface.service.ts`**: Interface for repository factories.
- **`workspace-repository-files.interface.service.ts`**: Interface for workspace repository files.
- **`workspace-repository-state.interface.service.ts`**: Interface for workspace repository state.

### `services/`
Provides reusable services that encapsulate specific functionalities:
- **`global-repository.service.ts`**: Service for managing global repositories.
- **`http.service.ts`**: Service for making HTTP requests.
- **`identifier.service.ts`**: Service for generating unique identifiers.
- **`preview-diff.service.ts`**: Service for previewing differences.
- **`provider.factory.service.ts`**: Service for creating AI providers.
- **`workspace-repository-files.service.ts`**: Service for managing workspace repository files.
- **`workspace-repository.service.ts`**: Service for managing workspace repositories.

### `webview/`
Manages WebView-related logic and utilities:
- **`webview.listener.ts`**: Listens for events from the WebView.
- **`webview.register.ts`**: Registers WebView components.
- **`webviewhtml.builder.ts`**: Builds the HTML structure for the WebView.

---

## 🌐 Providers Functionalities

The `oroasis/src/providers` folder contains logic specific to various features and integrations. Below is a breakdown of its subfolders:

### `codeactions/`
- Contains logic for implementing code actions, such as quick fixes and refactoring suggestions.

### `comments/`
- Manages functionality related to comments, including adding, editing, and resolving comments in the workspace.

### `completions/`
- Handles code completion features, providing intelligent suggestions based on the context.

### `webview/`
- Contains provider-specific logic for WebView interactions, ensuring seamless communication between the backend and the WebView.

---

## 🔗 Shared Utilities and Configurations

The `oroasis/src/shared` folder contains reusable utilities, configurations, and generic components that are shared across the project. Below is a breakdown of its subfolders:

### `collections/`
- Contains collections of reusable data structures and configurations used throughout the project.

### `configurations/`
- Stores configuration files and settings that define the behavior of various components.

### `enums/`
- Defines enumerations used for maintaining consistent values across the project.

### `generics/`
- Implements generic utilities and components that can be reused in multiple contexts.

### `utils/`
- Provides utility functions for common tasks, such as data manipulation, formatting, and validation.

---

## 🎯 Final Objective

Transform AgentOwnOrasis into a robust and user-friendly VS Code extension that rivals `vscode-copilot-chat` in functionality and usability, including advanced chat features, real-time code generation, and seamless integration with multiple AI providers.
