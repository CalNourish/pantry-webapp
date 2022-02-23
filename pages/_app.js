import UserProvider from '../context/userContext'
import CartProvider from '../context/cartContext'
import "../styles/index.css"
import App from 'next/app'
import cookies from 'next-cookies'

export const server = process.env.NEXT_PUBLIC_VERCEL_URL ? ("https://" + process.env.NEXT_PUBLIC_VERCEL_URL) : "http://localhost:3000"

// Custom App to wrap it with context provider
export default function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </UserProvider>
  )
}

// this stuff puts stuff into props...do we need to do that if everything is stored in the context?
// when you remove this there are some issues with making CORS requests...why?
MyApp.getInitialProps = async (appContext) => {
  const { ctx } = appContext;
  // Calls `getInitialProps` and fills `appProps.pageProps`
  let error;
  const appProps = await App.getInitialProps(appContext);

  const { firebaseToken } = cookies(ctx);

  // If token exists run Firebase validation on server side before rendering.
  if (firebaseToken) {
    try {
      const headers = {
        'Context-Type': 'application/json',
        Authorization: JSON.stringify({ "token": firebaseToken }),
      };
      const result = await fetch(`${server}/api/validate`, { headers }).then((res) => res.json());
      return { ...result, ...appProps };
    } catch (e) {
      console.log(e);
    }
  }
  return { ...appProps };
};
