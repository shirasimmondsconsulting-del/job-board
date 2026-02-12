import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Professional Israeli Decorative Element */}
      <div className="h-1.5 w-full relative overflow-hidden bg-white">
        <div className="absolute inset-0 flex">
          <div className="h-full w-1/4 bg-[#0038B8] opacity-90"></div>
          <div className="h-full w-1/2 bg-white"></div>
          <div className="h-full w-1/4 bg-[#0038B8] opacity-90"></div>
        </div>
        <div className="absolute inset-x-0 top-0 h-px bg-gray-100/50"></div>
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
