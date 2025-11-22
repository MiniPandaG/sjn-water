'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalUsers: number;
  totalBarrios: number;
  activeQuejas: number;
  recentNoticias: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      redirect('/auth/login');
    }

    fetchStats();
  }, [session, status]);

  const fetchStats = async () => {
    try {
      // En una implementación real, tendrías un endpoint específico para stats
      const [usersRes, barriosRes, quejasRes, noticiasRes] = await Promise.all([
        fetch('/api/admin/stats/users'),
        fetch('/api/admin/stats/barrios'),
        fetch('/api/admin/stats/quejas'),
        fetch('/api/admin/stats/noticias')
      ]);

      // Para este ejemplo, usamos datos mock
      setStats({
        totalUsers: 150,
        totalBarrios: 5,
        activeQuejas: 12,
        recentNoticias: 8
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {session?.user?.name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Usuarios</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Barrios</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalBarrios || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Quejas Activas</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats?.activeQuejas || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9m0 0v12" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Noticias Recientes</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats?.recentNoticias || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {session?.user?.role === 'admin' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition">
                Gestionar Barrios
              </button>
              <button className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition">
                Crear Noticia
              </button>
              <button className="bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition">
                Ver Quejas
              </button>
              <button className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition">
                Reportes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}