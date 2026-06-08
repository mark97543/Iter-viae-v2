import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Welcome from './assets/Welcome';
import Blog from './assets/Blog';

function App() {
  
  
  return (
    <div className=' bg-neutral-950 min-h-screen w-full flex flex-col items-center justify-center font-main pt-5 pb-5 text-text'>
      <Router>
        <Routes>
          <Route path='/' element={<Welcome />} />
          <Route path='/blog' element={<Blog />} />
        </Routes>
      </Router>

    </div>
  );
}

export default App;