import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Community from './pages/Community';
import GroupDetail from './pages/GroupDetail'; // Added import
import Academy from './pages/Academy';
import LearningCenter from './pages/LearningCenter';
import LessonView from './pages/LessonView';
import Admin from './pages/Admin';
import { ChallengeProvider } from './context/ChallengeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ChallengeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/group/:groupId" element={<GroupDetail />} />
              <Route path="/academy" element={<Academy />} />
              <Route path="/academy/lesson/:lessonId" element={<LessonView />} />
              <Route path="/learning" element={<LearningCenter />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </BrowserRouter>
        </ChallengeProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
