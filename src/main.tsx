
import { createRoot } from 'react-dom/client'
import { StrictMode, Component, Suspense, useEffect } from 'react';
import App from './App.tsx'
import './index.css'
import { useHideAddressBar } from './hooks/use-hide-address-bar'

// Simple error boundary fallback
const ErrorFallback = ({ error }: { error: Error }) => {
  console.error('Application error:', error);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h2 className="text-xl mb-4">Something went wrong</h2>
      <p className="text-red-400 mb-4">Error: {error.message}</p>
      <button 
        className="px-4 py-2 bg-theme-color rounded"
        onClick={() => window.location.reload()}
      >
        Try reloading
      </button>
    </div>
  );
};

// Use this hook to hide loading screen as soon as React starts rendering
const useHideLoadingScreen = () => {
  useEffect(() => {
    const loadingElement = document.getElementById('loading-fallback');
    if (loadingElement) {
      console.log('Hiding loading screen from React hook');
      loadingElement.classList.add('hidden');
    }
  }, []);
};

// Custom error boundary component
class AppErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error as Error} />;
    }
    return this.props.children;
  }
}

// Wrapper component to apply the hooks
const AppWithHiddenAddressBar = () => {
  useHideAddressBar();
  useHideLoadingScreen(); // Add this hook to hide loading screen
  
  console.log("AppWithHiddenAddressBar rendering");
  
  return (
    <StrictMode>
      <AppErrorBoundary>
        <Suspense fallback={<div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>}>
          <App />
        </Suspense>
      </AppErrorBoundary>
    </StrictMode>
  );
};

// Get the root element and render the app
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Failed to find the root element");
} else {
  try {
    console.log("Mounting app to DOM");
    const root = createRoot(rootElement);
    root.render(<AppWithHiddenAddressBar />);
  } catch (e) {
    console.error("Error rendering the app:", e);
    document.body.innerHTML = `
      <div style="color: white; background: black; padding: 20px; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h2>Failed to load the application</h2>
        <p style="color: red;">Error: ${e instanceof Error ? e.message : String(e)}</p>
        <button style="padding: 8px 16px; background: #ff5500; border: none; border-radius: 4px; margin-top: 20px;" 
                onclick="window.location.reload()">
          Reload page
        </button>
      </div>
    `;
  }
}
