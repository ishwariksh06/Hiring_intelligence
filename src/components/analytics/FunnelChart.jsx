import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_CHROME, SEQUENTIAL_ORDINAL, TOOLTIP_STYLE } from './chartTheme';
import EmptyState from '../common/EmptyState';

export default function FunnelChart({ data }) {
  if (!data || data.length === 0) return <EmptyState title="No funnel data available" />;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={CHART_CHROME.grid} />
          <XAxis type="number" tick={{ fontSize: 11, fill: CHART_CHROME.tick }} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="stage"
            width={110}
            tick={{ fontSize: 12, fill: CHART_CHROME.tick }}
            axisLine={{ stroke: CHART_CHROME.axis }}
            tickLine={false}
          />
          <Tooltip {...TOOLTIP_STYLE} formatter={(value) => [value, 'Candidates']} />
          <Bar dataKey="count" name="Candidates" radius={[0, 4, 4, 0]} maxBarSize={32}>
            {data.map((entry, index) => (
              <Cell key={entry.stage} fill={SEQUENTIAL_ORDINAL[index % SEQUENTIAL_ORDINAL.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
