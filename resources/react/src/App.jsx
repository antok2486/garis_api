import React from 'react'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'

import { Login } from './pages/Login'
import { Register } from './pages/Register'
import Home from './pages/Home'
import { Cetak } from './pages/Cetak'

const Logout = () => {
    localStorage.clear()

    return(
        <Navigate to='/login' replace />
    )
}

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route index exact element={<Login />} />
                <Route path='/' index exact element={<Login />} />
                <Route path='/login' index exact element={<Login />} />
                <Route path='/logout' index exact element={<Logout />} />
                <Route path='/register' index exact element={<Register />} />
                <Route path='/home' index exact element={<Home />} />
                <Route path='/cetak' index exact element={<Cetak />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
