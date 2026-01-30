import { useState } from 'react';
import { Bot, Sparkles, Play, Download, Terminal, UserSearch, FileWarning, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useEncryptedStorage } from '../hooks/useEncryptedStorage';
import { streamGeminiAnalysis, mapGeminiError } from '../services/geminiService';
import type { AnalysisResult } from '../services/geminiService';
import { generateAnalysisReport } from '../services/reportService';
import { ScoreGauge, SkillBadge, TokenEstimator, ThreeDTiltCard, CoverLetterGenerator } from './common';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisViewProps {
    extractedText: string;
    jobDescription: string;
}

export function AnalysisView({ extractedText, jobDescription }: AnalysisViewProps) {
    const [apiKey] = useEncryptedStorage('gemini_api_key', '');

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [streamData, setStreamData] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const handleAnalyze = async () => {
        if (!apiKey) {
            toast.error("Missing API Key", { description: "Please configure your Gemini API Key in the sidebar." });
            return;
        }
        if (!extractedText) {
            toast.warning("Resume Missing", { description: "Please upload a resume first." });
            return;
        }
        if (!jobDescription) {
            toast.warning("Job Description Missing", { description: "Please add a Job Description to compare against." });
            return;
        }

        setIsAnalyzing(true);
        setStreamData('');
        setResult(null);

        const toastId = toast.loading('Initializing Dual-Lens Analysis...');

        try {
            let fullText = '';
            const stream = streamGeminiAnalysis(
                apiKey,
                extractedText,
                jobDescription
            );

            toast.message('Analyzing...', { id: toastId, description: 'Running ATS & Recruiter Simulation...' });

            for await (const chunk of stream) {
                fullText += chunk;
                setStreamData(prev => prev + chunk);
            }

            const jsonMatch = fullText.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : fullText;

            try {
                const parsed: AnalysisResult = JSON.parse(jsonString);
                setResult(parsed);
                toast.success('Analysis Complete', { id: toastId });
            } catch (e) {
                console.error("JSON Parsing failed", e);
                toast.error('Parsing Error', { id: toastId, description: 'Failed to process AI response. It might not be valid JSON.' });
            }

        } catch (err: any) {
            console.error(err);
            const friendlyError = mapGeminiError(err);
            toast.error('Analysis Failed', { id: toastId, description: friendlyError });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>

            {/* Header */}
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'transparent'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                        Dual-Lens Report
                    </h3>
                    {(extractedText || jobDescription) && (
                        <TokenEstimator text={extractedText + jobDescription} />
                    )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {result && (
                        <button
                            onClick={() => generateAnalysisReport(result)}
                            style={{
                                backgroundColor: 'white',
                                color: 'var(--slate-700)',
                                border: '1px solid var(--slate-300)',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer'
                            }}
                            className="hover:bg-slate-50"
                        >
                            <Download size={14} />
                            PDF
                        </button>
                    )}

                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        style={{
                            backgroundColor: isAnalyzing ? 'var(--slate-300)' : 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'background-color 0.2s',
                            cursor: isAnalyzing ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isAnalyzing ? (
                            <>
                                <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                Scanning...
                            </>
                        ) : (
                            <>
                                <Play size={14} fill="currentColor" />
                                Run Analysis
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: 'transparent' }}>

                {/* Empty State */}
                {!isAnalyzing && !result && !streamData && (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        color: 'var(--slate-400)'
                    }}>
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'white', borderRadius: '50%', border: '1px solid var(--slate-200)' }}>
                            <Bot size={32} />
                        </div>
                        <p style={{ maxWidth: '280px', marginBottom: '1rem' }}>
                            Ready to simulate an ATS Screen & Recruiter Review.
                        </p>
                    </div>
                )}

                {/* Streaming State */}
                {isAnalyzing && !result && (
                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--slate-600)', whiteSpace: 'pre-wrap', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                        <p style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--indigo-600)', fontWeight: 600 }}>
                            <Sparkles size={14} /> Dual-Lens Engine Running...
                        </p>
                        {streamData || "Connecting to Gemini..."}
                    </div>
                )}

                {/* Result UI */}
                {result && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Verdict Banner */}
                        <ThreeDTiltCard>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                style={{
                                    backgroundColor: 'rgba(238, 242, 255, 0.8)', // indigo-50 with opacity
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid var(--indigo-100)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    color: 'var(--indigo-900)',
                                    fontSize: '1rem',
                                    lineHeight: 1.6,
                                    fontStyle: 'italic',
                                    textAlign: 'center',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}>
                                "{result.summary_verdict}"
                            </motion.div>
                        </ThreeDTiltCard>

                        {/* DUAL SCORES */}
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                            {/* ATS Score */}
                            <ThreeDTiltCard>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid var(--slate-100)' }}>
                                        <ScoreGauge score={result.scores.ats_compatibility} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-700)', fontWeight: 600, fontSize: '0.9rem', padding: '0.5rem 1rem', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <Terminal size={14} /> ATS Match
                                    </div>
                                </motion.div>
                            </ThreeDTiltCard>

                            {/* Recruiter Score */}
                            <ThreeDTiltCard>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3, type: 'spring' }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid var(--slate-100)' }}>
                                        <ScoreGauge score={result.scores.recruiter_impact} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-700)', fontWeight: 600, fontSize: '0.9rem', padding: '0.5rem 1rem', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <UserSearch size={14} /> Recruiter Impact
                                    </div>
                                </motion.div>
                            </ThreeDTiltCard>
                        </div>

                        {/* ATS WARNINGS */}
                        {result.ats_warnings.length > 0 && (
                            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '1rem' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B91C1C', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    <FileWarning size={16} /> ATS Formatting Alerts
                                </h4>
                                <ul style={{ listStyleType: 'disc', listStylePosition: 'inside', color: '#7F1D1D', fontSize: '0.85rem' }}>
                                    {result.ats_warnings.map((warn, i) => (
                                        <li key={i}>{warn}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* MISSING KEYWORDS */}
                        <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
                                Technical Keyword Gaps
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {result.critical_missing_keywords.length > 0 ? (
                                    result.critical_missing_keywords.map((skill, idx) => (
                                        <SkillBadge key={idx} skill={skill} />
                                    ))
                                ) : (
                                    <span style={{ fontSize: '0.9rem', color: 'var(--slate-500)', fontStyle: 'italic' }}>
                                        No critical skills missing.
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ACTIONABLE IMPROVEMENTS */}
                        <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-500)', marginBottom: '1rem' }}>
                                Strategic Improvements
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {result.resume_improvements.map((item, idx) => (
                                    <div key={idx} style={{
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-subtle)',
                                        padding: '1rem',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                color: 'var(--indigo-600)',
                                                backgroundColor: 'var(--indigo-50)',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {item.section}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 500 }}>
                                                <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                {item.issue}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--slate-700)', lineHeight: 1.5 }}>
                                            <span style={{ fontWeight: 600 }}>Fix: </span>
                                            {item.fix}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}
