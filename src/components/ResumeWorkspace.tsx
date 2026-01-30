import { useState, useRef } from 'react';
import { Upload, FileText, X, FileType, Eye, FileDigit } from 'lucide-react';
import { extractPdfText, sanitizeText } from '../services/pdfService';

interface ResumeWorkspaceProps {
    onTextExtracted: (text: string) => void;
    extractedText: string;
    jobDescription: string;
    onJobDescriptionChange: (text: string) => void;
}

export function ResumeWorkspace({ onTextExtracted, extractedText, jobDescription, onJobDescriptionChange }: ResumeWorkspaceProps) {
    // PDF State
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'pdf' | 'text'>('pdf');
    const [isProcessing, setIsProcessing] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf') {
                const url = URL.createObjectURL(file);
                setPdfFile(file);
                setPdfPreviewUrl(url);
                setIsProcessing(true);

                try {
                    const rawText = await extractPdfText(file);
                    const cleanText = sanitizeText(rawText);
                    onTextExtracted(cleanText);
                } catch (error) {
                    console.error("Extraction failed", error);
                    onTextExtracted("Error extracting text from PDF.");
                } finally {
                    setIsProcessing(false);
                }

            } else {
                alert('Please upload a PDF file.');
            }
        }
    };

    const clearFile = () => {
        setPdfFile(null);
        onTextExtracted('');
        setViewMode('pdf');
        if (pdfPreviewUrl) {
            URL.revokeObjectURL(pdfPreviewUrl);
            setPdfPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>

            {/* Resume Section */}
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'flex 0.3s ease',
                flex: pdfFile ? 1 : 1, // Ensure stable flex
                minHeight: '300px'
            }}>
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileType size={16} className="text-indigo-600" />
                        Resume (PDF)
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {pdfFile && (
                            <div style={{ display: 'flex', backgroundColor: 'var(--slate-100)', borderRadius: '6px', padding: '2px' }}>
                                <button
                                    onClick={() => setViewMode('pdf')}
                                    style={{
                                        border: 'none',
                                        background: viewMode === 'pdf' ? 'white' : 'transparent',
                                        boxShadow: viewMode === 'pdf' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                        borderRadius: '4px',
                                        padding: '0.25rem 0.5rem',
                                        fontSize: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        color: viewMode === 'pdf' ? 'var(--indigo-600)' : 'var(--slate-500)',
                                        fontWeight: 500
                                    }}
                                >
                                    <Eye size={12} /> View PDF
                                </button>
                                <button
                                    onClick={() => setViewMode('text')}
                                    style={{
                                        border: 'none',
                                        background: viewMode === 'text' ? 'white' : 'transparent',
                                        boxShadow: viewMode === 'text' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                        borderRadius: '4px',
                                        padding: '0.25rem 0.5rem',
                                        fontSize: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        color: viewMode === 'text' ? 'var(--indigo-600)' : 'var(--slate-500)',
                                        fontWeight: 500
                                    }}
                                >
                                    <FileDigit size={12} /> Parsed Text
                                </button>
                            </div>
                        )}

                        {pdfFile && (
                            <button
                                onClick={clearFile}
                                style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--slate-500)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                                className="hover:text-red-500"
                            >
                                <X size={14} /> Remove
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {!pdfFile ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: '2px dashed var(--slate-300)',
                                borderRadius: '8px',
                                padding: '3rem 1.5rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: 'var(--slate-50)'
                            }}
                            className="hover:border-indigo-400 hover:bg-slate-100"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf"
                                hidden
                            />
                            <div style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: 'var(--indigo-50)',
                                color: 'var(--indigo-600)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem'
                            }}>
                                <Upload size={24} />
                            </div>
                            <p style={{ fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.25rem' }}>
                                Click to upload resume
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                                PDF format only
                            </p>
                        </div>
                    ) : (
                        <div style={{ flex: 1, border: '1px solid var(--slate-200)', borderRadius: '8px', overflow: 'hidden', height: '100%', minHeight: '300px', backgroundColor: 'var(--slate-50)' }}>
                            {isProcessing ? (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--slate-500)' }}>
                                    <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid var(--slate-200)', borderTopColor: 'var(--indigo-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    Processing PDF...
                                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                </div>
                            ) : viewMode === 'pdf' ? (
                                <iframe
                                    src={pdfPreviewUrl!}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    title="Resume Preview"
                                />
                            ) : (
                                <textarea
                                    value={extractedText}
                                    readOnly
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        padding: '1rem',
                                        fontSize: '0.85rem',
                                        fontFamily: 'monospace',
                                        resize: 'none',
                                        outline: 'none',
                                        backgroundColor: 'white',
                                        color: 'var(--slate-700)'
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Job Description Section */}
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                flex: 1,
                minHeight: '200px',
                transition: 'flex 0.3s ease'
            }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} className="text-indigo-600" />
                        Job Description
                    </h3>
                </div>
                <div style={{ padding: '1rem', flex: 1 }}>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => onJobDescriptionChange(e.target.value)}
                        placeholder="Paste the job description here..."
                        style={{
                            width: '100%',
                            height: '100%',
                            minHeight: '150px',
                            border: 'none',
                            resize: 'none',
                            fontSize: '0.9rem',
                            color: 'var(--slate-700)',
                            outline: 'none',
                            backgroundColor: 'transparent'
                        }}
                    />
                </div>
            </div>

        </div>
    );
}
