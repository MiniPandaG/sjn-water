'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

interface Notificacion {
  id: number;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  noLeidas: number;
  pages: number;
}

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificacionToDelete, setNotificacionToDelete] = useState<Notificacion | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    noLeidas: 0,
    pages: 0
  });

  useEffect(() => {
    fetchNotificaciones();
  }, [pagination.page]);

  const fetchNotificaciones = async () => {
    try {
      const response = await fetch(`/api/notificaciones?page=${pagination.page}&limit=${pagination.limit}`);
      if (response.ok) {
        const data = await response.json();
        setNotificaciones(data.notificaciones);
        setPagination(prev => ({
          ...prev,
          ...data.pagination
        }));
      }
    } catch (error) {
      console.error('Error fetching notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const marcarComoLeido = async (id: number) => {
    try {
      const response = await fetch(`/api/notificaciones/${id}`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotificaciones(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, leido: true } : notif
          )
        );
        setPagination(prev => ({
          ...prev,
          noLeidas: Math.max(0, prev.noLeidas - 1)
        }));
      }
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const noLeidas = notificaciones.filter(notif => !notif.leido);
      await Promise.all(
        noLeidas.map(notif => 
          fetch(`/api/notificaciones/${notif.id}`, {
            method: 'PATCH'
          })
        )
      );
      
      setNotificaciones(prev =>
        prev.map(notif => ({ ...notif, leido: true }))
      );
      setPagination(prev => ({
        ...prev,
        noLeidas: 0
      }));
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  const handleDeleteClick = (notificacion: Notificacion) => {
    setNotificacionToDelete(notificacion);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!notificacionToDelete) return;

    try {
      const response = await fetch(`/api/notificaciones/${notificacionToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchNotificaciones();
      }
    } catch (error) {
      console.error('Error deleting notificacion:', error);
    } finally {
      setShowDeleteModal(false);
      setNotificacionToDelete(null);
    }
  };

  const getTimeAgo = (fecha: string) => {
    const now = new Date();
    const notificationDate = new Date(fecha);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return notificationDate.toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Notificaciones</h1>
            <p className="text-gray-600 mt-2">Mantente informado sobre el servicio de agua</p>
          </div>
          {pagination.noLeidas > 0 && (
            <button
              onClick={marcarTodasComoLeidas}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total de Notificaciones</div>
            <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">No Leídas</div>
            <div className="text-2xl font-bold text-blue-600">{pagination.noLeidas}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Leídas</div>
            <div className="text-2xl font-bold text-green-600">{pagination.total - pagination.noLeidas}</div>
          </div>
        </div>

        {/* Notificaciones List */}
        <div className="space-y-4">
          {notificaciones.map((notificacion) => (
            <div
              key={notificacion.id}
              className={`bg-white rounded-lg shadow border-l-4 ${
                notificacion.leido 
                  ? 'border-gray-300' 
                  : 'border-blue-500 bg-blue-50'
              } transition-all hover:shadow-md`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm ${
                      notificacion.leido ? 'text-gray-700' : 'text-gray-900 font-medium'
                    }`}>
                      {notificacion.mensaje}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(notificacion.fecha)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(notificacion.fecha).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notificacion.leido && (
                      <button
                        onClick={() => marcarComoLeido(notificacion.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        Marcar como leída
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(notificacion)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notificaciones.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
            <p className="text-gray-500">Estás al día con todas las notificaciones.</p>
          </div>
        )}

        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-3 border-t border-gray-200 rounded-b-lg shadow mt-6">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>{' '}
                  a{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  de <span className="font-medium">{pagination.total}</span> notificaciones
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para eliminar */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setNotificacionToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Notificación"
          message="¿Estás seguro de que deseas eliminar esta notificación? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      </div>
    </div>
  );
}