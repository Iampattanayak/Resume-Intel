import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Copy, X } from 'lucide-react';
import { toast } from 'sonner';
import { streamCoverLetter } from '../../services/geminiService';
import { useEncryptedStorage } from '../../hooks/useEncryptedStorage';
import { ThreeDTiltCard } from './ThreeDTiltCard';
import { motion, AnimatePresence } from 'framer-motion';

interface CoverLetterGeneratorProps {
    extractedText: string;
    onClose: () => void;
}

export function CoverLetterGenerator({ extractedText, onClose }: CoverLetterGeneratorProps) {
    const [apiKey] = useEncryptedStorage('gemini_api_key', '');
    const [jobDescription] = useEncryptedStorage('resume_job_description', '');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [hasStarted, setHasStarted] = useState(false);

    const handleGenerate = async () => {
        if (!apiKey || !extractedText || !jobDescription) {
            toast.error("Missing Data", { description: "Ensure API Key, Resume, and Job Description are present." });
            return;
        }

        setIsGenerating(true);
        setHasStarted(true);
        setGeneratedLetter('');

        try {
            const stream = streamCoverLetter(apiKey, extractedText, jobDescription);

            for await (const chunk of stream) {
                setGeneratedLetter(prev => prev + chunk);
            }

        } catch (error) {
            console.error(error);
            toast.error("Generation Failed");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLetter);
        toast.success("Copied to Clipboard");
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(5px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}
        >
            <ThreeDTiltCard style={{ width: '100%', maxWidth: '800px', height: '80vh' }}>
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    border: '1px solid rgba(255,255,255,0.4)',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid var(--slate-100)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--slate-50)'
                    }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={18} className="text-indigo-600" />
                                AI Cover Letter Drafter
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                                STAR-Method optimized • Anecdote mapped
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--slate-400)'
                            }}
                            className="hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#fff' }}>
                        {!hasStarted ? (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', textAlign: 'center', color: 'var(--slate-500)' }}>
                                <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--indigo-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles size={32} className="text-indigo-600" />
                                </div>
                                <div style={{ maxWidth: '400px' }}>
                                    <h4 style={{ color: 'var(--slate-700)', fontWeight: 600, marginBottom: '0.5rem' }}>Ready to Write?</h4>
                                    <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                                        I will analyze your resume achievements and map them directly to the job description requirements using the STAR method.
                                    </p>
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    style={{
                                        backgroundColor: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        fontWeight: 500,
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
                                        transition: 'transform 0.1s'
                                    }}
                                    className="hover:scale-105 active:scale-95"
                                >
                                    Generate Draft
                                </button>
                            </div>
                        ) : (
                            <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'serif', fontSize: '1rem', lineHeight: 1.8, color: 'var(--slate-800)', maxWidth: '65ch', margin: '0 auto' }}>
                                {generatedLetter}
                                {isGenerating && <span className="animate-pulse">|</span>}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {generatedLetter && !isGenerating && (
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: 'var(--slate-50)' }}>
                            <button
                                onClick={copyToClipboard}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--slate-300)',
                                    backgroundColor: 'white',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    color: 'var(--slate-700)',
                                    cursor: 'pointer'
                                }}
                            >
                                <Copy size={14} /> Copy
                            </button>
                            <button
                                onClick={handleGenerate}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: 'var(--slate-800)',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <Sparkles size={14} /> Regenerate
                            </button>
                        </div>
                    )}
                </div>
            </ThreeDTiltCard>
        </motion.div>,
        document.body
    );
}
