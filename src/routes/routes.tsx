import { Routes, Route } from 'react-router-dom'
import Landing from '../pages/Landing';
import ExhibitionHall from '../pages/ExhibitionHall';

export default function routes () {
  return (
   <Routes>
    <Route path='/' element={<Landing />} />
    <Route path='/hall/:departmentId' element={<ExhibitionHall />} />
   </Routes>
  );
}