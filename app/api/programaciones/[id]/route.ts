import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    const programacionId = parseInt(id);

    if (isNaN(programacionId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const programacionExistente = await prisma.programacion.findUnique({
      where: { id: programacionId },
      include: {
        barrio: true
      }
    });

    if (!programacionExistente) {
      return NextResponse.json(
        { error: 'Programación no encontrada' },
        { status: 404 }
      );
    }

    await prisma.programacion.delete({
      where: { id: programacionId }
    });

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Programación eliminada: ${programacionExistente.barrio.nombre}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Programación eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error deleting programacion:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}