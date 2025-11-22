// lib/notificaciones.ts
import { prisma } from '@/lib/db';

export async function crearNotificacionesBarrio(barrio_id: number, mensaje: string, tipo?: string) {
  try {
    // Obtener todos los usuarios del barrio
    const usuariosBarrio = await prisma.user.findMany({
      where: {
        barrio_id: barrio_id
      },
      select: {
        id: true
      }
    });

    // Crear notificaciones para cada usuario
    const notificaciones = await Promise.all(
      usuariosBarrio.map(usuario =>
        prisma.notificacion.create({
          data: {
            usuario_id: usuario.id,
            mensaje,
            tipo: tipo || 'general'
          }
        })
      )
    );

    console.log(`Notificaciones creadas: ${notificaciones.length} para barrio ${barrio_id}`);
    return notificaciones;
  } catch (error) {
    console.error('Error creando notificaciones automáticas:', error);
    return [];
  }
}

export async function crearNotificacionGlobal(mensaje: string, tipo?: string) {
  try {
    // Obtener todos los usuarios
    const todosUsuarios = await prisma.user.findMany({
      select: {
        id: true
      }
    });

    // Crear notificaciones para todos los usuarios
    const notificaciones = await Promise.all(
      todosUsuarios.map(usuario =>
        prisma.notificacion.create({
          data: {
            usuario_id: usuario.id,
            mensaje,
            tipo: tipo || 'general'
          }
        })
      )
    );

    console.log(`Notificaciones globales creadas: ${notificaciones.length}`);
    return notificaciones;
  } catch (error) {
    console.error('Error creando notificaciones globales:', error);
    return [];
  }
}

export async function crearNotificacionUsuario(usuario_id: number, mensaje: string, tipo?: string) {
  try {
    const notificacion = await prisma.notificacion.create({
      data: {
        usuario_id,
        mensaje,
        tipo: tipo || 'general'
      }
    });

    console.log(`Notificación creada para usuario ${usuario_id}`);
    return notificacion;
  } catch (error) {
    console.error('Error creando notificación individual:', error);
    return null;
  }
}