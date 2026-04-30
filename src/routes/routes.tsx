import { Routes, Route } from 'react-router-dom'
import ExhibitionHall from '../pages/ExhibitionHall'
import Layout from '../components/layout/Layout'
import Landing from '../pages/Landing'

export default function routes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />

        <Route path="/hall/search" element={<ExhibitionHall />} />
        <Route path="/hall/:departmentId" element={<ExhibitionHall />} />
      </Route>
    </Routes>
  )
}
