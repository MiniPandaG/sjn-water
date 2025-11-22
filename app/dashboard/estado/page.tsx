'use client';

import { useState, useEffect } from 'react';

interface Barrio {
  id: number;
  nombre: string;
}

interface EstadoAgua {
  id: number;
  barrio_id: number;
  estado: string;
  fecha_actualizacion: string;
  barrio: Barrio;
}

export default function EstadoAguaPage() {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [estados, setEstados] = useState<EstadoAgua[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    barrio_id: '',
    estado: 'Activo'
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
      const [barriosRes, estadosRes] = await Promise.all([
        fetch('/api/barrios'),
        fetch('/api/estado')
      ]);

      if (barriosRes.ok) {
        const barriosData = await barriosRes.json();
        setBarrios(barriosData);
      }

      if (estadosRes.ok) {
        const estadosData = await estadosRes.json();
        setEstados(estadosData);
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
      const response = await fetch('/api/estado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowModal(false);
        setFormData({ barrio_id: '', estado: 'Activo' });
        fetchData();
        showNotification('success', 'Estado actualizado correctamente');
      } else {
        showNotification('error', data.error || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error updating estado:', error);
      showNotification('error', 'Error al actualizar estado');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Inactivo':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Intermitente':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getEstadoDotColor = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-500';
      case 'Inactivo':
        return 'bg-red-500';
      case 'Intermitente':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEstadoText = (estado: string | undefined) => {
    if (!estado) return 'Sin información';
    switch (estado) {
      case 'Activo':
        return '💧 Activo';
      case 'Inactivo':
        return '🚫 Inactivo';
      case 'Intermitente':
        return '⚠️ Intermitente';
      default:
        return '❓ ' + estado;
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
            <h1 className="text-3xl font-bold text-gray-900">Estado del Agua por Barrio</h1>
            <p className="text-gray-600 mt-2">Gestiona el estado del servicio de agua</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Actualizar Estado
          </button>
        </div>

        {/* Estados Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barrios.map((barrio) => {
            const estado = estados.find(e => e.barrio_id === barrio.id);
            return (
              <div key={barrio.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {barrio.nombre}
                  </h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(estado?.estado || 'Desconocido')}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${getEstadoDotColor(estado?.estado || 'Desconocido')}`}></span>
                    {getEstadoText(estado?.estado)}
                  </div>
                </div>
                
                {estado ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Última actualización:</span><br />
                      {new Date(estado.fecha_actualizacion).toLocaleString()}
                    </p>
                    <div className="flex space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        estado.estado === 'Activo' 
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : estado.estado === 'Inactivo'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {estado.estado === 'Activo' ? '✅ Servicio normal' :
                         estado.estado === 'Inactivo' ? '❌ Sin servicio' :
                         '⚠️ Servicio variable'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-gray-400 text-4xl mb-2">💧</div>
                    <p className="text-gray-500 text-sm">No hay información disponible</p>
                    <button 
                      onClick={() => {
                        setFormData({ barrio_id: barrio.id.toString(), estado: 'Activo' });
                        setShowModal(true);
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Agregar estado
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal para actualizar estado */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Actualizar Estado del Agua</h2>
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
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado del Servicio
                  </label>
                  <select
                    required
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="Activo">💧 Activo - Servicio normal</option>
                    <option value="Inactivo">🚫 Inactivo - Sin servicio</option>
                    <option value="Intermitente">⚠️ Intermitente - Servicio variable</option>
                  </select>
                  
                  {/* Descripciones de estados */}
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>💧 <strong>Activo:</strong> Servicio funcionando normalmente</span>
                    </div>
                    <div className="flex items-center space-x-2 text-red-600">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>🚫 <strong>Inactivo:</strong> Sin servicio de agua</span>
                    </div>
                    <div className="flex items-center space-x-2 text-yellow-600">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span>⚠️ <strong>Intermitente:</strong> Servicio con interrupciones</span>
                    </div>
                  </div>
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
                    Actualizar Estado
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}