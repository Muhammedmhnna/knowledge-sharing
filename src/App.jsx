import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/Home/Home";
import Layout from "./components/Layout/Layout";
import NotFound from "./components/NotFound/NotFound";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import Chatbot from "./components/Chatbot/Chatbot";
import Register from "./components/Register/Register.jsx";
import Login from "./components/Login/Login.jsx";
import { UserProvider } from "./Context/UserContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import ForgetPassword from "./components/ForgetPassword/ForgetPassword.jsx";
import ResetPassword from "./components/ResetPassword/ResetPassword.jsx";
import WelcomePage from "./components/Welcome/Welcome.jsx";
import AboutUs from "./components/About/About.jsx";
import Profile from "./components/Profile/Profile.jsx";
import PublicRoute from "./components/PublicRoute/PublicRoute.jsx";
import NotificationsPage from "./components/Notifications/NotificationsPage.jsx";
import SpecPost from "./components/SpecPost/SpecPost.jsx";
import SavedPosts from "./components/SavedPosts/SavedPosts.jsx";
import AdminLogin from "./components/AdminLogin/AdminLogin.jsx";
import AdminForgetPassword from "./components/AdminForgetPassword/AdminForgetPasssword.jsx";
import AdminResetPassword from "./components/AdminResetPassword/AdminResetPassword.jsx";
import AllNationalIds from "./components/AllNationalIds/AllNationalIds.jsx";
import AllProducts from "./components/AllProducts/AllProducts.jsx";
import FlaggedPosts from "./components/FlaggedPosts/FlaggedPosts.jsx";
import { toast } from "react-hot-toast";
import Shop from "./components/Shop/Shop.jsx";
import Post from "./components/Post/Post.jsx";
import AddPost from "./components/AddPost/AddPost.jsx";
import EditPost from "./components/EditPost/EditPost.jsx";
import { AdminProvider } from "./Context/AdminContext.jsx";
import AdminLayout from "./components/AdminLayout/AdminLayout.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute/AdminProtectedRoute.jsx";
import ChatbotPage from "./components/Chatbot/Chatbot";
const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <PublicRoute>
            <WelcomePage />
          </PublicRoute>
        ),
      },
      {
        path: "about",
        element: (
          <ProtectedRoute>
            <AboutUs />
          </ProtectedRoute>
        ),
      },
      {
        path: "home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "savedPosts",
        element: (
          <ProtectedRoute>
            <SavedPosts />
          </ProtectedRoute>
        ),
      },
      {
        path: "post",
        element: (
          <ProtectedRoute>
            <Post />
          </ProtectedRoute>
        ),
      },
      {
        path: "addPost",
        element: (
          <ProtectedRoute>
            <AddPost />
          </ProtectedRoute>
        ),
      },
      {
        path: "editPost/:postId",
        element: (
          <ProtectedRoute>
            <EditPost />
          </ProtectedRoute>
        ),
      },
      {
        path: "chatbot",
        element: (
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        ),
      },
      {
        path: "shop",
        element: (
          <ProtectedRoute>
            <Shop />
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },
      {
        path: "forget-password",
        element: <ForgetPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "post/:id",
        element: <SpecPost />,
      },
      {
        path: "chat",
        element: <ChatbotPage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "admin",
    children: [
      {
        index: true,
        element: <AdminLogin />,
      },
      {
        path: "login",
        element: <AdminLogin />,
      },
      {
        path: "forgetPassword",
        element: <AdminForgetPassword />,
      },
      {
        path: "resetPassword",
        element: <AdminResetPassword />,
      },
      {
        path: "",
        element: (
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        ),
        children: [
          {
            path: "all-products",
            element: <AllProducts />,
          },
          {
            path: "national-ids",
            element: <AllNationalIds />,
          },
          {
            path: "add-product",
            element: <AddProduct />,
          },
          {
            path: "flagged-posts",
            element: <FlaggedPosts />,
          },
          {
            path: "dashboard",
            element: <Dashboard />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

// Create a wrapper component that combines UserProvider and RouterProvider
const AppWithProviders = () => {
  return (
    <div className="bg-white">
      <UserProvider>
        <AdminProvider>
          <RouterProvider router={router} />
        </AdminProvider>
      </UserProvider>
    </div>
  );
};

function App() {
  return (
    <div className="bg-white">
      <AppWithProviders />
    </div>
  );
}

export default App;
