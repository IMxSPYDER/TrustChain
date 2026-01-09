import { StrictMode } from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Rocket } from 'lucide-react';
import UserDashboard from './components/UserDashboard.jsx';
import UserCredentialsPage from './components/UserCredentialsPage.jsx';
import InstitutionDashboard from './components/InstitutionDashboard.jsx';
import LoginPage from './components/LoginPage.jsx';

createRoot(document.getElementById('root')).render(

  <StrictMode>
  <BrowserRouter>

  <Routes>
    <Route path='/' element={<App/>}/>
    <Route path="/user-dashboard" element={<UserDashboard />} />
    <Route path='/user-dashboard/credentials' element={<UserCredentialsPage/>} />
    <Route path="/university-dashboard" element={<InstitutionDashboard />} />
    <Route path="/login" element={<LoginPage/>}/>
    

  </Routes>
  </BrowserRouter>
    
  </StrictMode>
  
)
