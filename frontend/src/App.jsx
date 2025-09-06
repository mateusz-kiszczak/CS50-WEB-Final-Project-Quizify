import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import RegisterPage from './pages/RegisterPage';
import CreateQuizPage from './pages/CreateQuizPage';
import DashboardPage from './pages/DashboardPage';
import QuizListPage from './pages/QuizListPage';
import QuizPage from './pages/QuizPage';
import EditQuizPage from './pages/EditQuizPage';
import Pricing from './pages/Pricing';
import './styles/main.scss';



function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/logout" element={<LogoutPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/create-quiz" element={<CreateQuizPage />} />
                        <Route path="/user-dashboard" element={<Navigate to="/user-dashboard/1?" replace />} />
                        <Route path="/user-dashboard/:page" element={<DashboardPage />} />
                        <Route path="/user-dashboard/edit-quiz/" element={<Navigate to="/user-dashboard/1?" replace />} />
                        <Route path="/user-dashboard/edit-quiz/:quizId" element={<EditQuizPage />} />
                        <Route path="/quizzes" element={<Navigate to="/quizzes/1?search=" replace />} />
                        <Route path="/quizzes/:page" element={<QuizListPage />} />
                        <Route path="/quiz/:id" element={<QuizPage />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}



export default App;
