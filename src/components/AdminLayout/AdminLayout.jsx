import { Outlet } from "react-router-dom";
import { useAdmin } from "../../Context/AdminContext.jsx";

const AdminLayout = () => {
  const { adminData } = useAdmin();

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default AdminLayout;
