import { useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import SummarySection from '../components/SummarySection';
import ExhibitionSection from '../components/ExhibitionSection';
import LatestWorksSection from '../components/LatestWorksSection';
import PortfolioGuideSection from '../components/PortfolioGuideSection';

import { statistics, portfolioGuide } from '../data/dummyData';
import { getExhibitions, getWorks } from '../data/repository';

export default function HomePage() {
  const [exhibitions, setExhibitions] = useState([]);
  const [works, setWorks] = useState([]);

  useEffect(() => {
    getExhibitions().then(setExhibitions);
    getWorks().then(setWorks);
  }, []);

  const popularWorks = works.slice(4, 9);
  const latestWorks = works.slice(0, 6);

  return (
    <main>
      <HeroSection />
      {exhibitions.length > 0 && (
        <SummarySection
          featuredExhibition={exhibitions[0]}
          popularWorks={popularWorks}
          statistics={statistics}
        />
      )}
      <ExhibitionSection exhibitions={exhibitions} />
      <LatestWorksSection works={latestWorks} />
      <PortfolioGuideSection guide={portfolioGuide} />
    </main>
  );
}
