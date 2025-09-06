import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";



const Layout = () => {
    // Render
    return (
        <div className="layout">
            <Navbar />
            <main className="main-content">
                <Outlet /> {/* Renders the current route */}
            </main>
            <Footer />
        </div>
    );
};



export default Layout;