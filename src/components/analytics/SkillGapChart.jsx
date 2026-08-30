import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CATEGORICAL, CHART_CHROME, TOOLTIP_STYLE } from './chartTheme';
import EmptyState from '../common/EmptyState';

export default function SkillGapChart({ data }) {
  if (!data || data.length === 0) return <EmptyState title="No skill-gap data available" />;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 8 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_CHROME.grid} />
          <XAxis dataKey="skill" tick={{ fontSize: 11, fill: CHART_CHROME.tick }} axisLine={{ stroke: CHART_CHROME.axis }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: CHART_CHROME.tick }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
          <Bar dataKey="required" name="Required" fill={CATEGORICAL.blue} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
          <Bar dataKey="available" name="Available" fill={CATEGORICAL.orange} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
