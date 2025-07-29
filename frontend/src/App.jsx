// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/common/Header";
// import Login from "./components/Auth/LoginForm";
// import Register from "./components/Auth/RegisterForm";
// import Services from "./components/common/Services";
// import Contact from "./components/common/Contact";
import About from "./components/common/About";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> */}
          {/* <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} /> */}
          <Route path="/about" element={<About />} />
          {/* Add other routes here */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
