import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import SearchQueryForm from './components/SearchQueryForm'
import SearchResult from './components/SearchResult'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<div className="w-full lg:w-3/4 mx-auto flex justify-center items-center mt-12"><SearchQueryForm /></div>} />
          <Route path="/results" element={<SearchResult />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
