export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/gym/:path*', '/dashboard/:path*']
}