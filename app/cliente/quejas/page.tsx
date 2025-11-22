// app/cliente/quejas/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Queja {
  id: number;
  mensaje: string;
  fecha: string;
  estado: 'pendiente' | 'en_proceso' | 'resuelta';
  barrio: {
    id: number;
    nombre: string;
  };
}

export default function QuejasPage() {
  const router = useRouter();
  const [quejas, setQuejas] = useState<Queja[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mensaje: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      await fetchQuejas();
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/auth/login');
    }
  };

const fetchQuejas = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/quejas');
    
    if (response.ok) {
      const data = await response.json();
      // El API ya filtra por usuario, no necesitas filtrar manualmente
      setQuejas(data);
    } else {
      console.error('Error fetching quejas:', response.status);
      setError('Error al cargar las quejas');
    }
  } catch (error) {
    console.error('Error fetching quejas:', error);
    setError('Error de conexión');
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!formData.mensaje.trim()) {
      setError('Por favor describe el problema');
      setSubmitting(false);
      return;
    }

    if (formData.mensaje.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      setSubmitting(false);
      return;
    }

    try {
const response = await fetch('/api/quejas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    mensaje: formData.mensaje.trim()

  }),
});

      if (!response.ok) {
        throw new Error('Error al enviar la queja');
      }

      setSuccess('Queja enviada correctamente. Te notificaremos sobre su estado.');
      setFormData({ mensaje: '' });
      setShowForm(false);
      
      // Recargar la lista de quejas
      await fetchQuejas();

    } catch (error) {
      setError('Error al enviar la queja. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const eliminarQueja = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta queja?')) {
      return;
    }

    try {
      const response = await fetch(`/api/quejas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la queja');
      }

      setQuejas(prev => prev.filter(queja => queja.id !== id));
      setSuccess('Queja eliminada correctamente');
    } catch (error) {
      setError('Error al eliminar la queja');
    }
  };

  const getEstadoConfig = (estado: string) => {
    const configs = {
      'pendiente': {
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Pendiente'
      },
      'en_proceso': {
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        label: 'En Proceso'
      },
      'resuelta': {
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        label: 'Resuelta'
      }
    };
    return configs[estado as keyof typeof configs] || configs.pendiente;
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

  const quejasPendientes = quejas.filter(q => q.estado === 'pendiente').length;
  const quejasResueltas = quejas.filter(q => q.estado === 'resuelta').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando quejas...</p>
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
                <h1 className="text-lg font-bold text-gray-900">Mis Quejas</h1>
                <p className="text-xs text-gray-500">Reporta y gestiona problemas</p>
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
        {/* Header de Quejas */}
        <div className="mb-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Centro de Quejas
                </h2>
                <p className="text-gray-600 text-sm">
                  Reporta problemas con el servicio de agua
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">{quejasPendientes} pendientes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">{quejasResueltas} resueltas</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center space-x-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Nueva Queja</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Nueva Queja */}
        {showForm && (
          <div className="mb-4 animate-fade-in-up">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Reportar Nuevo Problema</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-4 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del problema *
                  </label>
                  <textarea
                    id="mensaje"
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ mensaje: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    placeholder="Describe detalladamente el problema que has observado. Incluye información como: ubicación exacta, hora en que ocurrió, tipo de problema (falta de agua, baja presión, agua turbia, etc.)"
                    required
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Mínimo 10 caracteres
                    </p>
                    <p className={`text-xs ${
                      formData.mensaje.length < 10 ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {formData.mensaje.length}/500
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-blue-900 text-sm mb-1">Consejos para una buena descripción:</h4>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Sé específico sobre la ubicación y hora del problema</li>
                        <li>• Describe los síntomas (sin agua, baja presión, color extraño)</li>
                        <li>• Menciona si afecta solo a tu vivienda o a todo el barrio</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !formData.mensaje.trim() || formData.mensaje.length < 10}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </span>
                    ) : (
                      'Enviar Queja'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ mensaje: '' });
                      setError('');
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-200 font-medium transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Quejas */}
        <div className="space-y-3 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          {quejas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">No hay quejas registradas</h3>
              <p className="text-gray-600 text-sm mb-4">
                {showForm 
                  ? 'Completa el formulario para reportar un problema' 
                  : 'Haz clic en "Nueva Queja" para reportar un problema con el servicio'
                }
              </p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm"
                >
                  Reportar Primer Problema
                </button>
              )}
            </div>
          ) : (
            quejas.map((queja, index) => {
              const estadoConfig = getEstadoConfig(queja.estado);
              
              return (
                <div
                  key={queja.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md animate-fade-in-up"
                  style={{animationDelay: `${0.2 + index * 0.05}s`}}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${estadoConfig.bgColor} ${estadoConfig.textColor}`}>
                            {estadoConfig.icon}
                            <span>{estadoConfig.label}</span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{getTimeAgo(queja.fecha)}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-800 text-sm leading-relaxed mb-3">
                          {queja.mensaje}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{queja.barrio.nombre}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
                        {queja.estado === 'pendiente' && (
                          <button
                            onClick={() => eliminarQueja(queja.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                            title="Eliminar queja"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Información adicional */}
        {quejas.length > 0 && (
          <div className="mt-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-blue-900 text-sm mb-1">Información sobre el proceso de quejas</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Las quejas en estado "Pendiente" pueden ser eliminadas</li>
                    <li>• Una vez en proceso o resueltas, las quejas no se pueden eliminar</li>
                    <li>• Recibirás notificaciones sobre el estado de tus quejas</li>
                    <li>• El tiempo de respuesta depende de la complejidad del problema</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}