import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import './Layout.css';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className={`layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <TopBar />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="content">
                <div className="back-button" style={{ width: '110px' }}>
                    <FaArrowLeft size={24} style={{ marginRight: '5px', cursor: 'pointer' }} onClick={goBack} />
                    <span onClick={goBack} style={{ cursor: 'pointer' }}>Regresar</span>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Layout;
