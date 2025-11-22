// app/cliente/mantenimientos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Mantenimiento {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion?: string;
  barrio: {
    id: number;
    nombre: string;
  };
}

export default function MantenimientosCliente() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (session.user.role === 'admin') {
      router.push('/dashboard/mantenimientos');
      return;
    }

    fetchMantenimientos();
  }, [session, status, router]);

  const fetchMantenimientos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mantenimientos?barrio_id=${session?.user.barrio?.id}`);
      if (response.ok) {
        const data = await response.json();
        setMantenimientos(data);
      }
    } catch (error) {
      console.error('Error fetching mantenimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMantenimientoStatus = (fechaFin: string) => {
    const now = new Date();
    const endDate = new Date(fechaFin);
    return now > endDate ? 'Completado' : 'En Progreso';
  };

  const getStatusColor = (status: string) => {
    return status === 'En Progreso' 
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando mantenimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver al Dashboard</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Mantenimientos Programados</h1>
          <p className="mt-2 text-gray-600">
            Mantenimientos del sistema de agua en tu barrio
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {mantenimientos.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              <p className="text-gray-500 text-lg mb-2">No hay mantenimientos programados</p>
              <p className="text-gray-400 text-sm">Los mantenimientos aparecerán aquí cuando estén programados</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {mantenimientos.map((mantenimiento) => {
                const status = getMantenimientoStatus(mantenimiento.fecha_fin);
                const statusColor = getStatusColor(status);
                
                return (
                  <div key={mantenimiento.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {mantenimiento.barrio.nombre}
                      </h3>
                      <span className={`${statusColor} px-3 py-1 rounded-full text-sm font-medium`}>
                        {status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Inicio: {formatDate(mantenimiento.fecha_inicio)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Fin: {formatDate(mantenimiento.fecha_fin)}</span>
                      </div>
                    </div>

                    {mantenimiento.descripcion && (
                      <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                        {mantenimiento.descripcion}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}