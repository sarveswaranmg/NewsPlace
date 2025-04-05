import { Routes, Route } from "react-router-dom";
import NewsPage from "./components/pages/NewsPage/NewsPage";
import ProtectedRoute from "./utils/ProtectedRoute/protectedRoute";
import { SignIn, SignUp } from "./components/pages/LoginPage/SignUp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn></SignIn>} />
      <Route path="/signUp" element={<SignUp></SignUp>}></Route>
      <Route
        path="/news"
        element={
          <ProtectedRoute>
            <NewsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
