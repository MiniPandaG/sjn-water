// app/api/user/profile/route.ts
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

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe en otro usuario
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: parseInt(session.user.id)
        }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está en uso por otro usuario' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: {
        name,
        email,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        barrio: {
          select: {
            id: true,
            nombre: true
          }
        },
        createdAt: true
      }
    });

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Perfil actualizado: ${name} (${email})`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}