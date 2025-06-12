import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { AuthProvider } from "@/contexts/AuthContext";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <main>
          <AppRoutes />
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
