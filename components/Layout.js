import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout(props) {
  return (
    // <div>
    <div className="h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex-auto flex-shrink-0">
        {props.children}
      </main>
      <Footer />
    </div>
  );
}

