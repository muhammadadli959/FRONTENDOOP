import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyGalleryPage from "./pages/MyGalleryPage";
import UploadPage from "./pages/UploadPage";
import AdminPage from "./pages/AdminPage";
import SavedPage from "./pages/SavedPage";
import ArtworkDetailPage from "./pages/ArtworkDetailPage";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <div className="pt-14">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/my-gallery" element={<MyGalleryPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/artwork/:id" element={<ArtworkDetailPage />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
