import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import {
  HomePage,
  EmergencyGuidePage,
  PropertyLookupPage,
  ReportPage,
  TrackerPage,
  KnowYourRightsPage,
  LegalNoticePage,
  ReviewPage,
  CityPage,
} from './pages';
import { AdvocatePage } from './pages/AdvocatePage';
import { BoulderLandingPage } from './pages/BoulderLandingPage';
import { AIChatWidget } from './components/features/AIChat/AIChatWidget';

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/emergency-guide" element={<EmergencyGuidePage />} />
          <Route path="/property-lookup" element={<PropertyLookupPage />} />
          <Route path="/property/:propertyId" element={<PropertyLookupPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/know-your-rights" element={<KnowYourRightsPage />} />
          <Route path="/legal-notice" element={<LegalNoticePage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/advocate" element={<AdvocatePage />} />
          <Route path="/boulder" element={<BoulderLandingPage />} />
          <Route path="/city/:slug" element={<CityPage />} />
        </Routes>
      </Layout>
      <AIChatWidget />
    </HashRouter>
  );
}

export default App;
