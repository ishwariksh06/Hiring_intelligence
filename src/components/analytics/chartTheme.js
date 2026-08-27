// Categorical slots (fixed order — never cycled), sequential ramp, and chrome
// values from the validated default palette (light mode only; this app does
// not support a dark theme).
export const CATEGORICAL = {
  blue: '#2a78d6',
  orange: '#eb6834',
  aqua: '#1baf7a',
  yellow: '#eda100',
  magenta: '#e87ba4',
  green: '#008300',
  violet: '#4a3aa7',
  red: '#e34948',
};

// Ordinal ramp (single hue, light -> dark), for ordered discrete stages like a funnel.
export const SEQUENTIAL_ORDINAL = ['#86b6ef', '#6da7ec', '#3987e5', '#2a78d6', '#1c5cab', '#0d366b'];

export const CHART_CHROME = {
  grid: '#e2e8f0',
  axis: '#94a3b8',
  tick: '#64748b',
  surface: '#ffffff',
};

export const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    fontSize: 12,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  },
  labelStyle: { color: '#334155', fontWeight: 600 },
};
