'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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

interface Programacion {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  barrio: {
    id: number;
    nombre: string;
  };
}

interface Mantenimiento {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  barrio: {
    id: number;
    nombre: string;
  };
}

export default function MiBarrioPage() {
  const { data: session, status } = useSession();
  const [estado, setEstado] = useState<EstadoAgua | null>(null);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('estado');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      redirect('/auth/login');
    }

    if (session.user.barrio) {
      fetchData();
    }
  }, [session, status]);

  const fetchData = async () => {
    try {
      if (!session?.user?.barrio?.id) return;

      const [estadoRes, avisosRes, programacionesRes, mantenimientosRes] = await Promise.all([
        fetch(`/api/estado?barrio_id=${session.user.barrio.id}`),
        fetch(`/api/avisos?barrio_id=${session.user.barrio.id}`),
        fetch(`/api/programaciones?barrio_id=${session.user.barrio.id}`),
        fetch(`/api/mantenimientos?barrio_id=${session.user.barrio.id}`)
      ]);

      if (estadoRes.ok) {
        const estadoData = await estadoRes.json();
        setEstado(estadoData[0] || null);
      }

      if (avisosRes.ok) {
        const avisosData = await avisosRes.json();
        setAvisos(avisosData.slice(0, 5)); // Solo últimos 5 avisos
      }

      if (programacionesRes.ok) {
        const programacionesData = await programacionesRes.json();
        setProgramaciones(programacionesData.slice(0, 3)); // Solo próximas 3 programaciones
      }

      if (mantenimientosRes.ok) {
        const mantenimientosData = await mantenimientosRes.json();
        setMantenimientos(mantenimientosData.slice(0, 3)); // Solo próximos 3 mantenimientos
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoConfig = (estado: string) => {
    const configs = {
      'Activo': {
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        icon: '💧',
        message: 'Servicio funcionando normalmente'
      },
      'Inactivo': {
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        icon: '❌',
        message: 'Servicio interrumpido'
      },
      'Intermitente': {
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200',
        icon: '⚠️',
        message: 'Servicio con intermitencias'
      }
    };
    return configs[estado as keyof typeof configs] || configs.Inactivo;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return date.toLocaleDateString('es-ES');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de tu barrio...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.barrio) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏘️</span>
            </div>
            <h2 className="text-xl font-bold text-yellow-800 mb-2">
              Barrio no asignado
            </h2>
            <p className="text-yellow-700 mb-4">
              No tienes un barrio asignado en tu perfil.
            </p>
            <Link 
              href="/dashboard/perfil" 
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              Actualizar Perfil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const estadoConfig = estado ? getEstadoConfig(estado.estado) : getEstadoConfig('Inactivo');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {session.user.barrio.nombre}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Información en tiempo real sobre el servicio de agua
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm px-4 py-3">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-sm text-gray-600">Bienvenido</p>
                  <p className="font-semibold text-gray-900">{session.user.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado Principal */}
        <div className={`rounded-2xl shadow-lg p-6 mb-8 ${estadoConfig.bgColor} ${estadoConfig.borderColor} border-2`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{estadoConfig.icon}</div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Estado del Servicio</h2>
                <p className={`text-lg font-semibold ${estadoConfig.textColor}`}>
                  {estadoConfig.message}
                </p>
                {estado && (
                  <p className="text-sm text-gray-600 mt-1">
                    Actualizado {getTimeAgo(estado.fecha_actualizacion)}
                  </p>
                )}
              </div>
            </div>
            <div className={`px-6 py-3 rounded-full ${estadoConfig.bgColor} ${estadoConfig.textColor} font-bold text-lg border ${estadoConfig.borderColor}`}>
              {estado?.estado || 'No disponible'}
            </div>
          </div>
        </div>

        {/* Tabs de Información */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {[
                { id: 'estado', name: '📊 Estado', count: estado ? 1 : 0 },
                { id: 'avisos', name: '📢 Avisos', count: avisos.length },
                { id: 'programaciones', name: '📅 Programaciones', count: programaciones.length },
                { id: 'mantenimientos', name: '🔧 Mantenimientos', count: mantenimientos.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-1 px-2 text-xs rounded-full ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Contenido de Estado */}
            {activeTab === 'estado' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                    <div className="text-3xl mb-2">💧</div>
                    <h3 className="font-bold text-lg mb-1">Servicio Principal</h3>
                    <p className="text-blue-100">{estadoConfig.message}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                    <div className="text-3xl mb-2">⏰</div>
                    <h3 className="font-bold text-lg mb-1">Disponibilidad</h3>
                    <p className="text-green-100">
                      {programaciones.length > 0 ? 'Horarios programados' : 'Sin programación específica'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
                    <div className="text-3xl mb-2">📈</div>
                    <h3 className="font-bold text-lg mb-1">Historial</h3>
                    <p className="text-purple-100">Estable en las últimas 24h</p>
                  </div>
                </div>
                
                {estado && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Última Actualización</h4>
                    <p className="text-gray-600">{formatDate(estado.fecha_actualizacion)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Contenido de Avisos */}
            {activeTab === 'avisos' && (
              <div className="space-y-4">
                {avisos.length > 0 ? (
                  avisos.map((aviso) => (
                    <div key={aviso.id} className="border-l-4 border-blue-500 bg-blue-50/50 rounded-r-lg p-4 hover:bg-blue-50 transition">
                      <p className="text-gray-800 text-lg">{aviso.mensaje}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-gray-500">
                          {getTimeAgo(aviso.fecha)}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          {formatDate(aviso.fecha)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay avisos</h3>
                    <p className="text-gray-600">No hay avisos recientes para tu barrio.</p>
                  </div>
                )}
              </div>
            )}

            {/* Contenido de Programaciones */}
            {activeTab === 'programaciones' && (
              <div className="space-y-4">
                {programaciones.length > 0 ? (
                  programaciones.map((programacion) => (
                    <div key={programacion.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-green-900 mb-2">
                            {programacion.descripcion || 'Programación de agua'}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-green-700">
                            <span>📅 Inicio: {formatDate(programacion.fecha_inicio)}</span>
                            <span>⏰ Fin: {formatDate(programacion.fecha_fin)}</span>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                          Activa
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📅</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin programaciones</h3>
                    <p className="text-gray-600">No hay programaciones activas para tu barrio.</p>
                  </div>
                )}
              </div>
            )}

            {/* Contenido de Mantenimientos */}
            {activeTab === 'mantenimientos' && (
              <div className="space-y-4">
                {mantenimientos.length > 0 ? (
                  mantenimientos.map((mantenimiento) => (
                    <div key={mantenimiento.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-orange-900 mb-2">
                            {mantenimiento.descripcion || 'Mantenimiento programado'}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-orange-700">
                            <span>🔧 Inicio: {formatDate(mantenimiento.fecha_inicio)}</span>
                            <span>✅ Fin: {formatDate(mantenimiento.fecha_fin)}</span>
                          </div>
                        </div>
                        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                          Programado
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔧</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin mantenimientos</h3>
                    <p className="text-gray-600">No hay mantenimientos programados para tu barrio.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link 
            href="/dashboard/enviar-queja"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group border-2 border-transparent hover:border-blue-200"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📝</div>
            <h3 className="font-bold text-gray-900 mb-2">Enviar Queja</h3>
            <p className="text-gray-600 text-sm">Reporta problemas con el servicio de agua</p>
          </Link>

          <Link 
            href="/dashboard/notificaciones"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group border-2 border-transparent hover:border-green-200"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🔔</div>
            <h3 className="font-bold text-gray-900 mb-2">Notificaciones</h3>
            <p className="text-gray-600 text-sm">Revisa tus alertas y avisos importantes</p>
          </Link>

          <Link 
            href="/dashboard/perfil"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group border-2 border-transparent hover:border-purple-200"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">👤</div>
            <h3 className="font-bold text-gray-900 mb-2">Mi Perfil</h3>
            <p className="text-gray-600 text-sm">Actualiza tu información personal</p>
          </Link>

          <button 
            onClick={fetchData}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group border-2 border-transparent hover:border-orange-200"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🔄</div>
            <h3 className="font-bold text-gray-900 mb-2">Actualizar</h3>
            <p className="text-gray-600 text-sm">Refrescar información en tiempo real</p>
          </button>
        </div>
      </div>
    </div>
  );
}