import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout(props) {
  return (
    <div className="flex flex-col min-h-screen ">
      <Navbar />
      <main className="flex-grow w-full max-w-4xl p-4 mx-auto md:px-8 md:py-16">
        {props.children}
      </main>
      <Footer />
    </div>
  );
}

