// Cuentas de Google que pueden entrar al panel de citas (#admin).
// Deben coincidir con las cuentas de la regla isAdmin() en firestore.rules.
export const ADMIN_EMAILS = ['greece20cepeda@gmail.com', 'eutimioalejandro@gmail.com'];

export function esAdmin(user) {
  return Boolean(user && user.emailVerified && ADMIN_EMAILS.includes(user.email));
}
