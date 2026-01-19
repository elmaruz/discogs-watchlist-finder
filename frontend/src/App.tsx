import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ScrapePage from './pages/ScrapePage';
import QueryPage from './pages/QueryPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<ScrapePage />} />
        <Route path="query" element={<QueryPage />} />
      </Route>
    </Routes>
  );
}

export default App;
