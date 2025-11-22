// app/api/notificaciones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { crearNotificacionesBarrio, crearNotificacionGlobal } from '@/lib/notificaciones';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    let whereClause = {
      usuario_id: parseInt(session.user.id)
    };

    const notificaciones = await prisma.notificacion.findMany({
      where: whereClause,
      orderBy: {
        fecha: 'desc'
      },
      skip,
      take: limit
    });

    const total = await prisma.notificacion.count({
      where: whereClause
    });

    const noLeidas = await prisma.notificacion.count({
      where: {
        ...whereClause,
        leido: false
      }
    });

    return NextResponse.json({
      notificaciones,
      pagination: {
        page,
        limit,
        total,
        noLeidas,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notificaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { barrio_id, mensaje, tipo, es_global } = await request.json();

    if (!mensaje) {
      return NextResponse.json(
        { error: 'Mensaje es requerido' },
        { status: 400 }
      );
    }

    let notificacionesCreadas = 0;

    if (es_global) {
      // Notificación global para todos los usuarios
      const notificaciones = await crearNotificacionGlobal(mensaje, tipo);
      notificacionesCreadas = notificaciones.length;
    } else if (barrio_id) {
      // Notificación para un barrio específico
      const notificaciones = await crearNotificacionesBarrio(barrio_id, mensaje, tipo);
      notificacionesCreadas = notificaciones.length;
    } else {
      return NextResponse.json(
        { error: 'Debe especificar barrio_id o marcar como global' },
        { status: 400 }
      );
    }

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Notificaciones enviadas: ${notificacionesCreadas} notificaciones - ${mensaje.substring(0, 50)}...`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json({ 
      success: true,
      message: `Notificaciones creadas exitosamente`,
      notificaciones_creadas: notificacionesCreadas
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating notificaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}