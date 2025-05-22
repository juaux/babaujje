import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Substitutos dos ícones usando react-icons
import {
  FaHome,
  FaTags,
  FaChartLine,
  FaShoppingCart,
  FaMoneyBillAlt,
  
} from 'react-icons/fa';

export default function Sidebar({ open }) {
  const router = useRouter();
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const handleSubMenuClick = (label) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

  const isActive = (href) => router.pathname === href;

  const menuItems = [
    {
      label: 'Home',
      href: '/',
      icon: <FaHome size={16} />,
    },
    {
      label: 'Produtos',
      icon: <FaTags size={16} />,
      onClick: () => handleSubMenuClick('Produtos'),
      subItems: [
        { href: '/produtos/cadastrar', label: 'Cadastrar' },
        { href: '/produtos/consultar', label: 'Consultar' },
      ],
    },
    {
      label: 'Producao',
      icon: <FaChartLine size={16} />,
      onClick: () => handleSubMenuClick('Producao'),
      subItems: [
        { label: 'Lançar Produção', href: '/Producao/lancar' },
        { label: 'Consultar Produção', href: '/Producao/consultar' },
      ],
    },
    {
      label: 'Vendas',
      icon: <FaShoppingCart size={16} />,
      onClick: () => handleSubMenuClick('Vendas'),
      subItems: [
        { label: 'Vendas', href: '/vendas/vendas' },
      ],
    },
    {
      label: 'Despesas',
      icon: <FaMoneyBillAlt size={16} />,
      onClick: () => handleSubMenuClick('Despesas'),
      subItems: [
        { label: 'Lançar Despesas', href: '/despesas/LancarDespesas' },
        { label: 'Consultar Despesas', href: '/despesas/ConsultarDespesas' },
      ],
    },
  {/*  {
      label: 'Balanço',
      icon: <FaChartPie size={16} />,
      onClick: () => handleSubMenuClick('Balanço'),
      subItems: [
        { label: 'Balanço', href: '/balanco/balanco' },
      ],
    },*/}
  ];

  return (
    <div
      className={`${
        open ? 'block' : 'hidden'
      } fixed top-0 left-0 h-full w-60 bg-[#f6b8c5] text-gray-800 shadow-md z-50`}
    >
      <div className="p-4">
        <image
          src="/babauje.png"
          alt="Babauje Logo"
          className="mb-4 mx-auto w-40"
        />
        <h6 className="text-xl font-bold text-center">Babauje</h6>
      </div>

      <div className="divide-y divide-pink-300">
        {menuItems.map((item) => (
          <React.Fragment key={item.label}>
            {item.href && !item.subItems ? (
              <Link
                href={item.href}
                className={`px-4 py-2 hover:bg-pink-300 cursor-pointer block ${
                  isActive(item.href) ? 'bg-pink-400' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="mr-3">{item.icon}</div>
                  <span>{item.label}</span>
                </div>
              </Link>
            ) : (
              <div
                onClick={item.subItems ? item.onClick : undefined}
                className={`px-4 py-2 hover:bg-pink-300 cursor-pointer ${
                  item.href && isActive(item.href) ? 'bg-pink-400' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="mr-3">{item.icon}</div>
                  <span>{item.label}</span>
                </div>
              </div>
            )}

            {item.subItems && (
              <div className={openSubMenu === item.label ? 'block' : 'hidden'}>
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.label}
                    href={subItem.href}
                    className={`px-4 py-2 pl-8 block hover:bg-pink-300 ${
                      isActive(subItem.href) ? 'bg-pink-400' : ''
                    }`}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}