import { Routes, Route } from 'react-router-dom'
import Landing from '../pages/Landing';
import ExhibitionHall from '../pages/ExhibitionHall';
import Layout from '../components/layout/Layout';
import Ex from '../pages/Ex';


export default function routes () {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/ex" element={<Ex/>}/>
        <Route path="/hall/search" element={<ExhibitionHall />} />
        <Route path="/hall/:departmentId" element={<ExhibitionHall />} />
      </Route>
    </Routes>
  )
}