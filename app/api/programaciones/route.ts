// app/api/programaciones/route.ts
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

    const programaciones = await prisma.programacion.findMany({
      where: whereClause,
      include: {
        barrio: true
      },
      orderBy: {
        fecha_inicio: 'desc'
      }
    });

    return NextResponse.json(programaciones);
  } catch (error) {
    console.error('Error fetching programaciones:', error);
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

    const { barrio_id, fecha_inicio, fecha_fin, descripcion } = await request.json();

    if (!barrio_id || !fecha_inicio || !fecha_fin) {
      return NextResponse.json(
        { error: 'Barrio, fecha inicio y fecha fin son requeridos' },
        { status: 400 }
      );
    }

    // Validar que la fecha fin sea posterior a la fecha inicio
    if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      );
    }

    const programacion = await prisma.programacion.create({
      data: {
        barrio_id: parseInt(barrio_id),
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin: new Date(fecha_fin),
        descripcion
      },
      include: {
        barrio: true
      }
    });

    const mensajeNotificacion = descripcion 
      ? `📅 Nueva programación en ${programacion.barrio.nombre}: ${descripcion}`
      : `📅 Nueva programación de agua en ${programacion.barrio.nombre} del ${new Date(fecha_inicio).toLocaleDateString()} al ${new Date(fecha_fin).toLocaleDateString()}`;

    await crearNotificacionesBarrio(
      parseInt(barrio_id),
      mensajeNotificacion,
      'programacion'
    );

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Programación creada para ${programacion.barrio.nombre}: ${descripcion || 'Sin descripción'}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json(programacion, { status: 201 });
  } catch (error) {
    console.error('Error creating programacion:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}