import { BrowserRouter, Routes, Route } from 'react-router';
import { Container, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import Login from './Login';
import Register from './Register';
import Logout from './Logout';
import './AuthApp.scss';


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
const AuthApp = () => {
    // Base path is /auth, slug is the part after (e.g., "login")

    return (
        <main id="wrapperAuth" style={{backgroundImage: "url('/front-view-ofcomfortable-working-place-office-freepik.jpg')"}} className='w-100 py-4 py-md-5 d-flex justify-content-center align-items-center'>
            {/* <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href="/auth">Auth App</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="auth/login">Login</Nav.Link>
                    </Nav>
                </Container>
            </Navbar> */}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/register" element={<Register />} />
                {/* Add more routes like <Route path="/register" element={<Register />} /> */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </main>
    );
};

export default AuthApp;