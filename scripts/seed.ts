import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Crear barrios de ejemplo
  const barrios = await Promise.all([
    prisma.barrio.create({ data: { nombre: 'Centro' } }),
    prisma.barrio.create({ data: { nombre: 'Norte' } }),
    prisma.barrio.create({ data: { nombre: 'Sur' } }),
    prisma.barrio.create({ data: { nombre: 'Este' } }),
    prisma.barrio.create({ data: { nombre: 'Oeste' } }),
  ]);

  console.log('Barrios creados:', barrios);

  // Crear usuario admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@sistemaagua.com',
      password_hash: adminPassword,
      role: 'admin',
      barrio_id: barrios[0].id
    }
  });

  console.log('Usuario admin creado:', admin);

  // Crear usuarios normales
  const userPassword = await bcrypt.hash('user123', 12);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Juan Pérez',
        email: 'juan@ejemplo.com',
        password_hash: userPassword,
        role: 'user',
        barrio_id: barrios[1].id
      }
    }),
    prisma.user.create({
      data: {
        name: 'María García',
        email: 'maria@ejemplo.com',
        password_hash: userPassword,
        role: 'user',
        barrio_id: barrios[2].id
      }
    }),
  ]);

  console.log('Usuarios normales creados:', users);

  // Crear estados de agua
  const estados = await Promise.all([
    prisma.estadoAgua.create({
      data: {
        barrio_id: barrios[0].id,
        estado: 'Activo'
      }
    }),
    prisma.estadoAgua.create({
      data: {
        barrio_id: barrios[1].id,
        estado: 'Inactivo'
      }
    }),
  ]);

  console.log('Estados de agua creados:', estados);

  // Crear avisos
  const avisos = await Promise.all([
    prisma.aviso.create({
      data: {
        barrio_id: barrios[0].id,
        mensaje: 'Mantenimiento programado para el próximo viernes'
      }
    }),
    prisma.aviso.create({
      data: {
        barrio_id: barrios[1].id,
        mensaje: 'Corte de agua por obras de reparación'
      }
    }),
  ]);

  console.log('Avisos creados:', avisos);

  // Crear noticias
  const noticias = await Promise.all([
    prisma.noticia.create({
      data: {
        titulo: 'Mejoras en el sistema de distribución',
        contenido: 'Se están realizando mejoras en el sistema de distribución de agua para brindar un mejor servicio.'
      }
    }),
    prisma.noticia.create({
      data: {
        titulo: 'Nuevo horario de atención',
        contenido: 'El horario de atención al cliente se ha extendido hasta las 18:00 hrs.'
      }
    }),
  ]);

  console.log('Noticias creadas:', noticias);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });