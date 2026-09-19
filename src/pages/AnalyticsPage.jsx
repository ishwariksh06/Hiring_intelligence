import { useEffect, useState } from 'react';
import { getIngestTrend, getScreeningFunnel, getSkillAnalytics, getSkillGap } from '../api/analyticsApi';
import { useAuth, useScope } from '../context/useAuth';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import SkillAnalyticsChart from '../components/analytics/SkillAnalyticsChart';
import FunnelChart from '../components/analytics/FunnelChart';
import SkillGapChart from '../components/analytics/SkillGapChart';
import TrendsChart from '../components/analytics/TrendsChart';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const scope = useScope();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getSkillAnalytics(scope), getScreeningFunnel(scope), getSkillGap(scope), getIngestTrend(scope)]).then(
      ([skills, funnel, gap, trend]) => {
        if (active) {
          setData({ skills, funnel, gap, trend });
          setLoading(false);
        }
      }
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) return <Loader label="Loading analytics..." />;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card title="Most common skills in the pool" bodyClassName="pt-2">
        <SkillAnalyticsChart data={data.skills} />
      </Card>
      <Card title="Screening funnel" bodyClassName="pt-2">
        <FunnelChart data={data.funnel} />
      </Card>
      <Card title="Skill gap (required vs available)" bodyClassName="pt-2">
        <SkillGapChart data={data.gap} />
      </Card>
      <Card title="Resumes ingested per month" bodyClassName="pt-2">
        <TrendsChart data={data.trend} />
      </Card>
    </div>
  );
}
