import { BrowserRouter, Routes, Route } from 'react-router';
import { Container, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons
import AuthApp from './auth/AuthApp';
import SetupApp from './setup/SetupApp';
import DashboardApp from './dashboard/DashboardApp';


// Fallback Component (for unmatched routes)
const NotFound = () => {
    return (
        <Container className="mt-5">
            <h2>404 - Not Found</h2>
            <p>The page you’re looking for doesn’t exist.</p>
        </Container>
    );
};

// Main AuthApp Component
const App = () => {
    // Base path is /auth, slug is the part after (e.g., "login")
    return (
        <>
            <BrowserRouter basename="/admin">
                <Routes>
                    <Route path="/auth/*" element={<AuthApp />} />
                    <Route path="/setup" element={<SetupApp />} />
                    <Route path="/dashboard/*" element={<DashboardApp />} />
                    {/* Add more routes like <Route path="/register" element={<Register />} /> */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </>
    );
};

export default App;