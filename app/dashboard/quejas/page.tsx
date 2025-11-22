// app/dashboard/quejas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

interface Queja {
  id: number;
  mensaje: string;
  fecha: string;
  estado: 'pendiente' | 'en_proceso' | 'resuelta';
  usuario: {
    id: number;
    name: string;
    email: string;
  };
  barrio: {
    id: number;
    nombre: string;
  };
}

export default function QuejasAdminPage() {
  const [quejas, setQuejas] = useState<Queja[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQueja, setSelectedQueja] = useState<Queja | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quejaToDelete, setQuejaToDelete] = useState<Queja | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'en_proceso' | 'resuelta'>('todos');

  useEffect(() => {
    fetchQuejas();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: 'success', message: '' });
    }, 3000);
  };

  const fetchQuejas = async () => {
    try {
      const response = await fetch('/api/quejas');
      if (response.ok) {
        const data = await response.json();
        setQuejas(data);
      }
    } catch (error) {
      console.error('Error fetching quejas:', error);
      showNotification('error', 'Error al cargar las quejas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (queja: Queja) => {
    setQuejaToDelete(queja);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quejaToDelete) return;

    try {
      const response = await fetch(`/api/quejas/${quejaToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        fetchQuejas();
        showNotification('success', 'Queja eliminada correctamente');
        if (selectedQueja?.id === quejaToDelete.id) {
          setSelectedQueja(null);
        }
      } else {
        showNotification('error', data.error || 'Error al eliminar queja');
      }
    } catch (error) {
      console.error('Error deleting queja:', error);
      showNotification('error', 'Error al eliminar queja');
    } finally {
      setShowDeleteModal(false);
      setQuejaToDelete(null);
    }
  };

  const cambiarEstadoQueja = async (quejaId: number, nuevoEstado: 'pendiente' | 'en_proceso' | 'resuelta') => {
    try {
      const response = await fetch(`/api/quejas/${quejaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchQuejas();
        showNotification('success', `Queja marcada como ${getEstadoConfig(nuevoEstado).label}`);
        
        // Actualizar la queja seleccionada si está abierta
        if (selectedQueja?.id === quejaId) {
          setSelectedQueja({ ...selectedQueja, estado: nuevoEstado });
        }
      } else {
        showNotification('error', data.error || 'Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error updating queja:', error);
      showNotification('error', 'Error al cambiar estado');
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
    return date.toLocaleDateString('es-ES');
  };

  // Filtrar quejas según el estado seleccionado
  const quejasFiltradas = filtroEstado === 'todos' 
    ? quejas 
    : quejas.filter(queja => queja.estado === filtroEstado);

  // Estadísticas
  const estadisticas = {
    total: quejas.length,
    pendientes: quejas.filter(q => q.estado === 'pendiente').length,
    enProceso: quejas.filter(q => q.estado === 'en_proceso').length,
    resueltas: quejas.filter(q => q.estado === 'resuelta').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Notificación */}
        {notification.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Quejas</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Revisa y gestiona las quejas y comentarios de los usuarios</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.enProceso}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resueltas</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.resueltas}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">Filtrar por estado</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroEstado('todos')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filtroEstado === 'todos'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos ({estadisticas.total})
              </button>
              <button
                onClick={() => setFiltroEstado('pendiente')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filtroEstado === 'pendiente'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pendientes ({estadisticas.pendientes})
              </button>
              <button
                onClick={() => setFiltroEstado('en_proceso')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filtroEstado === 'en_proceso'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                En Proceso ({estadisticas.enProceso})
              </button>
              <button
                onClick={() => setFiltroEstado('resuelta')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filtroEstado === 'resuelta'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Resueltas ({estadisticas.resueltas})
              </button>
            </div>
          </div>
        </div>

        {/* Quejas List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barrio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensaje
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quejasFiltradas.map((queja) => {
                  const estadoConfig = getEstadoConfig(queja.estado);
                  return (
                    <tr key={queja.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {queja.usuario.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{queja.usuario.name}</div>
                            <div className="text-sm text-gray-500">{queja.usuario.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 bg-gray-100 rounded-full px-3 py-1 inline-block">
                          {queja.barrio.nombre}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {queja.mensaje}
                        </div>
                        <button
                          onClick={() => setSelectedQueja(queja)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors mt-1"
                        >
                          Ver mensaje completo
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={queja.estado}
                          onChange={(e) => cambiarEstadoQueja(queja.id, e.target.value as any)}
                          className={`text-sm font-medium rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-offset-2 ${estadoConfig.bgColor} ${estadoConfig.textColor} focus:ring-${estadoConfig.color}-500`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_proceso">En Proceso</option>
                          <option value="resuelta">Resuelta</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {getTimeAgo(queja.fecha)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setSelectedQueja(queja)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleDeleteClick(queja)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {quejasFiltradas.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filtroEstado === 'todos' ? 'No hay quejas' : `No hay quejas ${filtroEstado === 'pendiente' ? 'pendientes' : filtroEstado === 'en_proceso' ? 'en proceso' : 'resueltas'}`}
            </h3>
            <p className="text-gray-500">
              {filtroEstado === 'todos' 
                ? 'No se han reportado quejas aún.' 
                : `No hay quejas en estado "${filtroEstado === 'pendiente' ? 'pendiente' : filtroEstado === 'en_proceso' ? 'en proceso' : 'resuelta'}"`}
            </p>
          </div>
        )}

        {/* Modal para ver queja completa */}
        {selectedQueja && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Detalles de la Queja</h2>
                <button
                  onClick={() => setSelectedQueja(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuario
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {selectedQueja.usuario.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{selectedQueja.usuario.name}</p>
                        <p className="text-gray-600 text-sm">{selectedQueja.usuario.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Barrio
                    </label>
                    <p className="text-gray-900 font-medium">{selectedQueja.barrio.nombre}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={selectedQueja.estado}
                    onChange={(e) => cambiarEstadoQueja(selectedQueja.id, e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="resuelta">Resuelta</option>
                  </select>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Reporte
                  </label>
                  <p className="text-gray-900">{new Date(selectedQueja.fecha).toLocaleString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mensaje de la Queja
                  </label>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {selectedQueja.mensaje}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedQueja(null)}
                  className="px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    handleDeleteClick(selectedQueja);
                    setSelectedQueja(null);
                  }}
                  className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  Eliminar Queja
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para eliminar */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setQuejaToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Queja"
          message={`¿Estás seguro de que deseas eliminar la queja del usuario "${quejaToDelete?.usuario.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      </div>
    </div>
  );
}