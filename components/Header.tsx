/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {  checkIsUserLoggedIn } from "@/lib/userUtils";
import HeaderLogin from "./HeaderLogin";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const loggedIn = await checkIsUserLoggedIn();
      setIsLoggedIn(loggedIn);
    };
    checkUser();
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full px-6 py-[17px] text-white z-50">
      <div className="max-w-7xl mx-auto flex justify-end items-center">
        
        <div className="flex items-center gap-8">
          {isLoggedIn ? <HeaderLogin /> : (
            <>
             <Link href="">
                <button className="font-[600] text-[#D3D6D1] text-[16px] flex items-center hover:text-[#20231E]">
                  <Image 
                    src="/save-icon.svg" 
                    alt="Save icon" 
                    width={16} 
                    height={16} 
                    className="mr-2" 
                  />
                  Save
                </button>
              </Link>
              <Link href="/login">
                <button className="text-montserrat px-4 py-[5px] hover:bg-transparent hover:text-[#20231E] border-1 border-[#D3D6D1] hover:!border-[#20231E] rounded-full transition-colors font-semibold text-[16px] leading-[24px] text-[#D3D6D1] cursor-pointer transition-all duration-500">
                  Login
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
