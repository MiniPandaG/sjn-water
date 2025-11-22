// app/dashboard/perfil/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';

interface UserData {
  name: string;
  email: string;
  barrio?: {
    id: number;
    nombre: string;
  };
  role: string;
  createdAt: string;
}

export default function PerfilPage() {
  const { data: session, status, update } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      redirect('/auth/login');
    }

    fetchUserData();
  }, [session, status]);

  const fetchUserData = async () => {
    try {
      // En una app real, aquí harías una llamada a la API
      // Por ahora usamos los datos de la sesión
      setUserData({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        barrio: session?.user?.barrio,
        role: session?.user?.role || 'user',
        createdAt: '2024-01-01' // Esto vendría de la base de datos
      });
      
      setFormData({
        name: session?.user?.name || '',
        email: session?.user?.email || ''
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
        setEditMode(false);
        setMessage('Perfil actualizado correctamente');
        
        // Actualizar la sesión
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name,
            email: formData.email
          }
        });
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Error al actualizar el perfil');
      }
    } catch (error) {
      setMessage('Error de conexión. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto pt-16">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                <span className="text-2xl font-bold">
                  {userData?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
                <p className="text-blue-100">Gestiona tu información personal</p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-8">
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('Error') 
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-green-50 border border-green-200 text-green-800'
              }`}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Información Personal */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Información Personal</h2>
                
                {!editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
                      <p className="text-gray-900 font-medium">{userData?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <p className="text-gray-900 font-medium">{userData?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Rol</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        userData?.role === 'admin' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {userData?.role === 'admin' ? '👑 Administrador' : '👤 Usuario'}
                      </span>
                    </div>
                    {userData?.barrio && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Barrio</label>
                        <p className="text-gray-900 font-medium">{userData.barrio.nombre}</p>
                      </div>
                    )}
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Editar Perfil
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setFormData({
                            name: userData?.name || '',
                            email: userData?.email || ''
                          });
                        }}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Estadísticas y Acciones */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Acciones</h2>
                
                <div className="grid grid-cols-1 gap-4">
                  <a
                    href="/dashboard/cambiar-password"
                    className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition group"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Cambiar Contraseña</h3>
                      <p className="text-sm text-gray-600">Actualiza tu contraseña de acceso</p>
                    </div>
                  </a>

                  <a
                    href="/dashboard/mis-quejas"
                    className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition group"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Mis Quejas</h3>
                      <p className="text-sm text-gray-600">Revisa el historial de tus quejas</p>
                    </div>
                  </a>

                  <a
                    href="/dashboard/notificaciones"
                    className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition group"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                      <p className="text-sm text-gray-600">Gestiona tus alertas y avisos</p>
                    </div>
                  </a>
                </div>

                {/* Estadísticas */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Estadísticas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">5</div>
                      <div className="text-sm text-gray-600">Quejas Enviadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">12</div>
                      <div className="text-sm text-gray-600">Notificaciones</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}