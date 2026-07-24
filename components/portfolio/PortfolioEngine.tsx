"use client";

import PortfolioCompletion from "@/components/portfolio/PortfolioCompletion";
import PortfolioStats from "@/components/portfolio/PortfolioStats";
import PortfolioDNA from "@/components/portfolio/PortfolioDNA";
import OpportunityMeter from "@/components/portfolio/OpportunityMeter";
import ScholarTimeline from "@/components/timeline/ScholarTimeline";
import OpportunityFeed from "@/components/opportunities/OpportunityFeed";
import { calculatePortfolioStats } from "@/lib/portfolio/services/stats";

type Props = {
  record: LegacyValue;
};

export default function PortfolioEngine({ record }: Props) {
  const portfolioStats = calculatePortfolioStats({
    pillars: [
      record?.academics?.dreamSchool,
      record?.career?.idealProfession,
      record?.athletics?.sport,
      record?.identity?.school,
    ].filter(Boolean),
  });

  return (
    <div style={{ marginBottom: 14 }}>
      <PortfolioCompletion scholarRecord={record} />
      <PortfolioStats stats={portfolioStats} />
      <PortfolioDNA />
      <OpportunityMeter />
      <ScholarTimeline record={record} />
      <OpportunityFeed record={record} />
    </div>
  );
}
