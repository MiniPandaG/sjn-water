// app/cliente/notificaciones/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Notificacion {
  id: number;
  mensaje: string;
  tipo: string;
  fecha: string;
  leido: boolean;
}

export default function NotificacionesPage() {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [filtro, setFiltro] = useState<'todas' | 'no-leidas'>('todas');
  const [marcandoTodas, setMarcandoTodas] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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
      await fetchNotificaciones();
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/auth/login');
    }
  };

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notificaciones?limit=50');
      
      if (response.ok) {
        const data = await response.json();
        setNotificaciones(data.notificaciones || data);
      }
    } catch (error) {
      console.error('Error fetching notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (id: number) => {
    try {
      await fetch(`/api/notificaciones/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leido: true }),
      });

      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, leido: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      setMarcandoTodas(true);
      const noLeidas = notificaciones.filter(n => !n.leido);
      
      await Promise.all(
        noLeidas.map(notif =>
          fetch(`/api/notificaciones/${notif.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ leido: true }),
          })
        )
      );

      setNotificaciones(prev => 
        prev.map(notif => ({ ...notif, leido: true }))
      );
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    } finally {
      setMarcandoTodas(false);
    }
  };

  const eliminarNotificacion = async (id: number) => {
    try {
      await fetch(`/api/notificaciones/${id}`, {
        method: 'DELETE',
      });

      setNotificaciones(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  const getTipoConfig = (tipo: string) => {
    const configs = {
      'general': {
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      'aviso': {
        color: 'orange',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      },
      'estado': {
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      'programacion': {
        color: 'purple',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      },
      'mantenimiento': {
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        )
      }
    };
    return configs[tipo as keyof typeof configs] || configs.general;
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} d`;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const notificacionesFiltradas = notificaciones.filter(notif => {
    if (filtro === 'no-leidas') {
      return !notif.leido;
    }
    return true;
  });

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leido);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-2">
              <Link 
                href="/cliente"
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Notificaciones</h1>
                <p className="text-xs text-gray-500">Tus alertas y avisos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-right hidden xs:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{userData?.name}</p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">{userData?.barrio?.nombre}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-4 px-3 sm:px-6 lg:px-8">
        {/* Header de Notificaciones */}
        <div className="mb-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Centro de Notificaciones
                </h2>
                <p className="text-gray-600 text-sm">
                  Estado de tu servicio de agua
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {notificacionesNoLeidas.length} sin leer
                </div>
                {notificacionesNoLeidas.length > 0 && (
                  <button
                    onClick={marcarTodasComoLeidas}
                    disabled={marcandoTodas}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-1 text-xs"
                  >
                    {marcandoTodas ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        <span>Marcando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Marcar todas</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Estadísticas */}
        <div className="mb-4 animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="flex bg-gray-100 rounded-md p-0.5">
                  <button
                    onClick={() => setFiltro('todas')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                      filtro === 'todas'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setFiltro('no-leidas')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                      filtro === 'no-leidas'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    No leídas
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-600">
                {notificacionesFiltradas.length} de {notificaciones.length}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Notificaciones */}
        <div className="space-y-3 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          {notificacionesFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v2.25l-2.47 2.47a.75.75 0 00-.53 1.28h18a.75.75 0 00-.53-1.28L16.5 12V9.75a6 6 0 00-6-6z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                {filtro === 'no-leidas' ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {filtro === 'no-leidas' 
                  ? '¡Excelente! Has leído todas tus notificaciones.' 
                  : 'Todavía no has recibido ninguna notificación.'
                }
              </p>
              {filtro === 'no-leidas' && (
                <button
                  onClick={() => setFiltro('todas')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm"
                >
                  Ver todas
                </button>
              )}
            </div>
          ) : (
            notificacionesFiltradas.map((notificacion, index) => {
              const tipoConfig = getTipoConfig(notificacion.tipo);
              
              return (
                <div
                  key={notificacion.id}
                  className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                    notificacion.leido 
                      ? 'border-gray-200' 
                      : 'border-blue-200 bg-blue-50/50'
                  }`}
                  style={{animationDelay: `${0.2 + index * 0.05}s`}}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Icono del tipo */}
                        <div className={`p-2 rounded-lg ${tipoConfig.bgColor} ${tipoConfig.textColor} flex-shrink-0`}>
                          {tipoConfig.icon}
                        </div>
                        
                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipoConfig.bgColor} ${tipoConfig.textColor}`}>
                              {notificacion.tipo.charAt(0).toUpperCase() + notificacion.tipo.slice(1)}
                            </span>
                            {!notificacion.leido && (
                              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium animate-pulse">
                                Nuevo
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-800 text-sm leading-relaxed">
                            {notificacion.mensaje}
                          </p>
                          
                          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{getTimeAgo(notificacion.fecha)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                        {!notificacion.leido && (
                          <button
                            onClick={() => marcarComoLeida(notificacion.id)}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200"
                            title="Marcar como leída"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        
                        <button
                          onClick={() => eliminarNotificacion(notificacion.id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                          title="Eliminar notificación"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Paginación o mensaje final */}
        {notificacionesFiltradas.length > 0 && (
          <div className="mt-6 text-center animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-gray-600 text-sm mb-3">
                {notificacionesFiltradas.length === notificaciones.length 
                  ? 'Has llegado al final de tus notificaciones'
                  : `Mostrando ${notificacionesFiltradas.length} notificaciones filtradas`
                }
              </p>
              {notificacionesNoLeidas.length > 0 && (
                <button
                  onClick={marcarTodasComoLeidas}
                  disabled={marcandoTodas}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
                >
                  {marcandoTodas ? 'Marcando...' : 'Marcar todas como leídas'}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}