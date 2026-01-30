import { LayoutDashboard, Key, Cpu, CheckCircle2, XCircle } from 'lucide-react';
import { useEncryptedStorage } from '../hooks/useEncryptedStorage';
import { isValidApiKey } from '../services/geminiService';

export function Sidebar() {
    const [apiKey, setApiKey] = useEncryptedStorage('gemini_api_key', '');
    // const [model] = useEncryptedStorage('gemini_model', 'gemini-3-flash'); // Deprecated

    const isKeyValid = isValidApiKey(apiKey);

    return (
        <aside style={{
            width: 'var(--sidebar-width)',
            backgroundColor: 'rgba(30, 41, 59, 0.8)', // Slate-900 with opacity
            backdropFilter: 'blur(12px)',
            color: 'var(--text-inverse)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 1rem',
            borderRight: '1px solid var(--border-subtle)',
            flexShrink: 0
        }}>
            {/* Logo Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', paddingLeft: '0.25rem' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <LayoutDashboard size={22} color="white" />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Resume Intel</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 8px #4ade80' }}></span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 500 }}>System Online</span>
                    </div>
                </div>
            </div>

            {/* Navigation / Config */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Model Selection (Static Display) */}
                <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--slate-500)', marginBottom: '0.75rem', display: 'block' }}>
                        Active Model
                    </label>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '100%',
                            padding: '0.875rem 1rem 0.875rem 2.75rem',
                            backgroundColor: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            color: 'var(--slate-300)',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'not-allowed',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                            Gemini 2.5 Flash Lite
                            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>BETA</span>
                        </div>
                        <Cpu size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1', opacity: 0.9 }} />
                    </div>
                </div>

                {/* API Key */}
                <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--slate-500)', marginBottom: '0.75rem', display: 'block' }}>
                        API Key
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem 0.875rem 2.75rem',
                                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                border: `1px solid ${apiKey ? (isKeyValid ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)') : 'rgba(255, 255, 255, 0.08)'}`,
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                            }}
                        />
                        <Key size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: apiKey ? (isKeyValid ? '#4ade80' : '#f87171') : 'var(--slate-500)', transition: 'color 0.2s' }} />

                        {/* Validation Icon */}
                        {apiKey && (
                            isKeyValid ?
                                <CheckCircle2 size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4ade80' }} /> :
                                <XCircle size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#f87171' }} />
                        )}
                    </div>
                    <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: isKeyValid ? 'var(--slate-500)' : '#f87171', minHeight: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {apiKey && !isKeyValid && "Invalid key format."}
                        {apiKey && isKeyValid && "Encrypted & Secure"}
                    </p>
                </div>

            </div>


        </aside>
    );
}
