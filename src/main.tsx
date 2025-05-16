
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useHideAddressBar } from './hooks/use-hide-address-bar'

// Wrapper component to apply the hook
const AppWithHiddenAddressBar = () => {
  useHideAddressBar();
  return <App />;
};

createRoot(document.getElementById("root")!).render(<AppWithHiddenAddressBar />);
