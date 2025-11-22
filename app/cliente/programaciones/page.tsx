// app/cliente/programaciones/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Programacion {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion?: string;
  barrio: {
    id: number;
    nombre: string;
  };
}

export default function ProgramacionesCliente() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (session.user.role === 'admin') {
      router.push('/dashboard/programaciones');
      return;
    }

    fetchProgramaciones();
  }, [session, status, router]);

  const fetchProgramaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/programaciones?barrio_id=${session?.user.barrio?.id}`);
      if (response.ok) {
        const data = await response.json();
        setProgramaciones(data);
      }
    } catch (error) {
      console.error('Error fetching programaciones:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando programaciones...</p>
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
          
          <h1 className="text-3xl font-bold text-gray-900">Programaciones de Agua</h1>
          <p className="mt-2 text-gray-600">
            Programaciones de suministro para tu barrio
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {programaciones.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-lg mb-2">No hay programaciones activas</p>
              <p className="text-gray-400 text-sm">Todas las programaciones aparecerán aquí</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {programaciones.map((programacion) => (
                <div key={programacion.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {programacion.barrio.nombre}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Programado
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Inicio: {formatDate(programacion.fecha_inicio)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Fin: {formatDate(programacion.fecha_fin)}</span>
                    </div>
                  </div>

                  {programacion.descripcion && (
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {programacion.descripcion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}