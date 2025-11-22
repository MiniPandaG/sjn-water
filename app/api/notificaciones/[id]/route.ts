// app/api/notificaciones/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const notificacionId = parseInt(id);

    if (isNaN(notificacionId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar que la notificación pertenece al usuario
    const notificacionExistente = await prisma.notificacion.findFirst({
      where: {
        id: notificacionId,
        usuario_id: parseInt(session.user.id)
      }
    });

    if (!notificacionExistente) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    const notificacion = await prisma.notificacion.update({
      where: { id: notificacionId },
      data: {
        leido: true
      }
    });

    return NextResponse.json(notificacion);
  } catch (error) {
    console.error('Error updating notificacion:', error);
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

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const notificacionId = parseInt(id);

    if (isNaN(notificacionId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar que la notificación pertenece al usuario
    const notificacionExistente = await prisma.notificacion.findFirst({
      where: {
        id: notificacionId,
        usuario_id: parseInt(session.user.id)
      }
    });

    if (!notificacionExistente) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    await prisma.notificacion.delete({
      where: { id: notificacionId }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Notificación eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error deleting notificacion:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}