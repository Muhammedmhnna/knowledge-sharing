import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { useUser } from "../../Context/UserContext";

export default function Layout() {
  const { user } = useUser();

  return (
    <div className="bg-[#E3ECE7] min-h-screen">
      {user ? (
        <>
          <Navbar />
          <div className="w-full">
            <Outlet />
          </div>
          <Footer />
        </>
      ) : (
        <div className="w-full">
          <Outlet />
        </div>
      )}
    </div>
  )
}


