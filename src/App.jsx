import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Add future pages here, e.g. */}
        {/* <Route path="/destinations/:id" element={<DestinationDetails />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
