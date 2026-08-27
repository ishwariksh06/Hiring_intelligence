import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CATEGORICAL, CHART_CHROME, TOOLTIP_STYLE } from './chartTheme';
import EmptyState from '../common/EmptyState';

export default function TrendsChart({ data }) {
  if (!data || data.length === 0) return <EmptyState title="No trend data available" />;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_CHROME.grid} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART_CHROME.tick }} axisLine={{ stroke: CHART_CHROME.axis }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: CHART_CHROME.tick }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
          <Line type="monotone" dataKey="applications" name="Applications" stroke={CATEGORICAL.blue} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="hires" name="Hires" stroke={CATEGORICAL.orange} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
