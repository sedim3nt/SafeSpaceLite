import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import {
  HomePage,
  EmergencyGuidePage,
  PropertyLookupPage,
  PropertyOwnersPage,
  ReportPage,
  TrackerPage,
  KnowYourRightsPage,
  LegalNoticePage,
  ReviewPage,
  CityPage,
  TermsPage,
  PrivacyPage,
} from './pages';
import { AdvocatePage } from './pages/AdvocatePage';
import { BoulderLandingPage } from './pages/BoulderLandingPage';
import { CitiesPage } from './pages/CitiesPage';
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
          <Route path="/landlords" element={<PropertyOwnersPage />} />
          <Route path="/property-owners" element={<PropertyOwnersPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/know-your-rights" element={<KnowYourRightsPage />} />
          <Route path="/legal-notice" element={<LegalNoticePage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/advocate" element={<AdvocatePage />} />
          <Route path="/boulder" element={<BoulderLandingPage />} />
          <Route path="/cities" element={<CitiesPage />} />
          <Route path="/city/:slug" element={<CityPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </Layout>
      <AIChatWidget />
    </HashRouter>
  );
}

export default App;
