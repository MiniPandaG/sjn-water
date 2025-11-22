// components/DashboardNav.tsx
'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  barrio?: {
    id: number;
    nombre: string;
  };
}

interface DashboardNavProps {
  user: User | undefined;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItemClass = (path: string) => {
    const baseClass = "flex items-center px-4 py-3 rounded-lg transition-all duration-200 group";
    const activeClass = isActive(path) 
      ? "bg-blue-700 text-white shadow-lg border-l-4 border-blue-300" 
      : "text-blue-100 hover:bg-blue-700 hover:text-white hover:border-l-4 hover:border-blue-400";
    return `${baseClass} ${activeClass}`;
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-800 to-blue-900 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        flex flex-col shadow-2xl
      `}>
        {/* Header - Aumentado para más espacio */}
        <div className="flex-shrink-0 flex items-center justify-between h-24 px-6 bg-blue-900 border-b border-blue-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">Sistema Agua</h1>
              <p className="text-blue-200/80 text-sm">Panel de Control</p>
            </div>
          </div>
        </div>

        {/* Navigation - Con padding superior adicional */}
        <div className="flex-1 overflow-hidden">
          <nav className="p-4 h-full">
            <div className="space-y-1 h-full flex flex-col">
              {/* Espacio superior adicional */}
              <div className="pt-4"></div>
              
              {/* Contenedor principal de navegación */}
              <div className="space-y-1">
                {/* Dashboard */}
                <Link
                  href="/dashboard"
                  className={navItemClass('/dashboard')}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="relative">
                    <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="font-medium">Dashboard</span>
                </Link>

                {/* Admin Sections */}
                {user?.role === 'admin' && (
                  <>
                    <div className="px-4 py-3 mt-6 first:mt-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                        <p className="text-blue-300/90 text-xs font-semibold uppercase tracking-wider">Administración</p>
                      </div>
                    </div>

                    {/* Barrios */}
                    <Link
                      href="/dashboard/barrios"
                      className={navItemClass('/dashboard/barrios')}
                      onClick={() => setIsOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Gestión de Barrios</span>
                    </Link>

                    {/* Estado del Agua */}
                    <Link
                      href="/dashboard/estado"
                      className={navItemClass('/dashboard/estado')}
                      onClick={() => setIsOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Estado del Agua</span>
                    </Link>

                    {/* Avisos */}
                    <Link
                      href="/dashboard/avisos"
                      className={navItemClass('/dashboard/avisos')}
                      onClick={() => setIsOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Avisos por Barrio</span>
                    </Link>

                    {/* Programaciones */}
                    <Link
                      href="/dashboard/programaciones"
                      className={navItemClass('/dashboard/programaciones')}
                      onClick={() => setIsOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Programaciones</span>
                    </Link>

                    {/* Mantenimientos */}
                    <Link
                      href="/dashboard/mantenimientos"
                      className={navItemClass('/dashboard/mantenimientos')}
                      onClick={() => setIsOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Mantenimientos</span>
                    </Link>

                    {/* Noticias */}
                    <Link
                      href="/dashboard/noticias"
                      className={navItemClass('/dashboard/noticias')}
                      onClick={() => setIsOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9m0 0v12" />
                      </svg>
                      <span>Gestión de Noticias</span>
                    </Link>

                    {/* Quejas */}
                    <Link
                      href="/dashboard/quejas"
                      className={navItemClass('/dashboard/quejas')}
                      onClick={() => setIsOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Gestión de Quejas</span>
                    </Link>
                  </>
                )}

                {/* User Sections */}
                <div className="px-4 py-3 mt-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-4 bg-green-400 rounded-full"></div>
                    <p className="text-blue-300/90 text-xs font-semibold uppercase tracking-wider">Usuario</p>
                  </div>
                </div>

                {/* Mi Barrio */}
                <Link
                  href="/dashboard/mi-barrio"
                  className={navItemClass('/dashboard/mi-barrio')}
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <span>Mi Barrio</span>
                </Link>

                {/* Notificaciones - CON EL BELL INTEGRADO */}
                <Link
                  href="/dashboard/notificaciones"
                  className={navItemClass('/dashboard/notificaciones')}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="relative">
                    <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <span>Notificaciones</span>
                  {/* Reemplazamos el contador fijo por el NotificationBell */}
                  <div className="ml-auto">
                    <NotificationBell />
                  </div>
                </Link>

                {/* Perfil */}
                <Link
                  href="/dashboard/perfil"
                  className={navItemClass('/dashboard/perfil')}
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Mi Perfil</span>
                </Link>

                {/* Enviar Queja */}
                <Link
                  href="/dashboard/enviar-queja"
                  className={navItemClass('/dashboard/enviar-queja')}
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>Enviar Queja</span>
                </Link>
              </div>

              {/* Espacio flexible para empujar el footer hacia abajo */}
              <div className="flex-1"></div>
            </div>
          </nav>
        </div>

        {/* User info and logout - Fijo en la parte inferior */}
        <div className="flex-shrink-0 border-t border-blue-700/50 p-4 bg-blue-900/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg border border-white/20">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-blue-200/80 text-xs truncate">{user?.email}</p>
              {user?.barrio && (
                <p className="text-blue-300/90 text-xs truncate">{user.barrio.nombre}</p>
              )}
              <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                user?.role === 'admin' 
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                  : 'bg-green-500/20 text-green-300 border border-green-500/30'
              }`}>
                {user?.role === 'admin' ? '👑 Administrador' : '👤 Usuario'}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2 text-blue-200 hover:bg-red-600/20 hover:text-white rounded-lg transition-all duration-200 group border border-transparent hover:border-red-500/30"
          >
            <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main content spacer - BARRA SUPERIOR FIJA */}
      <div className="lg:ml-64">
        {/* Barra superior fija */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 z-30 flex items-center justify-between px-4 lg:px-6">
          {/* Lado izquierdo - Botón menú móvil y título */}
          <div className="flex items-center space-x-4">
            {/* Botón menú móvil EMPOTRADO en la barra */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Título de página */}
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">Dashboard</span>
            </div>
          </div>
          
          {/* Lado derecho - SOLO ICONO de notificaciones e información usuario */}
          <div className="flex items-center space-x-4">
            {/* Botón de notificaciones - SOLO ICONO */}
            <div className="hidden lg:block">
              <Link 
                href="/dashboard/notificaciones" 
                className="relative flex items-center justify-center text-gray-600 hover:text-blue-600 transition p-2 rounded-lg hover:bg-gray-100 w-10 h-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <NotificationBell />
              </Link>
            </div>
            
            {/* Información del usuario */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                  {user?.barrio && ` • ${user.barrio.nombre}`}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Espacio para que el contenido no quede detrás de la barra superior */}
        <div className="h-16"></div>
      </div>
    </>
  );
}