import { Lightbulb } from 'lucide-react';

interface FeedbackCardProps {
    advice: string[];
}

export function FeedbackCard({ advice }: FeedbackCardProps) {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
            <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--indigo-50)',
                borderBottom: '1px solid var(--indigo-100)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--indigo-800)',
                fontWeight: 600,
                fontSize: '0.9rem'
            }}>
                <Lightbulb size={16} className="text-indigo-600" />
                Actionable Advice
            </div>
            <ul style={{
                padding: '1rem 1.5rem 1rem 2.5rem',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
            }}>
                {advice.map((tip, idx) => (
                    <li key={idx} style={{
                        color: 'var(--slate-600)',
                        fontSize: '0.9rem',
                        lineHeight: 1.6
                    }}>
                        {tip}
                    </li>
                ))}
            </ul>
        </div>
    );
}
