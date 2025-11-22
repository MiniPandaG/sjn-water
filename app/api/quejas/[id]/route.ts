// app/api/quejas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const quejaId = parseInt(id);

    if (isNaN(quejaId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const queja = await prisma.queja.findUnique({
      where: { id: quejaId },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        barrio: true
      }
    });

    if (!queja) {
      return NextResponse.json(
        { error: 'Queja no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(queja);
  } catch (error) {
    console.error('Error fetching queja:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const quejaId = parseInt(id);

    if (isNaN(quejaId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const { estado } = await request.json();

    if (!estado || !['pendiente', 'en_proceso', 'resuelta'].includes(estado)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      );
    }

    const queja = await prisma.queja.update({
      where: { id: quejaId },
      data: { estado },
      include: {
        usuario: {
          select: {
            name: true,
            email: true
          }
        },
        barrio: true
      }
    });

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Queja ${quejaId} actualizada a estado: ${estado}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    // Crear notificación para el usuario
    await prisma.notificacion.create({
      data: {
        usuario_id: queja.usuario_id,
        mensaje: `Tu queja ha sido actualizada a: ${estado === 'pendiente' ? 'Pendiente' : estado === 'en_proceso' ? 'En Proceso' : 'Resuelta'}`,
        tipo: 'estado'
      }
    });

    return NextResponse.json(queja);
  } catch (error) {
    console.error('Error updating queja:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const quejaId = parseInt(id);

    if (isNaN(quejaId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar si la queja existe
    const quejaExistente = await prisma.queja.findUnique({
      where: { id: quejaId }
    });

    if (!quejaExistente) {
      return NextResponse.json(
        { error: 'Queja no encontrada' },
        { status: 404 }
      );
    }

    await prisma.queja.delete({
      where: { id: quejaId }
    });

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Queja eliminada: ID ${quejaId}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Queja eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error deleting queja:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}