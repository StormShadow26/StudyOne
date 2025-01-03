import React, { useEffect } from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
import logo from "../../assets/Logo/file (1).png";
import { NavbarLinks } from "../../data/navbar-links";
import { useSelector } from "react-redux";
import { AiOutlineShoppingCart } from "react-icons/ai";
import ProfileDropDown from "../core/Auth/ProfileDropDown";
import { useState } from "react";
import { categories } from "../../services/apis";
import { apiConnector } from "../../services/apiconnector";

const Navbar = () => {

  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  const [sublLinks, setSubLinks] = useState([]);

  const fetchSublinks = async () => {
    try {
      const result = await apiConnector("GET", categories.CATEGORIES_API);
      console.log("Printing result", result);
      setSubLinks(result.data.data);
    } catch (error) {
      console.log("could not fetch category lists!");
    }
  };
  useEffect(() => {
    fetchSublinks();
  },[]);

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <div className="w-11/12 flex h-12 items-center justify-center border-b-[1px] border-b-richblack-700">
      <div className="w-full flex max-w-maxContent justify-between items-center">
        {/* Logo */}
        <Link to="/">
          <img src={logo} className="w-1/4 -mb-1" alt="Logo" />
        </Link>

        {/* NavLinks */}
        <nav >
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <div>
                    <p>{link.title}</p>
                    
                  </div>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-green-1"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/*Login/signup/dashboard */}

        <div className="flex gap-x-4 items-center ">
          {user && user?.accountType != "Instructor" && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="w-[10px]" />
              {totalItems > 0 && (
                <span className="text-green-1 rounded-md">{totalItems}</span>
              )}
            </Link>
          )}

          {token === null && (
            <Link
              to="/login"
              className="border border-richblack-700 bg-richblack-800
                 px-[12px] py-[5px] text-richblack-100 rounded-md"
            >
              <button>Login</button>
            </Link>
          )}
          {token === null && (
            <Link
              to="/signup"
              className="border border-richblack-700 bg-richblack-800
                 px-[12px] py-[5px] text-richblack-100 rounded-md"
            >
              <button>Signup</button>
            </Link>
          )}

          {token !== null && <ProfileDropDown></ProfileDropDown>}
        </div>
      </div>
      
    </div>
  );
};

export default Navbar;
