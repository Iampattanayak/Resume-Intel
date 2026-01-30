interface SkillBadgeProps {
    skill: string;
}

export function SkillBadge({ skill }: SkillBadgeProps) {
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            backgroundColor: '#FEF2F2', // Red 50
            color: '#B91C1C', // Red 700
            fontSize: '0.85rem',
            fontWeight: 500,
            border: '1px solid #FECACA', // Red 200,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
            {skill}
        </span>
    );
}
