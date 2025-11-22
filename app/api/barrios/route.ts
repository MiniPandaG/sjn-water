import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const barrios = await prisma.barrio.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(barrios);
  } catch (error) {
    console.error('Error fetching barrios:', error);
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

    const { nombre } = await request.json();

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre del barrio es requerido' },
        { status: 400 }
      );
    }

    const barrio = await prisma.barrio.create({
      data: {
        nombre
      }
    });

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Barrio creado: ${nombre}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json(barrio, { status: 201 });
  } catch (error) {
    console.error('Error creating barrio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}