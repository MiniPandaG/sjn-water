// app/api/quejas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { crearNotificacionUsuario } from '@/lib/notificaciones';

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
        barrio: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      },
      skip,
      take: limit
    });

    const total = await prisma.queja.count({
      where: whereClause
    });

    return NextResponse.json({
      quejas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
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
        { error: 'El mensaje es requerido' },
        { status: 400 }
      );
    }

    if (!session.user.barrio?.id) {
      return NextResponse.json(
        { error: 'No tienes un barrio asignado' },
        { status: 400 }
      );
    }

    const queja = await prisma.queja.create({
      data: {
        usuario_id: parseInt(session.user.id),
        barrio_id: session.user.barrio.id,
        mensaje
      },
      include: {
        usuario: {
          select: {
            name: true,
            email: true
          }
        },
        barrio: {
          select: {
            nombre: true
          }
        }
      }
    });

    // Notificar a los administradores
    const administradores = await prisma.user.findMany({
      where: {
        role: 'admin'
      },
      select: {
        id: true
      }
    });

    await Promise.all(
      administradores.map(admin =>
        crearNotificacionUsuario(
          admin.id,
          `📝 Nueva queja de ${queja.usuario.name} (${queja.barrio.nombre}): ${mensaje.substring(0, 100)}...`,
          'queja'
        )
      )
    );

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Queja enviada por ${queja.usuario.name}: ${mensaje.substring(0, 50)}...`,
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