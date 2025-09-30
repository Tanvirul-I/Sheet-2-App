//import "./App.css";
import { React } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
