import { Coins } from 'lucide-react';
import { estimateTokenCount } from '../../services/geminiService';

interface TokenEstimatorProps {
    text: string;
}

export function TokenEstimator({ text }: TokenEstimatorProps) {
    const tokenCount = estimateTokenCount(text);

    if (tokenCount === 0) return null;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            color: 'var(--slate-500)',
            backgroundColor: 'var(--slate-100)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px'
        }}
            title="Approximate token usage (1 token ≈ 4 chars)"
        >
            <Coins size={12} className="text-amber-600" />
            <span>~{tokenCount.toLocaleString()} tokens</span>
        </div>
    );
}
