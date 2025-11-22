import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const barrioId = parseInt(id);

    if (isNaN(barrioId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar si el barrio tiene datos asociados
    const relatedData = await prisma.barrio.findUnique({
      where: { id: barrioId },
      include: {
        users: true,
        estado_agua: true,
        avisos: true,
        quejas: true
      }
    });

    if (!relatedData) {
      return NextResponse.json(
        { error: 'Barrio no encontrado' },
        { status: 404 }
      );
    }

    if (relatedData.users.length > 0 ||
        relatedData.estado_agua.length > 0 ||
        relatedData.avisos.length > 0 ||
        relatedData.quejas.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el barrio porque tiene datos asociados' },
        { status: 400 }
      );
    }

    await prisma.barrio.delete({
      where: { id: barrioId }
    });

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Barrio eliminado: ID ${barrioId}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Barrio eliminado correctamente' 
    });
  } catch (error) {
    console.error('Error deleting barrio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}