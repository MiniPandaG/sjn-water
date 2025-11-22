'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
}

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noticiaToDelete, setNoticiaToDelete] = useState<Noticia | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: ''
  });
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  useEffect(() => {
    fetchNoticias();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: 'success', message: '' });
    }, 3000);
  };

  const fetchNoticias = async () => {
    try {
      const response = await fetch('/api/noticias');
      if (response.ok) {
        const data = await response.json();
        setNoticias(data);
      }
    } catch (error) {
      console.error('Error fetching noticias:', error);
      showNotification('error', 'Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/noticias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowModal(false);
        setFormData({ titulo: '', contenido: '' });
        fetchNoticias();
        showNotification('success', 'Noticia publicada correctamente');
      } else {
        showNotification('error', data.error || 'Error al crear noticia');
      }
    } catch (error) {
      console.error('Error creating noticia:', error);
      showNotification('error', 'Error al crear noticia');
    }
  };

  const handleDeleteClick = (noticia: Noticia) => {
    setNoticiaToDelete(noticia);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noticiaToDelete) return;

    try {
      const response = await fetch(`/api/noticias/${noticiaToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        fetchNoticias();
        showNotification('success', 'Noticia eliminada correctamente');
      } else {
        showNotification('error', data.error || 'Error al eliminar noticia');
      }
    } catch (error) {
      console.error('Error deleting noticia:', error);
      showNotification('error', 'Error al eliminar noticia');
    } finally {
      setShowDeleteModal(false);
      setNoticiaToDelete(null);
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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Noticias</h1>
            <p className="text-gray-600 mt-2">Publica noticias y avisos importantes para todos los usuarios</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            
            <span>Crear Noticia</span>
          </button>
        </div>

        {/* Noticias Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((noticia) => (
            <div key={noticia.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow border border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {noticia.titulo}
                  </h3>
                  <button
                    onClick={() => handleDeleteClick(noticia)}
                    className="text-red-500 hover:text-red-700 transition-colors flex items-center space-x-1 text-sm"
                  >
                    
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed line-clamp-4">
                  {noticia.contenido}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    
                    <span>{new Date(noticia.fecha).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Noticia
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {noticias.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            
            <h3 className="text-xl font-medium text-gray-900 mb-2">No hay noticias publicadas</h3>
            <p className="text-gray-500 mb-6">Comienza compartiendo información importante con la comunidad.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 mx-auto"
            >
              
              <span>Crear Primera Noticia</span>
            </button>
          </div>
        )}

        {/* Modal para crear noticia */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center space-x-3 mb-6">
                
                <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Noticia</h2>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Título de la Noticia
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-lg font-medium"
                    placeholder="Escribe un título llamativo..."
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Contenido de la Noticia
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={formData.contenido}
                    onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 resize-none leading-relaxed"
                    placeholder="Escribe aquí el contenido completo de la noticia. Esta información será visible para todos los usuarios del sistema..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Esta noticia será visible para todos los usuarios del sistema.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    
                    <span>Publicar Noticia</span>
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
            setNoticiaToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Noticia"
          message={`¿Estás seguro de que deseas eliminar la noticia "${noticiaToDelete?.titulo}"? Esta acción no se puede deshacer y la noticia dejará de ser visible para todos los usuarios.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      </div>
    </div>
  );
}