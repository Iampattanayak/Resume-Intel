import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface RadarDataPoint {
    subject: string;
    A: number; // Candidate
    B: number; // Job Req
}

interface ResumeRadarChartProps {
    data: RadarDataPoint[];
}

export function ResumeRadarChart({ data }: ResumeRadarChartProps) {
    return (
        <div style={{ width: '100%', height: 300, fontSize: '0.8rem' }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="var(--slate-200)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--slate-500)', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: 'var(--slate-300)', fontSize: 10 }} />

                    {/* Candidate Shape */}
                    <Radar
                        name="Candidate Profile"
                        dataKey="A"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fill="var(--primary)"
                        fillOpacity={0.3}
                    />

                    {/* Job Requirement Shape */}
                    <Radar
                        name="Job Requirement"
                        dataKey="B"
                        stroke="var(--slate-400)"
                        strokeWidth={2}
                        fill="var(--slate-400)"
                        fillOpacity={0.1}
                    />

                    <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
