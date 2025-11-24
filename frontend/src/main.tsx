import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import App from './App.tsx'
import './App.css'
import NewApp from './NewApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <NewApp />
  </StrictMode>,
)
