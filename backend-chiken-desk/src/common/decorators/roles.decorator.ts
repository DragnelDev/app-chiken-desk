import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/** Restringe la ruta a los roles indicados (ADMIN siempre tiene acceso). */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
