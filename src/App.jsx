import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Layout from './pages/layout';


function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          }
        >
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="labours" element={<LabourManager />} />
          <Route path="attendance" element={<AllAttendance />} />
          {/* Add more routes if needed */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
