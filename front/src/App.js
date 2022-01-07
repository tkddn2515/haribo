import './App.css';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import Join from './pages/Join';
import Login from './pages/Login';
import Profile from './pages/Profile';
import RoomList from './pages/RoomList';
import Battle from './pages/Battle';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='login' element={<Login />} />
        <Route path='Login' element={<Login />} />
        <Route path='join' element={<Join />} />
        <Route path='Join' element={<Join />} />
      </Routes>
    </Router>
  );
}

export default App;