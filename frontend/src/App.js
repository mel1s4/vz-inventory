import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ZoneArchive from './zoneArchive/zoneArchive.js';

function App() {
  return (
    <main>
      <h3>
        Inventory
      </h3>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ZoneArchive />} />
          <Route path="/zone/" element={<ZoneArchive />} />
          <Route path="/zone/:zone_id:?/product" element={<ZoneArchive />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;
