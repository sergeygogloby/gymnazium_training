import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppNav } from './components/AppNav';
import { HomePage } from './pages/HomePage';
import { CurriculumPage } from './pages/CurriculumPage';
import { PracticeEntryPage } from './pages/PracticeEntryPage';
import { SessionPage } from './pages/SessionPage';
import { SessionResultPage } from './pages/SessionResultPage';
import { HistoryPage } from './pages/HistoryPage';
import { ResultsPage } from './pages/ResultsPage';
import { HelpPage } from './pages/HelpPage';
import { FlagPage } from './pages/FlagPage';
import { MistakesPage } from './pages/MistakesPage';
import { UploadPage } from './pages/UploadPage';

/**
 * Wave 1 LAN shell — no auth, no Practice/Insights modes.
 * V07 Insights retired — do not route.
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppNav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/kurikulum" element={<CurriculumPage />} />
          <Route path="/cvicenie" element={<PracticeEntryPage />} />
          <Route path="/relacia" element={<SessionPage />} />
          <Route path="/vysledok/:attemptId" element={<SessionResultPage />} />
          <Route path="/historia" element={<HistoryPage />} />
          <Route path="/vysledky" element={<ResultsPage />} />
          <Route path="/pomoc" element={<HelpPage />} />
          <Route path="/nahlásenie" element={<FlagPage />} />
          <Route path="/nahlasenie" element={<FlagPage />} />
          <Route path="/chyby" element={<MistakesPage />} />
          <Route path="/nahrat" element={<UploadPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
