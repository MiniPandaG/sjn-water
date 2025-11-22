import Link from 'next/link';

export default function Home() {

  // Simulación de datos – cámbialos por tu fetch real
  const barriosConAgua = [
    "Centro",
    "San Miguel",
    "La Esperanza",
    "Altos del Rosario"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      
      {/* HERO */}
      <div className="relative bg-gradient-to-r from-blue-700 to-blue-900 text-white py-24 px-6 shadow-lg">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-md">
            Sistema de Alertas de Agua
          </h1>
          <p className="text-lg opacity-90 mb-10">
            Consulta en tiempo real qué sectores están recibiendo agua en este momento
          </p>

          <h2 className="text-xl font-semibold mb-3">⛲ Barrios con agua ahora</h2>

          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {barriosConAgua.length > 0 ? (
              barriosConAgua.map((barrio, index) => (
                <span
                  key={index}
                  className="bg-white/20 backdrop-blur px-4 py-2 rounded-full border border-white/30"
                >
                  {barrio}
                </span>
              ))
            ) : (
              <p className="text-white/70">No hay agua en ningún sector actualmente</p>
            )}
          </div>

          <div className="flex justify-center gap-4 mt-10">
            <Link
              href="/auth/login"
              className="bg-white text-blue-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition"
            >
              Iniciar Sesión
            </Link>

            <Link
              href="/auth/register"
              className="bg-transparent border border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white/20 transition"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-blue-800">¿Qué ofrece este sistema?</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2 text-blue-700">Estado del Servicio</h3>
            <p className="text-gray-600">
              Revisa en tiempo real si tu barrio está recibiendo agua o en qué horario llegará.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2 text-blue-700">Notificaciones</h3>
            <p className="text-gray-600">
              Activa alertas de cortes, mantenimientos, o inicio de bombeo en tu zona.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2 text-blue-700">Reportes Ciudadanos</h3>
            <p className="text-gray-600">
              Reporta fallas o comparte información con la administración y tu comunidad.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
