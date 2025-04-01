import react, {useEffect} from "react"
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import Navbar from "./components/Navbar.jsx";
import Sets from "./pages/Sets.jsx";
import SetPage from "./pages/SetPage.jsx";
import Collection from "./pages/Collection.jsx";
import ProtectedRoute from "./components/ProtectedRoute"
import SearchResults from "./pages/SearchResults.jsx";
import "./styles/App.css"

function Logout() {
    useEffect(() => {
        localStorage.clear();
    }, []);

    return <Navigate to="/"/>;
}

function RegisterAndLogout() {
    localStorage.clear()
    return <Register/>
}

function LoginAndLogout() {
    localStorage.clear()
    return <Login/>
}


function App() {
    return (
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<LoginAndLogout/>}/>
                <Route path="/logout" element={<Logout/>}/>
                <Route path="/register" element={<RegisterAndLogout/>}/>
                <Route
                    path="/sets"
                    element={
                        <ProtectedRoute>
                            <Sets/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/sets/:id"
                    element={
                        <ProtectedRoute>
                            <SetPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/collection"
                    element={
                        <ProtectedRoute>
                            <Collection/>
                        </ProtectedRoute>
                    }
                />
                <Route path="/search" element={<SearchResults />} />
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    );
}


export default App
