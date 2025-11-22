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

    const noticiaId = parseInt(id);

    if (isNaN(noticiaId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar si la noticia existe
    const noticiaExistente = await prisma.noticia.findUnique({
      where: { id: noticiaId }
    });

    if (!noticiaExistente) {
      return NextResponse.json(
        { error: 'Noticia no encontrada' },
        { status: 404 }
      );
    }

    await prisma.noticia.delete({
      where: { id: noticiaId }
    });

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Noticia eliminada: ID ${noticiaId}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Noticia eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error deleting noticia:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}