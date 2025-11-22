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

    const mantenimientoId = parseInt(id);

    if (isNaN(mantenimientoId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const mantenimientoExistente = await prisma.mantenimiento.findUnique({
      where: { id: mantenimientoId },
      include: {
        barrio: true
      }
    });

    if (!mantenimientoExistente) {
      return NextResponse.json(
        { error: 'Mantenimiento no encontrado' },
        { status: 404 }
      );
    }

    await prisma.mantenimiento.delete({
      where: { id: mantenimientoId }
    });

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Mantenimiento eliminado: ${mantenimientoExistente.barrio.nombre}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Mantenimiento eliminado correctamente' 
    });
  } catch (error) {
    console.error('Error deleting mantenimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}