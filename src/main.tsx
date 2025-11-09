import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './authentication/login.tsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Register from './authentication/register.tsx'
import Home from './home/home.tsx'
import CreateGuide from './createGuide/createGuide.tsx'
import GuideDetails from './guideDetails/guideDetails.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create-guide" element={<CreateGuide />} />
        <Route path="/guide/:id" element={<GuideDetails />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
