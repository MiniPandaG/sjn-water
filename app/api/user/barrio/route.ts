// app/api/user/barrio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { barrio_id } = await request.json();

    if (!barrio_id) {
      return NextResponse.json(
        { error: 'Barrio es requerido' },
        { status: 400 }
      );
    }

    // Verificar si el barrio existe
    const barrioExistente = await prisma.barrio.findUnique({
      where: { id: barrio_id }
    });

    if (!barrioExistente) {
      return NextResponse.json(
        { error: 'Barrio no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: {
        barrio_id: barrio_id,
        updatedAt: new Date()
      },
      include: {
        barrio: true
      }
    });

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Barrio cambiado a: ${barrioExistente.nombre}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    // Preparar respuesta
    const userResponse = {
      id: updatedUser.id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      barrio: updatedUser.barrio ? {
        id: updatedUser.barrio.id,
        nombre: updatedUser.barrio.nombre
      } : null,
      createdAt: updatedUser.createdAt
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Error updating user barrio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}