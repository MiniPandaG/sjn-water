// app/api/estado/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { crearNotificacionesBarrio } from '@/lib/notificaciones';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barrioId = searchParams.get('barrio_id');

    let whereClause = {};
    
    if (barrioId) {
      whereClause = {
        barrio_id: parseInt(barrioId)
      };
    }

    const estados = await prisma.estadoAgua.findMany({
      where: whereClause,
      include: {
        barrio: true
      },
      orderBy: {
        fecha_actualizacion: 'desc'
      }
    });

    return NextResponse.json(estados);
  } catch (error) {
    console.error('Error fetching estado agua:', error);
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

    const { barrio_id, estado } = await request.json();

    if (!barrio_id || !estado) {
      return NextResponse.json(
        { error: 'Barrio y estado son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el estado sea uno de los permitidos
    const estadosPermitidos = ['Activo', 'Inactivo', 'Intermitente'];
    if (!estadosPermitidos.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado no válido. Use: Activo, Inactivo o Intermitente' },
        { status: 400 }
      );
    }

    const nuevoEstado = await prisma.estadoAgua.create({
      data: {
        barrio_id: parseInt(barrio_id),
        estado
      },
      include: {
        barrio: true
      }
    });

    // CREAR NOTIFICACIONES AUTOMÁTICAS basadas en el cambio de estado
    let mensajeNotificacion = '';
    let tipoNotificacion = 'estado';
    
    switch (estado) {
      case 'Activo':
        mensajeNotificacion = `💧 ¡Servicio de agua restaurado en ${nuevoEstado.barrio.nombre}!`;
        break;
      case 'Inactivo':
        mensajeNotificacion = `❌ Servicio de agua interrumpido en ${nuevoEstado.barrio.nombre}`;
        break;
      case 'Intermitente':
        mensajeNotificacion = `⚠️ Servicio de agua intermitente en ${nuevoEstado.barrio.nombre}`;
        break;
      default:
        mensajeNotificacion = `ℹ️ Estado del servicio actualizado en ${nuevoEstado.barrio.nombre}: ${estado}`;
    }

    // Solo enviar notificaciones si hay un mensaje definido
    if (mensajeNotificacion) {
      await crearNotificacionesBarrio(
        parseInt(barrio_id),
        mensajeNotificacion,
        tipoNotificacion
      );
    }

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Estado de agua actualizado: ${nuevoEstado.barrio.nombre} - ${estado}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json(nuevoEstado, { status: 201 });
  } catch (error) {
    console.error('Error creating estado agua:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}