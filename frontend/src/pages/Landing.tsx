import './Landing.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';

function Landing() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<h1>Stockify</h1>} />
            </Routes>
        </Router>
    );
}

export default Landing;
