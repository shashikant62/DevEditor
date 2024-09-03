import './App.css';
import {BrowserRouter,Route,Routes} from 'react-router-dom'
import Joinroom from './pages/Joinroom';
import { Toaster } from 'react-hot-toast';
import Editorpage from './pages/Editorpage';
function App() {
  return (<>
  <div >
    <Toaster position='top-center'></Toaster>
  </div>
      <Routes>
      <Route path="/room/:roomid" element={<Editorpage/>}></Route>
      <Route path="/" element={<Joinroom/>}></Route>
      {/* <Route path="/" element={<Joinroom/>}></Route> */}
      </Routes> 
    </>
  );
}

export default App;
