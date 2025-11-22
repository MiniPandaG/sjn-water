// app/cliente/layout.tsx
export const metadata = {
  title: 'Sistema de Agua - Cliente',
  description: 'Panel de cliente para el sistema de gestión de agua',
};

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}