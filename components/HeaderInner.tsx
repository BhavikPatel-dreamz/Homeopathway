
import { useState, useEffect } from "react";

import Logo from "./header/Logo";
import SearchBar from "./SearchBar";
import Image from "next/image";

export default function HeaderInner() {

  const [isSticky, setIsSticky] = useState(false);

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

  return (
  <header
    className={`bg-[#F5F3ED] w-full px-6 py-[16px] text-white z-50 transition-all duration-500 ${
      isSticky ? 'fixed top-0 left-0 shadow-md z-[1000]' : 'relative'
    }`}
  >
      <div className="max-w-7xl mx-auto px-0 lg:px-5 flex justify-between items-center">
          {/*------ Main Logo-----*/}
          <Logo />

          {/*------ Searchbar with Auto-Suggestions -----*/}
          <SearchBar />

          {/*------ Header Button -----*/}
          
          <div className="flex items-cente gap-2">
            <button className="flex items-center justify-center w-[25px] h-[25px] md:w-[35px] md:h-[35px] lg:w-[44px] lg:h-[44px] cursor-pointer">
              <Image height={30} width={30} src="/share-icon.svg" alt="" />
            </button>

            <button className="flex items-center justify-center w-[25px] h-[25px] md:w-[35px] md:h-[35px] lg:w-[44px] lg:h-[44px] cursor-pointer">
              <Image height={30} width={30}  src="/save.svg" alt="" />
            </button>

            <div className="flex items-center justify-center text-center shrink bg-[#C3AF76]  w-[28px] h-[28px] md:w-[35px] md:h-[35px] lg:w-[44px] lg:h-[44px] p-2 text-[20px] lg:text-[24px] font-semibold text-white rounded-full">
              M
            </div>

          </div>
      </div>
    </header>
  )
}
