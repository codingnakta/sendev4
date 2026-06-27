import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import './styles/App.css';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ExhibitionDetailPage from './pages/ExhibitionDetailPage';
import WorkDetailPage from './pages/WorkDetailPage';
import ArtistsPage from './pages/ArtistsPage';
import NoticePage from './pages/NoticePage';
import MyPage from './pages/MyPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/exhibitions/:id" element={<ExhibitionDetailPage />} />
          <Route path="/works/:id" element={<WorkDetailPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/notices" element={<NoticePage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
