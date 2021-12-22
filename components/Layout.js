import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout(props) {
  return (
    <div className="flex flex-col min-h-screen h-0">
      <Navbar />
      <main className="flex-grow w-full">
        {props.children}
      </main>
      <Footer />
    </div>
  );
}

