import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, barrio_id } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role: 'user',
        barrio_id: barrio_id ? parseInt(barrio_id) : null
      },
      include: {
        barrio: true
      }
    });

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Usuario registrado: ${email}`,
        usuario_id: user.id
      }
    });

    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: 'Usuario registrado exitosamente',
        user: userWithoutPassword
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}