'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

interface Barrio {
  id: number;
  nombre: string;
}

interface Aviso {
  id: number;
  mensaje: string;
  fecha: string;
  barrio: Barrio;
}

export default function AvisosPage() {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avisoToDelete, setAvisoToDelete] = useState<Aviso | null>(null);
  const [formData, setFormData] = useState({
    barrio_id: '',
    mensaje: ''
  });
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: 'success', message: '' });
    }, 3000);
  };

  const fetchData = async () => {
    try {
      const [barriosRes, avisosRes] = await Promise.all([
        fetch('/api/barrios'),
        fetch('/api/avisos')
      ]);

      if (barriosRes.ok) {
        const barriosData = await barriosRes.json();
        setBarrios(barriosData);
      }

      if (avisosRes.ok) {
        const avisosData = await avisosRes.json();
        setAvisos(avisosData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('error', 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/avisos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowModal(false);
        setFormData({ barrio_id: '', mensaje: '' });
        fetchData();
        showNotification('success', 'Aviso creado correctamente');
      } else {
        showNotification('error', data.error || 'Error al crear aviso');
      }
    } catch (error) {
      console.error('Error creating aviso:', error);
      showNotification('error', 'Error al crear aviso');
    }
  };

  const handleDeleteClick = (aviso: Aviso) => {
    setAvisoToDelete(aviso);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!avisoToDelete) return;

    try {
      const response = await fetch(`/api/avisos/${avisoToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        fetchData();
        showNotification('success', 'Aviso eliminado correctamente');
      } else {
        showNotification('error', data.error || 'Error al eliminar aviso');
      }
    } catch (error) {
      console.error('Error deleting aviso:', error);
      showNotification('error', 'Error al eliminar aviso');
    } finally {
      setShowDeleteModal(false);
      setAvisoToDelete(null);
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
            <h1 className="text-3xl font-bold text-gray-900">Avisos por Barrio</h1>
            <p className="text-gray-600 mt-2">Gestiona avisos específicos para cada barrio</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            
            <span>Crear Aviso</span>
          </button>
        </div>

        {/* Avisos List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barrio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensaje
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {avisos.map((aviso) => (
                  <tr key={aviso.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">
                          {aviso.barrio.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md bg-blue-50 rounded-lg p-3 border border-blue-100">
                        {aviso.mensaje}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 bg-gray-50 rounded px-2 py-1">
                        {new Date(aviso.fecha).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteClick(aviso)}
                        className="text-red-600 hover:text-red-900 transition-colors flex items-center space-x-1"
                      >
                        
                        <span>Eliminar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {avisos.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay avisos</h3>
            <p className="text-gray-500 mb-4">Aún no se han creado avisos para los barrios.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Crear Primer Aviso
            </button>
          </div>
        )}

        {/* Modal para crear aviso */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                
                <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Aviso</h2>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barrio
                  </label>
                  <select
                    required
                    value={formData.barrio_id}
                    onChange={(e) => setFormData({ ...formData, barrio_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Seleccionar barrio</option>
                    {barrios.map((barrio) => (
                      <option key={barrio.id} value={barrio.id}>
                        {barrio.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje del Aviso
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="Escribe aquí el mensaje importante para los residentes del barrio..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este mensaje será visible para todos los usuarios del barrio seleccionado.
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    
                    <span>Publicar Aviso</span>
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
            setAvisoToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Aviso"
          message={`¿Estás seguro de que deseas eliminar el aviso del barrio "${avisoToDelete?.barrio.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      </div>
    </div>
  );
}