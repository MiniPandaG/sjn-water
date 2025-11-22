// app/api/noticias/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { crearNotificacionGlobal } from '@/lib/notificaciones';

export async function GET() {
  try {
    const noticias = await prisma.noticia.findMany({
      orderBy: {
        fecha: 'desc'
      }
    });

    return NextResponse.json(noticias);
  } catch (error) {
    console.error('Error fetching noticias:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { titulo, contenido } = await request.json();

    if (!titulo || !contenido) {
      return NextResponse.json(
        { error: 'Título y contenido son requeridos' },
        { status: 400 }
      );
    }

    // Validar longitudes
    if (titulo.length > 200) {
      return NextResponse.json(
        { error: 'El título no puede exceder los 200 caracteres' },
        { status: 400 }
      );
    }

    if (contenido.length > 1000) {
      return NextResponse.json(
        { error: 'El contenido no puede exceder los 1000 caracteres' },
        { status: 400 }
      );
    }

    const noticia = await prisma.noticia.create({
      data: {
        titulo,
        contenido
      }
    });

    // CREAR NOTIFICACIONES GLOBALES para todos los usuarios
    const mensajeNotificacion = `📰 Nueva noticia: ${titulo}`;

    await crearNotificacionGlobal(
      mensajeNotificacion,
      'noticia'
    );

    // Crear log
    await prisma.log.create({
      data: {
        accion: `Noticia publicada: ${titulo}`,
        usuario_id: parseInt(session.user.id)
      }
    });

    return NextResponse.json(noticia, { status: 201 });
  } catch (error) {
    console.error('Error creating noticia:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}