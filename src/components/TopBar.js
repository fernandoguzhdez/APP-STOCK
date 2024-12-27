import React, { useState, useEffect } from "react";
import "./TopBar.css";
import useAuth from "../hooks/useAuth";

const Topbar = () => {
    const { logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [usuario, setUsuario] = useState("");

    // Obtener el usuario desde el localStorage
    useEffect(() => {
        const authData = localStorage.getItem("authorization");
        if (authData) {
            const { usuario } = JSON.parse(authData);
            setUsuario(usuario);
        }
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="topbar">
            <div className="topbar-content">
                <div className="user-icon" onClick={toggleDropdown}>
                    <span className="user-name">{usuario}</span>
                    <i className="fas fa-user-circle"></i>
                </div>
                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <ul>
                            <li>Perfil</li>
                            <li>Configuraciónes</li>
                            <li onClick={handleLogout}>Cerrar sesion</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Topbar;
