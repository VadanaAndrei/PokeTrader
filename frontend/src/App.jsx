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
import Trades from "./pages/Trades.jsx";
import TradeForm from "./components/TradeForm.jsx";
import TradeDetail from "./pages/TradeDetail.jsx";
import PostedTrades from "./pages/PostedTrades.jsx";
import AcceptedTrades from "./pages/AcceptedTrades.jsx";
import Profile from "./pages/Profile.jsx";
import TradeChat from "./pages/TradeChat.jsx";
import GuessGame from "./pages/GuessGame.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

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
            <ScrollToTop/>
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
                <Route
                    path="/search"
                    element={
                        <ProtectedRoute>
                            <SearchResults/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/trades"
                    element={
                        <ProtectedRoute>
                            <Trades/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/trade-form"
                    element={
                        <ProtectedRoute>
                            <TradeForm/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/trades/:id"
                    element={
                        <ProtectedRoute>
                            <TradeDetail/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/posted-trades"
                    element={
                        <ProtectedRoute>
                            <PostedTrades/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/accepted-trades"
                    element={
                        <ProtectedRoute>
                            <AcceptedTrades/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/trades/:tradeId/chat"
                    element={
                        <ProtectedRoute>
                            <TradeChat/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/guess-game"
                    element={
                        <ProtectedRoute>
                            <GuessGame/>
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    );
}


export default App
