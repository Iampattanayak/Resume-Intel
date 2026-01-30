import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
    score: number;
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
    const [animatedScore, setAnimatedScore] = useState(0);

    // Animation effect
    useEffect(() => {
        const duration = 1500;
        const steps = 60;
        const increment = score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= score) {
                setAnimatedScore(score);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.round(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [score]);

    // Color logic
    const getColor = (s: number) => {
        if (s >= 80) return '#16a34a'; // Green 600
        if (s >= 50) return '#d97706'; // Amber 600
        return '#dc2626'; // Red 600
    };

    const color = getColor(animatedScore);
    const radius = 60;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: radius * 2.2, height: radius * 2.2 }}>
            <svg
                height={radius * 2.2}
                width={radius * 2.2}
                style={{ transform: 'rotate(-90deg)' }}
            >
                <circle
                    stroke="#e2e8f0"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius * 1.1}
                    cy={radius * 1.1}
                />
                <circle
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{
                        strokeDashoffset,
                        transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.5s ease'
                    }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius * 1.1}
                    cy={radius * 1.1}
                />
            </svg>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                    {animatedScore}%
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
                    Match
                </span>
            </div>
        </div>
    );
}
