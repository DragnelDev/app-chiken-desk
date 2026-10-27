/** Usuario que el JwtStrategy deja en `request.user`. */
export interface UsuarioAutenticado {
  idUsuario: number;
  usuario: string;
  idRol: number;
  rol: string;
}
