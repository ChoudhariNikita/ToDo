import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Todos from './todos';

const App = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/todos" element={<Todos />} />
            <Route path="/" element={<Login />} /> {/* Redirect to login by default */}
        </Routes>
    );
};

export default App;
