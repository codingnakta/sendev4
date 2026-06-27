import HeroSection from '../components/HeroSection';
import SummarySection from '../components/SummarySection';
import ExhibitionSection from '../components/ExhibitionSection';
import LatestWorksSection from '../components/LatestWorksSection';
import PortfolioGuideSection from '../components/PortfolioGuideSection';

import {
  exhibitions,
  popularWorks,
  latestWorks,
  statistics,
  portfolioGuide,
} from '../data/dummyData';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <SummarySection
        featuredExhibition={exhibitions[0]}
        popularWorks={popularWorks}
        statistics={statistics}
      />
      <ExhibitionSection exhibitions={exhibitions} />
      <LatestWorksSection works={latestWorks} />
      <PortfolioGuideSection guide={portfolioGuide} />
    </main>
  );
}
