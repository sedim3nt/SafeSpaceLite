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
} from './pages';

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
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
