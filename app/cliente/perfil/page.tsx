// app/cliente/perfil/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  barrio?: {
    id: number;
    nombre: string;
  };
  createdAt: string;
}

interface Barrio {
  id: number;
  nombre: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'perfil' | 'password' | 'barrio'>('perfil');
  
  // Estados para el formulario de perfil
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Estados para el formulario de contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Estados para el formulario de barrio
  const [barrioForm, setBarrioForm] = useState({
    barrio_id: ''
  });
  const [barrioLoading, setBarrioLoading] = useState(false);
  const [barrioError, setBarrioError] = useState('');
  const [barrioSuccess, setBarrioSuccess] = useState('');

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
      setProfileForm({
        name: session.user.name,
        email: session.user.email
      });
      setBarrioForm({
        barrio_id: session.user.barrio?.id?.toString() || ''
      });
      
      await fetchBarrios();
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
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
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileSuccess('Perfil actualizado correctamente');
        setUserData(data);
        // Actualizar la sesión
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();
        setUserData(session.user);
      } else {
        setProfileError(data.error || 'Error al actualizar el perfil');
      }
    } catch (error) {
      setProfileError('Error de conexión');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess('Contraseña actualizada correctamente');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError(data.error || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      setPasswordError('Error de conexión');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleBarrioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBarrioLoading(true);
    setBarrioError('');
    setBarrioSuccess('');

    try {
      const response = await fetch('/api/user/barrio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barrio_id: parseInt(barrioForm.barrio_id)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBarrioSuccess('Barrio actualizado correctamente');
        setUserData(data);
        // Actualizar la sesión
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();
        setUserData(session.user);
      } else {
        setBarrioError(data.error || 'Error al actualizar el barrio');
      }
    } catch (error) {
      setBarrioError('Error de conexión');
    } finally {
      setBarrioLoading(false);
    }
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
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando perfil...</p>
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
                <h1 className="text-lg font-bold text-gray-900">Mi Perfil</h1>
                <p className="text-xs text-gray-500">Gestiona tu cuenta</p>
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
        {/* Información del Usuario */}
        <div className="mb-6 animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {userData?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{userData?.name}</h2>
                  <p className="text-gray-600 text-sm">{userData?.email}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>Miembro desde {getTimeAgo(userData?.createdAt || '')}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {userData?.role === 'user' ? 'Usuario' : userData?.role}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <div className="font-medium mb-1">Barrio actual</div>
                <div className="text-gray-900 font-semibold">{userData?.barrio?.nombre || 'No asignado'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación de Tabs */}
        <div className="mb-6 animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-sm p-1 border border-gray-200">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('perfil')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'perfil'
                    ? 'bg-blue-100 text-blue-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Información Personal
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'password'
                    ? 'bg-blue-100 text-blue-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Cambiar Contraseña
              </button>
              <button
                onClick={() => setActiveTab('barrio')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'barrio'
                    ? 'bg-blue-100 text-blue-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Cambiar Barrio
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de los Tabs */}
        <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          {/* Tab: Información Personal */}
          {activeTab === 'perfil' && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Información Personal</h3>
              
              {profileError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-blue-900 text-sm mb-1">Información importante</h4>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Tu nombre será visible en las quejas que envíes</li>
                        <li>• El correo electrónico se utilizará para notificaciones</li>
                        <li>• Si cambias tu correo, deberás verificarlo en el próximo inicio de sesión</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm"
                  >
                    {profileLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </span>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Cambiar Contraseña */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Cambiar Contraseña</h3>
              
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña actual *
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Nueva contraseña *
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar nueva contraseña *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-yellow-900 text-sm mb-1">Recomendaciones de seguridad</h4>
                      <ul className="text-xs text-yellow-800 space-y-1">
                        <li>• Usa una contraseña única que no utilices en otros servicios</li>
                        <li>• Combina letras, números y caracteres especiales</li>
                        <li>• Evita información personal fácil de adivinar</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm"
                  >
                    {passwordLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Cambiando...
                      </span>
                    ) : (
                      'Cambiar Contraseña'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Cambiar Barrio */}
          {activeTab === 'barrio' && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Cambiar Barrio</h3>
              
              {barrioError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {barrioError}
                </div>
              )}

              {barrioSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {barrioSuccess}
                </div>
              )}

              <form onSubmit={handleBarrioSubmit} className="space-y-4">
                <div>
                  <label htmlFor="barrio_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Barrio *
                  </label>
                  <select
                    id="barrio_id"
                    value={barrioForm.barrio_id}
                    onChange={(e) => setBarrioForm({ barrio_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Selecciona un barrio</option>
                    {barrios.map((barrio) => (
                      <option key={barrio.id} value={barrio.id}>
                        {barrio.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-purple-900 text-sm mb-1">Importante sobre el cambio de barrio</h4>
                      <ul className="text-xs text-purple-800 space-y-1">
                        <li>• Solo recibirás notificaciones del barrio seleccionado</li>
                        <li>• El estado del agua se mostrará según tu barrio actual</li>
                        <li>• Las quejas que envíes estarán asociadas a tu nuevo barrio</li>
                        <li>• Los avisos y programaciones se filtrarán por tu barrio</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-600">
                    Barrio actual: <span className="font-semibold text-gray-900">{userData?.barrio?.nombre || 'No asignado'}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={barrioLoading || !barrioForm.barrio_id}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm"
                  >
                    {barrioLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Cambiando...
                      </span>
                    ) : (
                      'Cambiar Barrio'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}