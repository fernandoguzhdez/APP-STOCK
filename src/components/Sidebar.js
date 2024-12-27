import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "./Sidebar.css";
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAuthorization = JSON.parse(localStorage.getItem("authorization"));
    if (storedAuthorization && storedAuthorization.menus) {
      setMenuItems(storedAuthorization.menus);
    }
  }, []);

  const handleLogout = () => {
    logout();
    toggleSidebar();
  };

  const toggleSubMenu = (menuId) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const navegarA = (idSubMenu) => {
    navigate('/orden-de-venta')
    console.log('navegarA...', idSubMenu)
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className={`hamburger ${isOpen ? "open" : ""}`} onClick={toggleSidebar} tabindex="-1">
        <div className="line1"></div>
        <div className="line2"></div>
        <div className="line3"></div>
      </div>
      <div className="links">
        {menuItems.map((menu) => (
          <div key={menu.idMenu} className="menu-item" style={{ width: '100%' }}>
            <NavLink
              to={`/ruta/${menu.idMenu}`}
              className="menu-link"
              onClick={(e) => {
                e.preventDefault();
                toggleSubMenu(menu.idMenu);
              }}
            >
              <i className={`fas ${menu.idMenu === '1' ? 'fa-calendar-alt' :
                menu.idMenu === '2' ? 'fa-warehouse' :
                  menu.idMenu === '3' ? 'fa-truck' :
                    'fa-check-circle'}`}
                style={{ fontSize: '20px' }}></i>
              <span className="link-text">{menu.name}</span>
            </NavLink>
            {activeMenu === menu.idMenu && menu.subMenus && (
              <div className="submenu">
                {menu.subMenus.map((subMenu) => (
                  <NavLink
                    key={subMenu.idSubMenu}
                    to={
                      activeMenu === '1' && subMenu.idSubMenu === '1' ? '/orden-de-venta' :
                        activeMenu === '1' && subMenu.idSubMenu === '2' ? '/inventario' :
                          activeMenu === '1' && subMenu.idSubMenu === '3' ? '/orden-de-produccion' : ''
                    }
                    className="submenu-link"
                    onClick={() => { toggleSidebar() }}
                  >
                    {
                      activeMenu === '1' && subMenu.idSubMenu === '1' ? <i className='fas fa-file-invoice icon'></i> :
                        activeMenu === '1' && subMenu.idSubMenu === '2' ? <i className='fas fa-box icon'></i> :
                          activeMenu === '1' && subMenu.idSubMenu === '3' ? <i className='fas fa-check-circle icon'></i> : ''
                    }
                    <span className="link-text">{subMenu.name}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
