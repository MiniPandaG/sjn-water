// app/api/quejas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    let whereClause = {};
    
    // Si no es admin, solo puede ver sus propias quejas
    if (session.user.role !== 'admin') {
      whereClause = {
        usuario_id: parseInt(session.user.id)
      };
    }

    const quejas = await prisma.queja.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        barrio: true
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return NextResponse.json(quejas);
  } catch (error) {
    console.error('Error fetching quejas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { mensaje } = await request.json();

    if (!mensaje) {
      return NextResponse.json(
        { error: 'Mensaje es requerido' },
        { status: 400 }
      );
    }

    // Para usuarios normales, usar el barrio_id de su perfil
    const barrioId = session.user.role === 'admin' 
      ? (await request.json()).barrio_id 
      : session.user.barrio?.id;

    if (!barrioId) {
      return NextResponse.json(
        { error: 'Barrio no asignado' },
        { status: 400 }
      );
    }

    const queja = await prisma.queja.create({
      data: {
        usuario_id: parseInt(session.user.id),
        barrio_id: parseInt(barrioId),
        mensaje,
        estado: 'pendiente' 
      },
      include: {
        barrio: true,
        usuario: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Queja enviada: ${queja.barrio.nombre}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json(queja, { status: 201 });
  } catch (error) {
    console.error('Error creating queja:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}