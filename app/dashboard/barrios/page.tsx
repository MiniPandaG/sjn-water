'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

interface Barrio {
  id: number;
  nombre: string;
  _count?: {
    users: number;
    estado_agua: number;
  };
}

export default function BarriosPage() {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [barrioToDelete, setBarrioToDelete] = useState<Barrio | null>(null);
  const [formData, setFormData] = useState({
    nombre: ''
  });
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  useEffect(() => {
    fetchBarrios();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: 'success', message: '' });
    }, 3000);
  };

  const fetchBarrios = async () => {
    try {
      const response = await fetch('/api/barrios');
      if (response.ok) {
        const data = await response.json();
        setBarrios(data);
      }
    } catch (error) {
      console.error('Error fetching barrios:', error);
      showNotification('error', 'Error al cargar los barrios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/barrios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowModal(false);
        setFormData({ nombre: '' });
        fetchBarrios();
        showNotification('success', 'Barrio creado correctamente');
      } else {
        showNotification('error', data.error || 'Error al crear barrio');
      }
    } catch (error) {
      console.error('Error creating barrio:', error);
      showNotification('error', 'Error al crear barrio');
    }
  };

  const handleDeleteClick = (barrio: Barrio) => {
    setBarrioToDelete(barrio);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!barrioToDelete) return;

    try {
      const response = await fetch(`/api/barrios/${barrioToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        fetchBarrios();
        showNotification('success', 'Barrio eliminado correctamente');
      } else {
        showNotification('error', data.error || 'Error al eliminar barrio');
      }
    } catch (error) {
      console.error('Error deleting barrio:', error);
      showNotification('error', 'Error al eliminar barrio');
    } finally {
      setShowDeleteModal(false);
      setBarrioToDelete(null);
    }
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

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Barrios</h1>
            <p className="text-gray-600 mt-2">Administra los barrios del sistema</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Agregar Barrio
          </button>
        </div>

        {/* Barrios Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuarios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {barrios.map((barrio) => (
                  <tr key={barrio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {barrio.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {barrio.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {barrio._count?.users || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteClick(barrio)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {barrios.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay barrios</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer barrio.</p>
          </div>
        )}

        {/* Modal para agregar barrio */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Agregar Barrio</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Barrio
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="Ej: Centro, Norte, etc."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Crear Barrio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmación para eliminar */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setBarrioToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Barrio"
          message={`¿Estás seguro de que deseas eliminar el barrio "${barrioToDelete?.nombre}"? ${
            barrioToDelete?._count?.users ? `Este barrio tiene ${barrioToDelete._count.users} usuario(s) asociado(s) y no se puede eliminar.` : 'Esta acción no se puede deshacer.'
          }`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type={barrioToDelete?._count?.users ? 'warning' : 'danger'}
        />
      </div>
    </div>
  );
}