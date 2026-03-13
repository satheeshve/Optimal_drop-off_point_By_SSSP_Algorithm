import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import './i18n/config';

console.log("🚀 Main.tsx loaded");

try {
  const rootElement = document.getElementById("root");
  console.log("📍 Root element:", rootElement);
  
  if (!rootElement) {
    throw new Error("Root element not found!");
  }
  
  console.log("🎨 Creating React root...");
  const root = createRoot(rootElement);
  
  console.log("🎯 Rendering App component...");
  root.render(<App />);
  
  console.log("✅ App rendered successfully");
} catch (error) {
  console.error("❌ Fatal error during initialization:", error);
  document.body.innerHTML = `
    <div style="padding: 40px; font-family: system-ui; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">⚠️ Application Error</h1>
      <p style="color: #666; line-height: 1.6;">
        The application failed to start. Please check the browser console for detailed error messages.
      </p>
      <pre style="background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto;">
${error instanceof Error ? error.message : String(error)}
      </pre>
      <p style="color: #666; margin-top: 20px;">
        <strong>Possible solutions:</strong>
        <ul>
          <li>Clear your browser cache and hard refresh (Ctrl+Shift+R)</li>
          <li>Check if all dependencies are installed (npm install)</li>
          <li>Verify the development server is running correctly</li>
        </ul>
      </p>
    </div>
  `;
}
