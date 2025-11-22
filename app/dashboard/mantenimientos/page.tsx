'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

interface Barrio {
  id: number;
  nombre: string;
}

interface Mantenimiento {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  barrio: Barrio;
}

export default function MantenimientosPage() {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mantenimientoToDelete, setMantenimientoToDelete] = useState<Mantenimiento | null>(null);
  const [formData, setFormData] = useState({
    barrio_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    descripcion: ''
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
      const [barriosRes, mantenimientosRes] = await Promise.all([
        fetch('/api/barrios'),
        fetch('/api/mantenimientos')
      ]);

      if (barriosRes.ok) {
        const barriosData = await barriosRes.json();
        setBarrios(barriosData);
      }

      if (mantenimientosRes.ok) {
        const mantenimientosData = await mantenimientosRes.json();
        setMantenimientos(mantenimientosData);
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
      const response = await fetch('/api/mantenimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowModal(false);
        setFormData({ barrio_id: '', fecha_inicio: '', fecha_fin: '', descripcion: '' });
        fetchData();
        showNotification('success', 'Mantenimiento programado correctamente');
      } else {
        showNotification('error', data.error || 'Error al crear mantenimiento');
      }
    } catch (error) {
      console.error('Error creating mantenimiento:', error);
      showNotification('error', 'Error al crear mantenimiento');
    }
  };

  const handleDeleteClick = (mantenimiento: Mantenimiento) => {
    setMantenimientoToDelete(mantenimiento);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!mantenimientoToDelete) return;

    try {
      const response = await fetch(`/api/mantenimientos/${mantenimientoToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        fetchData();
        showNotification('success', 'Mantenimiento eliminado correctamente');
      } else {
        showNotification('error', data.error || 'Error al eliminar mantenimiento');
      }
    } catch (error) {
      console.error('Error deleting mantenimiento:', error);
      showNotification('error', 'Error al eliminar mantenimiento');
    } finally {
      setShowDeleteModal(false);
      setMantenimientoToDelete(null);
    }
  };

  const isFormValid = () => {
    return formData.barrio_id && formData.fecha_inicio && formData.fecha_fin && 
           new Date(formData.fecha_inicio) < new Date(formData.fecha_fin);
  };

  const getStatus = (fechaInicio: string, fechaFin: string) => {
    const ahora = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (ahora < inicio) return 'programado';
    if (ahora >= inicio && ahora <= fin) return 'en-curso';
    return 'completado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'programado':
        return 'bg-blue-100 text-blue-800';
      case 'en-curso':
        return 'bg-yellow-100 text-yellow-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'programado':
        return 'Programado';
      case 'en-curso':
        return 'En Curso';
      case 'completado':
        return 'Completado';
      default:
        return 'Desconocido';
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
            <h1 className="text-3xl font-bold text-gray-900">Mantenimientos Programados</h1>
            <p className="text-gray-600 mt-2">Gestiona los trabajos de mantenimiento por barrio</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Programar Mantenimiento
          </button>
        </div>

        {/* Mantenimientos List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barrio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mantenimientos.map((mantenimiento) => {
                  const status = getStatus(mantenimiento.fecha_inicio, mantenimiento.fecha_fin);
                  return (
                    <tr key={mantenimiento.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900">
                            {mantenimiento.barrio.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(mantenimiento.fecha_inicio).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(mantenimiento.fecha_fin).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                        {mantenimiento.descripcion || 'Sin descripción'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteClick(mantenimiento)}
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

        {mantenimientos.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mantenimientos programados</h3>
            <p className="text-gray-500 mb-4">Programa trabajos de mantenimiento para informar a los usuarios.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Programar Primer Mantenimiento
            </button>
          </div>
        )}

        {/* Modal para crear mantenimiento */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Programar Mantenimiento</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha y Hora de Inicio
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.fecha_inicio}
                      onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha y Hora de Fin
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.fecha_fin}
                      onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                {formData.fecha_inicio && formData.fecha_fin && 
                 new Date(formData.fecha_inicio) >= new Date(formData.fecha_fin) && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-sm">
                      La fecha de fin debe ser posterior a la fecha de inicio.
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Mantenimiento
                  </label>
                  <textarea
                    rows={4}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="Describe los trabajos de mantenimiento a realizar..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Los usuarios del barrio recibirán una notificación sobre este mantenimiento.
                  </p>
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
                    disabled={!isFormValid()}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Programar Mantenimiento
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
            setMantenimientoToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Mantenimiento"
          message={`¿Estás seguro de que deseas eliminar el mantenimiento del barrio "${mantenimientoToDelete?.barrio.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      </div>
    </div>
  );
}