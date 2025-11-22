// app/cliente/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface EstadoAgua {
  id: number;
  estado: string;
  fecha_actualizacion: string;
  barrio: {
    id: number;
    nombre: string;
  };
}

interface Aviso {
  id: number;
  mensaje: string;
  fecha: string;
  barrio: {
    id: number;
    nombre: string;
  };
}

interface Notificacion {
  id: number;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

export default function ClienteDashboard() {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoAgua | null>(null);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClienteData = useCallback(async (barrioId: number) => {
    try {
      setLoading(true);
      const [estadoRes, avisosRes, notificacionesRes] = await Promise.all([
        fetch(`/api/estado?barrio_id=${barrioId}`),
        fetch(`/api/avisos?barrio_id=${barrioId}`),
        fetch('/api/notificaciones?page=1&limit=10')
      ]);

      if (estadoRes.ok) {
        const estadoData = await estadoRes.json();
        setEstado(estadoData[0] || null);
      }

      if (avisosRes.ok) {
        const avisosData = await avisosRes.json();
        setAvisos(avisosData.slice(0, 5));
      }

      if (notificacionesRes.ok) {
        const notificacionesData = await notificacionesRes.json();
        setNotificaciones(notificacionesData.notificaciones?.slice(0, 10) || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      
      if (!session.user) {
        router.push('/auth/login');
        return;
      }

      if (session.user.role === 'admin') {
        window.location.href = '/dashboard';
        return;
      }

      setUserData(session.user);
      
      if (session.user.barrio?.id) {
        await fetchClienteData(session.user.barrio.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/auth/login');
    }
  }, [router, fetchClienteData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!userData?.barrio?.id) return;

    const interval = setInterval(() => {
      refreshData();
    }, 120000);

    return () => clearInterval(interval);
  }, [userData?.barrio?.id]);

  const refreshData = async () => {
    if (userData?.barrio?.id && !refreshing) {
      setRefreshing(true);
      await fetchClienteData(userData.barrio.id);
    }
  };

  const getEstadoConfig = (estado: string) => {
    const configs = {
      'Activo': {
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        icon: (
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ),
        message: 'Agua fluyendo normalmente',
        statusText: 'Servicio Activo',
      },
      'Inactivo': {
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        icon: (
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ),
        message: 'Servicio interrumpido',
        statusText: 'Servicio Inactivo',
      },
      'Intermitente': {
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200',
        icon: (
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ),
        message: 'Servicio con intermitencias',
        statusText: 'Servicio Intermitente',
      }
    };
    return configs[estado as keyof typeof configs] || configs.Inactivo;
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} d`;
    return date.toLocaleDateString('es-ES');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleEnviarQueja = () => {
    router.push('/cliente/quejas');
  };

  const handleVerPerfil = () => {
    router.push('/cliente/perfil');
  };

  const handleVerNotificaciones = () => {
    setShowNotifications(false);
    router.push('/cliente/notificaciones');
  };

  const handleVerProgramaciones = () => {
    router.push('/cliente/programaciones');
  };

  const handleVerMantenimientos = () => {
    router.push('/cliente/mantenimientos');
  };

  const marcarNotificacionComoLeida = async (id: number) => {
    try {
      await fetch(`/api/notificaciones/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ leido: true }),
      });
      setNotificaciones(prev => 
        prev.map(n => n.id === id ? { ...n, leido: true } : n)
      );
    } catch (error) {
      console.error('Error marcando notificación:', error);
    }
  };

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leido);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  if (!userData?.barrio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-200">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Barrio no asignado</h2>
            <p className="text-gray-600 text-sm mb-4">
              No tienes un barrio asignado. Contacta al administrador.
            </p>
            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  const estadoConfig = estado ? getEstadoConfig(estado.estado) : getEstadoConfig('Inactivo');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header Compacto */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">Sistema de Agua</h1>
                <p className="text-xs text-gray-500">Panel Cliente</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Botón Refresh */}
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v2.25l-2.47 2.47a.75.75 0 00-.53 1.28h18a.75.75 0 00-.53-1.28L16.5 12V9.75a6 6 0 00-6-6z" />
                  </svg>
                  {notificacionesNoLeidas.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                      {notificacionesNoLeidas.length}
                    </span>
                  )}
                </button>

                {/* Dropdown Notificaciones */}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-40 animate-slide-down">
                      <div className="p-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-900 text-sm">Notificaciones</h3>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {notificacionesNoLeidas.length} nuevas
                          </span>
                        </div>
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {notificaciones.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v2.25l-2.47 2.47a.75.75 0 00-.53 1.28h18a.75.75 0 00-.53-1.28L16.5 12V9.75a6 6 0 00-6-6z" />
                            </svg>
                            <p className="text-sm">No hay notificaciones</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notificaciones.slice(0, 5).map((notificacion) => (
                              <div
                                key={notificacion.id}
                                className={`p-3 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                                  !notificacion.leido ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                                }`}
                                onClick={() => marcarNotificacionComoLeida(notificacion.id)}
                              >
                                <div className="flex items-start space-x-2">
                                  <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt=1.5 ${
                                    notificacion.leido ? 'bg-gray-300' : 'bg-blue-500 animate-pulse'
                                  }`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-800 line-clamp-2">
                                      {notificacion.mensaje}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {getTimeAgo(notificacion.fecha)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-2 border-t border-gray-200">
                        <button
                          onClick={handleVerNotificaciones}
                          className="w-full text-center text-blue-600 hover:text-blue-700 font-medium py-1.5 rounded-lg hover:bg-blue-50 transition-colors text-xs"
                        >
                          Ver todas las notificaciones
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-1 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium text-xs">
                    {userData.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-lg border border-gray-200 z-40 animate-slide-down">
                      <div className="p-3 border-b border-gray-200">
                        <p className="font-medium text-gray-900 text-sm truncate">{userData.name}</p>
                        <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={handleVerPerfil}
                          className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Mi Perfil</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 px-3 sm:px-6 lg:px-8">
        {/* Estado Principal - Compacto */}
        <div className="mb-4 animate-fade-in">
          <div className={`rounded-xl shadow-sm p-4 border-2 ${estadoConfig.borderColor} ${estadoConfig.bgColor}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-white shadow-sm ${estadoConfig.textColor}`}>
                  {estadoConfig.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Estado del Servicio</h2>
                  <p className={`text-base font-semibold ${estadoConfig.textColor}`}>
                    {estadoConfig.message}
                  </p>
                  {estado && (
                    <p className="text-xs text-gray-600 mt-1">
                      Actualizado {getTimeAgo(estado.fecha_actualizacion)}
                    </p>
                  )}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full bg-white font-bold text-base border ${estadoConfig.borderColor} ${estadoConfig.textColor} shadow-sm`}>
                {estado?.estado || 'No disponible'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Columna Principal - Mi Barrio y Avisos */}
          <div className="xl:col-span-2 space-y-4">
            {/* Tarjeta Mi Barrio */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Mi Barrio - {userData.barrio.nombre}</span>
                </h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {estadoConfig.statusText}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Última actualización</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {estado ? getTimeAgo(estado.fecha_actualizacion) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Estado actual</p>
                      <p className={`font-semibold text-sm ${estadoConfig.textColor}`}>
                        {estadoConfig.statusText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Avisos Recientes */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                  <span>Avisos Recientes</span>
                </h3>
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                  {avisos.length} avisos
                </span>
              </div>
              
              <div className="space-y-3">
                {avisos.length > 0 ? (
                  avisos.map((aviso, index) => (
                    <div 
                      key={aviso.id} 
                      className="border-l-2 border-orange-500 bg-orange-50/50 rounded-r-lg p-3 hover:bg-orange-100 transition-all duration-200"
                      style={{animationDelay: `${0.2 + index * 0.1}s`}}
                    >
                      <p className="text-gray-800 text-sm">{aviso.mensaje}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{getTimeAgo(aviso.fecha)}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">No hay avisos recientes</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar de Acciones Rápidas */}
          <div className="space-y-4">
            {/* Acciones Rápidas */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Acciones Rápidas</span>
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={handleEnviarQueja}
                  className="w-full flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <span className="font-medium text-red-800 text-sm">Reportar Problema</span>
                  </div>
                  <svg className="w-4 h-4 text-red-600 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button 
                  onClick={handleVerProgramaciones}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-medium text-blue-800 text-sm">Programaciones</span>
                  </div>
                  <svg className="w-4 h-4 text-blue-600 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button 
                  onClick={handleVerMantenimientos}
                  className="w-full flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                    </div>
                    <span className="font-medium text-orange-800 text-sm">Mantenimientos</span>
                  </div>
                  <svg className="w-4 h-4 text-orange-600 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button 
                  onClick={handleVerPerfil}
                  className="w-full flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="font-medium text-green-800 text-sm">Mi Perfil</span>
                  </div>
                  <svg className="w-4 h-4 text-green-600 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button 
                  onClick={handleVerNotificaciones}
                  className="w-full flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v2.25l-2.47 2.47a.75.75 0 00-.53 1.28h18a.75.75 0 00-.53-1.28L16.5 12V9.75a6 6 0 00-6-6z" />
                      </svg>
                    </div>
                    <span className="font-medium text-indigo-800 text-sm">Notificaciones</span>
                  </div>
                  <svg className="w-4 h-4 text-indigo-600 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-sm p-4 text-white animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <h3 className="text-sm font-bold mb-3 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Contacto de Emergencia</span>
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs opacity-90">Teléfono 24/7</p>
                    <p className="font-semibold text-sm">1234567890</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs opacity-90">Email</p>
                    <p className="font-semibold text-sm">soporte@sjnwater.net</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-3 bg-white text-blue-600 py-1.5 px-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-xs">
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}