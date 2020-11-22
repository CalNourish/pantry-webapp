import UserProvider from '../context/userContext'
import "../styles/index.css"
import firebase from 'firebase'

// Custom App to wrap it with context provider
export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  )
}
