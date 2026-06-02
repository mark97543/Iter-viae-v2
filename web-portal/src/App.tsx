import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Welcome from './assets/Welcome';

function App() {
  
  
  return (
    <div className='bg-bg h-screen w-screen flex flex-col items-center justify-center font-main pt-5 text-text'>
      <Router>
        <Routes>
          <Route path='/' element={<Welcome />} />
        </Routes>
      </Router>

    </div>
  );
}

export default App;