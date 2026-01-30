import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { ResumeWorkspace } from './components/ResumeWorkspace';
import { AnalysisView } from './components/AnalysisView';
import { AnimatedBackground } from './components/common';
import { useEncryptedStorage } from './hooks/useEncryptedStorage';
import './index.css';

function App() {
  const [extractedText, setExtractedText] = useState("");

  // Job Description State Lifting (Sync with LocalStorage)
  const [storedJd, setStoredJd] = useEncryptedStorage('resume_job_description', '');
  const [jobDescription, setJobDescription] = useState("");
  const [isJdInitialized, setIsJdInitialized] = useState(false);

  // 1. Initialize from storage once
  useEffect(() => {
    if (!isJdInitialized && storedJd) {
      setJobDescription(storedJd);
      setIsJdInitialized(true);
    }
  }, [storedJd, isJdInitialized]);

  // 2. Debounce Save to Storage
  useEffect(() => {
    const handler = setTimeout(() => {
      if (jobDescription !== storedJd) {
        setStoredJd(jobDescription);
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [jobDescription]); // Intentionally omitting storedJd to avoid loops, though storedJd shouldn't change externally often.

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      <AnimatedBackground />
      <Toaster position="top-right" richColors />

      <div style={{ display: 'flex', width: '100%', height: '100%', zIndex: 10, position: 'relative' }}>
        {/* Sidebar - Configuration */}
        <Sidebar />

        {/* Main Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}>

          {/* Header */}
          <header style={{
            height: 'var(--header-height)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 2rem',
            justifyContent: 'space-between'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--slate-700)' }}>Dashboard</h2>
          </header>

          {/* Workspace Layout */}
          <div style={{ flex: 1, padding: '2rem', display: 'flex', gap: '2rem', overflow: 'hidden' }}>

            {/* Left Pane: Resume & JD */}
            <div style={{ flex: 1, minWidth: '400px', maxWidth: '50%', height: '100%', overflow: 'hidden' }}>
              <ResumeWorkspace
                extractedText={extractedText}
                onTextExtracted={setExtractedText}
                jobDescription={jobDescription}
                onJobDescriptionChange={setJobDescription}
              />
            </div>

            {/* Right Pane: Analysis Report */}
            <div style={{ flex: 1, minWidth: '400px', height: '100%', overflow: 'hidden' }}>
              <AnalysisView extractedText={extractedText} jobDescription={jobDescription} />
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default App
