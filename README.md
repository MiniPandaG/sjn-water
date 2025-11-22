# Documentación de Endpoints de la API

## Autenticación
| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/auth/session` | Obtener sesión activa | Todos |
| POST | `/api/auth/register` | Registrar nuevo usuario | Público |
| POST | `/api/auth/signout` | Cerrar sesión | Todos |

## Usuarios
| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/user/profile` | Obtener perfil de usuario | Todos |
| PUT | `/api/user/profile` | Actualizar perfil de usuario | Todos |
| PUT | `/api/user/password` | Cambiar contraseña | Todos |

## Barrios
| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/barrios` | Listar todos los barrios | Admin |
| POST | `/api/barrios` | Crear barrio | Admin |
| GET | `/api/barrios/[id]` | Obtener barrio específico | Admin |
| PUT | `/api/barrios/[id]` | Actualizar barrio | Admin |
| DELETE | `/api/barrios/[id]` | Eliminar barrio | Admin |

## Estado del Agua
| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/estado` | Obtener estado general del agua | Todos |
| GET | `/api/estado?barrio_id=[id]` | Obtener estado del agua por barrio | Todos |
| POST | `/api/estado` | Actualizar estado del agua | Admin |

## Avisos
| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/avisos` | Listar todos los avisos | Todos |
| GET | `/api/avisos?barrio_id=[id]` | Listar avisos por barrio | Todos |
| POST | `/api/avisos` | Crear aviso | Admin |
| PUT | `/api/avisos/[id]` | Actualizar aviso | Admin |
| DELETE | `/api/avisos/[id]` | Eliminar aviso | Admin |

## Programaciones
| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/programaciones` | Listar todas las programaciones | Todos |
| POST | `/api/programaciones` | Crear programación | Admin |
| DELETE | `/api/programaciones/[id]` | Eliminar programación | Admin |

## Mantenimientos
| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/mantenimientos` | Listar todos los mantenimientos | Todos |
| POST | `/api/mantenimientos` | Crear mantenimiento | Admin |
| DELETE | `/api/mantenimientos/[id]` | Eliminar mantenimiento | Admin |

## Noticias
| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/noticias` | Listar todas las noticias | Todos |
| POST | `/api/noticias` | Crear noticia | Admin |
| PUT | `/api/noticias/[id]` | Actualizar noticia | Admin |
| DELETE | `/api/noticias/[id]` | Eliminar noticia | Admin |

## Quejas
| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/quejas` | Listar todas las quejas | Admin |
| POST | `/api/quejas` | Crear queja | Todos |
| PUT | `/api/quejas/[id]` | Actualizar queja | Admin |
| DELETE | `/api/quejas/[id]` | Eliminar queja | Admin |

## Notificaciones
| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/notificaciones` | Listar todas las notificaciones | Todos |
| PATCH | `/api/notificaciones/[id]` | Marcar como leída | Todos |
| DELETE | `/api/notificaciones/[id]` | Eliminar notificación | Todos |

## Logs del Sistema
| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | `/api/logs` | Listar logs del sistema | Admin |

## Leyenda
- **Admin**: Se requiere rol de administrador
- **Todos**: Usuarios autenticados
- **Público**: No requiere autenticación
- `[id]`: Parámetro de ruta (ID del recurso)
