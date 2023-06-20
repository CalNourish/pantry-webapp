import { NextResponse } from 'next/server';

// Need this for redirect from '/api/signin' back to '/signin'. Redirects as GET instead of POST.
// TODO: Remove this based on resolution for https://github.com/vercel/next.js/issues/35185
export function middleware(req) {
    if (req.method === 'POST') {
        // Redirect to the correct static page using semantic 303
        // ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/303
        return NextResponse.redirect(req.nextUrl.clone(), 303);
    }
}

export const config = {
  matcher: '/signin',
}