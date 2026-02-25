import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppServicesProvider } from "./presentation/context/AppContext";
import Home from "./presentation/pages/Home";
import Room from "./presentation/pages/Room";

export default function App() {
  return (
    <AppServicesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:slug" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </AppServicesProvider>
  );
}
