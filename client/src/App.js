import Login from "./Components/Login";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./Contexts/AuthContext";
import Dashboard from "./Components/Dashboard";
import Self from "./Components/Self";
import PrivateRoute from "./Components/PrivateRoute";


function App() {
  return (

    <Router>
      <AuthProvider>
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

      </AuthProvider>
    </Router>

  );
}

export default App;
