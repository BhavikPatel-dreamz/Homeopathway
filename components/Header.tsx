'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { checkIsUserLoggedIn } from "@/lib/userUtils";
import HeaderLogin from "./HeaderLogin";
import HeaderInner from "./HeaderInner";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const pathname = usePathname();

  // check if current page is home
  const isHome = pathname === "/";

  useEffect(() => {
    const checkUser = async () => {
      const loggedIn = await checkIsUserLoggedIn();
      setIsLoggedIn(loggedIn);
    };
    checkUser();
  }, []);

  // ✅ handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ if inner page → show HeaderInner only
  if (!isHome) {
    return <HeaderInner />;
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full px-6 py-[17px] z-50 transition-all duration-500 ${
        isSticky
          ? "bg-[#F5F3ED] shadow-md"
          : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-0 lg:px-5 flex justify-end items-center text-white">
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <HeaderLogin />
          ) : (
            <Link href="/login">
               <button
                className={`text-montserrat px-4 py-[5px] border rounded-full font-semibold text-[16px] leading-[24px] cursor-pointer transition-all duration-500 ${
                  isSticky
                    ? "text-[#20231E] border-[#20231E] hover:bg-[#20231E] hover:text-white"
                    : "text-[#D3D6D1] border-[#D3D6D1] hover:text-[#20231E] hover:border-[#20231E]"
                }`}
              >
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
