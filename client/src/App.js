//import "./App.css";
import { React } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import Help from "./components/Help/Help";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" exact element={<Home />} />
                <Route path="/help" element={<Help />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
