import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CATEGORICAL, CHART_CHROME, TOOLTIP_STYLE } from './chartTheme';
import EmptyState from '../common/EmptyState';

export default function SkillAnalyticsChart({ data }) {
  if (!data || data.length === 0) return <EmptyState title="No skill data available" />;

  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} margin={{ top: 8, right: 8, left: -20, bottom: 8 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_CHROME.grid} />
          <XAxis dataKey="skill" tick={{ fontSize: 11, fill: CHART_CHROME.tick }} axisLine={{ stroke: CHART_CHROME.axis }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: CHART_CHROME.tick }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip {...TOOLTIP_STYLE} formatter={(value) => [value, 'Candidates']} />
          <Bar dataKey="count" name="Candidates" fill={CATEGORICAL.blue} radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
