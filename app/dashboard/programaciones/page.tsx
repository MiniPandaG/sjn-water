'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

interface Barrio {
  id: number;
  nombre: string;
}

interface Programacion {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  barrio: Barrio;
}

export default function ProgramacionesPage() {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [programacionToDelete, setProgramacionToDelete] = useState<Programacion | null>(null);
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
      const [barriosRes, programacionesRes] = await Promise.all([
        fetch('/api/barrios'),
        fetch('/api/programaciones')
      ]);

      if (barriosRes.ok) {
        const barriosData = await barriosRes.json();
        setBarrios(barriosData);
      }

      if (programacionesRes.ok) {
        const programacionesData = await programacionesRes.json();
        setProgramaciones(programacionesData);
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
      const response = await fetch('/api/programaciones', {
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
        showNotification('success', 'Programación creada correctamente');
      } else {
        showNotification('error', data.error || 'Error al crear programación');
      }
    } catch (error) {
      console.error('Error creating programacion:', error);
      showNotification('error', 'Error al crear programación');
    }
  };

  const handleDeleteClick = (programacion: Programacion) => {
    setProgramacionToDelete(programacion);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!programacionToDelete) return;

    try {
      const response = await fetch(`/api/programaciones/${programacionToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        fetchData();
        showNotification('success', 'Programación eliminada correctamente');
      } else {
        showNotification('error', data.error || 'Error al eliminar programación');
      }
    } catch (error) {
      console.error('Error deleting programacion:', error);
      showNotification('error', 'Error al eliminar programación');
    } finally {
      setShowDeleteModal(false);
      setProgramacionToDelete(null);
    }
  };

  const isFormValid = () => {
    return formData.barrio_id && formData.fecha_inicio && formData.fecha_fin && 
           new Date(formData.fecha_inicio) < new Date(formData.fecha_fin);
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
            <h1 className="text-3xl font-bold text-gray-900">Programaciones de Agua</h1>
            <p className="text-gray-600 mt-2">Gestiona los horarios de suministro de agua por barrio</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Nueva Programación
          </button>
        </div>

        {/* Programaciones List */}
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
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {programaciones.map((programacion) => (
                  <tr key={programacion.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">
                          {programacion.barrio.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(programacion.fecha_inicio).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(programacion.fecha_fin).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                      {programacion.descripcion || 'Sin descripción'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteClick(programacion)}
                        className="text-red-600 hover:text-red-800 transition-colors"
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

        {programaciones.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay programaciones</h3>
            <p className="text-gray-500 mb-4">Aún no se han creado programaciones de suministro de agua.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Crear Primera Programación
            </button>
          </div>
        )}

        {/* Modal para crear programación */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nueva Programación</h2>
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
                    Descripción (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="Describe los detalles de esta programación..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Los usuarios del barrio recibirán una notificación sobre esta programación.
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
                    Crear Programación
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
            setProgramacionToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Programación"
          message={`¿Estás seguro de que deseas eliminar la programación del barrio "${programacionToDelete?.barrio.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      </div>
    </div>
  );
}