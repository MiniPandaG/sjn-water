// app/api/mantenimientos/route.ts
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

    const mantenimientos = await prisma.mantenimiento.findMany({
      where: whereClause,
      include: {
        barrio: true
      },
      orderBy: {
        fecha_inicio: 'desc'
      }
    });

    return NextResponse.json(mantenimientos);
  } catch (error) {
    console.error('Error fetching mantenimientos:', error);
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

    const mantenimiento = await prisma.mantenimiento.create({
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

    // CREAR NOTIFICACIONES AUTOMÁTICAS usando la función centralizada
    const mensajeNotificacion = descripcion 
      ? `🔧 Mantenimiento programado en ${mantenimiento.barrio.nombre}: ${descripcion} (Del ${new Date(fecha_inicio).toLocaleDateString()} al ${new Date(fecha_fin).toLocaleDateString()})`
      : `🔧 Mantenimiento programado en ${mantenimiento.barrio.nombre} del ${new Date(fecha_inicio).toLocaleDateString()} al ${new Date(fecha_fin).toLocaleDateString()}`;

    await crearNotificacionesBarrio(
      parseInt(barrio_id),
      mensajeNotificacion,
      'mantenimiento'
    );

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Mantenimiento creado para ${mantenimiento.barrio.nombre}: ${descripcion || 'Sin descripción'} (${new Date(fecha_inicio).toLocaleDateString()} - ${new Date(fecha_fin).toLocaleDateString()})`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json(mantenimiento, { status: 201 });
  } catch (error) {
    console.error('Error creating mantenimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}