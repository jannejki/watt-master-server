import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './Contexts/AuthContext';
import AppContent from './AppContent';
import PrivateRoute from './Components/PrivateRoute';
import Login from './Pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navigation from './Components/Navbar';
import Container from 'react-bootstrap/Container';

function MainContent() {
    const { currentUser } = useAuth();

    return (
        <Container fluid={true} className="vh-100 p-0 m-0">
            <Routes>
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <AppContent />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/self"
                    element={
                        <PrivateRoute>
                            <AppContent />
                        </PrivateRoute>
                    }
                />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Container>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <MainContent />
            </AuthProvider>
        </Router>
    );
}

export default App;