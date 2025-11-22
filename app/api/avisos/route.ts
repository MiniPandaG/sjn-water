// app/api/avisos/route.ts
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

    const avisos = await prisma.aviso.findMany({
      where: whereClause,
      include: {
        barrio: true
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return NextResponse.json(avisos);
  } catch (error) {
    console.error('Error fetching avisos:', error);
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

    const { barrio_id, mensaje } = await request.json();

    if (!barrio_id || !mensaje) {
      return NextResponse.json(
        { error: 'Barrio y mensaje son requeridos' },
        { status: 400 }
      );
    }

    // Validar longitud del mensaje
    if (mensaje.length > 500) {
      return NextResponse.json(
        { error: 'El mensaje no puede exceder los 500 caracteres' },
        { status: 400 }
      );
    }

    const aviso = await prisma.aviso.create({
      data: {
        barrio_id: parseInt(barrio_id),
        mensaje
      },
      include: {
        barrio: true
      }
    });

    
    const mensajeNotificacion = `Aviso importante en ${aviso.barrio.nombre}: ${mensaje}`;

    await crearNotificacionesBarrio(
      parseInt(barrio_id),
      mensajeNotificacion,
      'aviso'
    );

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Aviso creado para ${aviso.barrio.nombre}: ${mensaje.substring(0, 50)}${mensaje.length > 50 ? '...' : ''}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json(aviso, { status: 201 });
  } catch (error) {
    console.error('Error creating aviso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}