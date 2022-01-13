import './App.css';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import Join from './pages/Join';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Main from './pages/Main';
import Battle from './pages/Battle';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='' element={<Login />} />
        <Route path='/' element={<Login />} />
        <Route path='login' element={<Login />} />
        <Route path='Login' element={<Login />} />
        <Route path='join' element={<Join />} />
        <Route path='Join' element={<Join />} />
        <Route path='main' element={<Main />} />
        <Route path='Main' element={<Main />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;