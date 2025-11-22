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
    console.log('🔍 Iniciando DELETE para aviso ID:', id);

    const session = await getServerSession(authOptions);
    console.log('🔍 Sesión:', session?.user);

    if (!session || session.user.role !== 'admin') {
      console.log('❌ No autorizado');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el ID de los parámetros
    const avisoId = parseInt(id);
    console.log('🔍 ID a eliminar:', avisoId);

    if (isNaN(avisoId)) {
      console.log('❌ ID inválido:', id);
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar si el aviso existe
    const avisoExistente = await prisma.aviso.findUnique({
      where: { id: avisoId }
    });

    console.log('🔍 Aviso existente:', avisoExistente);

    if (!avisoExistente) {
      console.log('❌ Aviso no encontrado');
      return NextResponse.json(
        { error: 'Aviso no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el aviso
    console.log('🗑️ Eliminando aviso...');
    await prisma.aviso.delete({
      where: { id: avisoId }
    });

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Aviso eliminado: ID ${avisoId}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    console.log('✅ Aviso eliminado correctamente');

    return NextResponse.json({ 
      success: true,
      message: 'Aviso eliminado correctamente' 
    });
  } catch (error) {
    console.error('❌ Error deleting aviso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}