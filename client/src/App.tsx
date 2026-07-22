import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import AIComposer from "./pages/AIComposer";
import Scheduler from "./pages/Scheduler";
import { Toaster } from "react-hot-toast";
import ProtectRouteForLogin from "./components/ProtectRouteForLogin";

export default function App() {
    return (
        <>
            <Toaster position="top-right"/> 
            <Routes>
                <Route path="/" element={<Home />} />
                <Route element={<ProtectRouteForLogin/>}>
                    <Route path="/login" element={<Login />} />
                </Route>
                <Route element={<Layout/>}>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/accounts" element={<Accounts/>}/>
                    <Route path="/schedule" element={<Scheduler/>}/>
                    <Route path="/ai-composer" element={<AIComposer/>}/>
                </Route>
            </Routes>
        </>
    );
}
