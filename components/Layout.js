import Head from "next/head";
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout(props) {
  let title = props.pageName
  if (title) title = String(title) + " | Food Pantry"
  else title = "Food Pantry";

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex-auto flex-shrink-0">
          {props.children}
        </main>
        <Footer />
      </div>
    </>
  );
}

