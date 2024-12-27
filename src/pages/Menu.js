import React from 'react';
import './Menu.css'; // Asegúrate de que la ruta sea correcta
import { useNavigate } from 'react-router-dom';

const Menu = () => {
    const userMenu = JSON.parse(localStorage.getItem('authorization'));
    const navigate = useNavigate();

    return (
        <div className="menu-container">
            {userMenu && userMenu.menus.map(menu => (
                <div key={menu.idMenu} className="menu-card">
                    <div className="menu-title">
                        <i className={`fas ${menu.idMenu === '1' ? 'fa-calendar-alt' :
                            menu.idMenu === '2' ? 'fa-warehouse' :
                                menu.idMenu === '3' ? 'fa-truck' :
                                    'fa-check-circle'}`}
                            style={{ fontSize: '48px' }}></i>
                        <h3>{menu.name}</h3>
                    </div>
                    <div className="sub-menu-container">
                        {menu.subMenus.map(subMenu => (
                            <div key={subMenu.idSubMenu} className="sub-menu-card" onClick={() => {
                                /* if (subMenu.permisos[0].name === 'Crear') {
                                    navigate(subMenu.permisos[0].url)
                                } else {
                                    navigate(subMenu.url)
                                } */
                                    navigate(subMenu.url)
                                    localStorage.setItem('subMenus', JSON.stringify(subMenu))
                            }}>
                                <i className={`fas ${subMenu.idSubMenu === '1' ? 'fa-file-invoice' :
                                    subMenu.idSubMenu === '2' ? 'fa-box' :
                                        subMenu.idSubMenu === '4' ? 'fa-box-open' :
                                            'fa-check'}`}></i>
                                <span>{subMenu.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Menu;
