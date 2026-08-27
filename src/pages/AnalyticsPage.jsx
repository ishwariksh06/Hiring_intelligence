import { useEffect, useState } from 'react';
import { getHiringFunnel, getMonthlyTrends, getSkillAnalytics, getSkillGap } from '../api/analyticsApi';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import SkillAnalyticsChart from '../components/analytics/SkillAnalyticsChart';
import FunnelChart from '../components/analytics/FunnelChart';
import SkillGapChart from '../components/analytics/SkillGapChart';
import TrendsChart from '../components/analytics/TrendsChart';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getSkillAnalytics(), getHiringFunnel(), getSkillGap(), getMonthlyTrends()]).then(
      ([skills, funnel, skillGap, trends]) => {
        if (active) {
          setData({ skills, funnel, skillGap, trends });
          setLoading(false);
        }
      }
    );
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loader label="Loading analytics..." />;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card title="Skill Analytics" bodyClassName="pt-2">
        <SkillAnalyticsChart data={data.skills} />
      </Card>
      <Card title="Hiring Funnel" bodyClassName="pt-2">
        <FunnelChart data={data.funnel} />
      </Card>
      <Card title="Skill Gap Analysis" bodyClassName="pt-2">
        <SkillGapChart data={data.skillGap} />
      </Card>
      <Card title="Monthly Hiring Trends" bodyClassName="pt-2">
        <TrendsChart data={data.trends} />
      </Card>
    </div>
  );
}
