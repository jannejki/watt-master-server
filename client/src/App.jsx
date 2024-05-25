import Login from "./Pages/Login";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from "./Contexts/AuthContext";
import Dashboard from "./Pages/Dashboard";
import Self from "./Pages/Self";
import PrivateRoute from "./Components/PrivateRoute";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navigation from "./Components/Navbar";
import Container from "react-bootstrap/Container";

function MainContent() {
  const { currentUser } = useAuth();
  return (
    <>
      <Container fluid={true} className="vh-100 p-0 m-0">
        {currentUser && <Navigation />}

        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/self"
            element={
              <PrivateRoute>
                <Self />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Container>
    </>
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