# CoLearn - Collaborative Learning Platform

[View Live Demo](https://colearn-ecru.vercel.app/)

CoLearn was built as a central space for students to study together more effectively. It brings real-time chat, file sharing, and AI study tools into one workspace so teams can focus on learning without having to jump between different apps.

## Features

### Shared Workspace
The workspace is where the actual collaboration happens. It has a real-time chat that supports image pasting and file uploads, along with a way to keep track of active members and access files shared in the session.

### User Dashboard
The dashboard gives you a quick look at your active groups and recent activity. It’s designed to be simple to navigate, making it easy to hop back into a study session or start a new one.

### AI Settings
You can customize which AI models you use in your workspace, such as Groq and Mistral AI. The profile settings let you securely manage your API keys and choose the best tools for your study needs.

### Design
The platform works across different devices and includes both dark and light modes. The interface is kept clean with smooth transitions to help keep the focus on the work.

## Infrastructure and Backend

CoLearn uses a distributed architecture to handle real-time collaboration and secure data management across different services.

### Supabase Integration
The core application state and user data are managed through the Supabase ecosystem.
*   **Database and Auth**: PostgreSQL handles the primary data storage for profiles, groups, and session history, while Supabase Auth handles secure user registration and login.
*   **Edge Functions**: We utilize Supabase Edge Functions for server-side processing, specifically for the AI assistant. These functions securely handle API requests to AI providers like Groq and Mistral, keeping sensitive keys off the client side.
*   **Real-time and Storage**: User presence and chat updates are managed via Supabase’s real-time engine. Shared files and images uploaded during sessions are hosted securely on Supabase Storage.

### Collaborative Coding Server
The real-time code editor is supported by a dedicated Node.js backend deployed on Render.
*   **Socket.io & Synchronization**: A WebSocket-based architecture ensures that code changes and cursor movements are synced instantly. The server uses Operational Transformation (OT) to resolve conflicts when multiple users edit the same line of code.
*   **Execution Environment**: The backend provides a sandboxed environment to execute code in various languages, returning output directly to the participants in the session.

## Tech Stack

*   Frontend: React (Vite)
*   Primary Backend: Supabase (Auth, DB, Edge Functions, Storage)
*   Collaboration Server: Node.js (Socket.io, Express)
*   Icons: Lucide React
*   Styling: Custom CSS
*   Deployment: GitHub Pages (Frontend) and Render (Backend)

## Getting Started

1.  Clone the repository:
    ```bash
    git clone https://github.com/nikhil-kthota/collaborative-learning.git
    ```
2.  Install dependencies:
    ```bash
    cd collab-learning/client
    npm install
    ```
3.  Run locally:
    ```bash
    npm run dev
    ```
4.  Build for production:
    ```bash
    npm run build
    ```

---
Created for better collaborative learning.
