/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import Link from "next/link";
import { CloseCircleOutlined, MenuOutlined } from "@ant-design/icons";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@/lib/ThemeContext";

// Button component for consistent styling
function Button({ text }: { text: string }) {
  return (
    <button className="px-6 py-3 rounded-xl text-sm text-zinc-400 hover:text-emeraldlight hover:bg-white hover:bg-opacity-5">
      {text}
    </button>
  );
}

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <>
      <nav className="w-full flex h-18 items-center justify-between top-0 py-6">
        {/* Logo section */}
        <div className="flex flex-row gap-4 text-primary items-center text-xl lg:ml-[20vw] ml-4">
          <Link href="https://electisec.com/">
            <img
              alt="Logo"
              src={theme === 'light' ? "/logo.svg" : "/darklogo.svg"}
              className="h-10"
            />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="px-8 py-3 rounded-xl lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MenuOutlined />
        </button>

        {/* Desktop menu */}
        <div className="hidden lg:flex flex-row items-center gap-1 lg:mr-[20vw]">
          <Link href="https://reports.electisec.com/">
            <Button text="Reports" />
          </Link>
          <Link href="https://blog.electisec.com/">
            <button className="px-6 py-3 rounded-xl text-sm hover:text-darkgreen text-bold text-emeraldlight">
              Blog
            </button>
          </Link>
          <Link href="https://research.electisec.com/">
            <Button text="Research" />
          </Link>

          <Link href="https://electisec.com/fellowships">
            <Button text="Fellowships" />
          </Link>
          <Link href="https://electisec.com/services">
            <Button text="Services" />
          </Link>
          <Link href="https://electisec.com/team">
            <Button text="Team" />
          </Link>
          <Link href="https://electisec.com/contact-us">
            <button className="px-8 py-3 rounded-xl text-md font-bold bg-emeraldlight bg-opacity-20 text-button hover:bg-opacity-5">
              Contact
            </button>
          </Link>

          {/* Theme toggle */}
          <div className="ml-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="w-full h-full z-40">
          <div className="pt-8 mx-auto flex flex-col p-8 gap-2">
            <button
              onClick={() => setMenuOpen(false)}
              className="text-green-400"
            >
              <CloseCircleOutlined style={{ fontSize: "2rem" }} />
            </button>

            <Link href="https://reports.electisec.com/">
              <button className="p-6 rounded-xl w-full text-xl text-zinc-400 hover:text-emeraldlight hover:bg-darkgreen hover:bg-opacity-5">
                Reports
              </button>
            </Link>
            <Link href="https://blog.electisec.com/">
              <button className="p-6 rounded-xl w-full text-xl text-emeraldlight hover:bg-darkgreen hover:bg-opacity-5">
                Blog
              </button>
            </Link>
            <Link href="https://research.electisec.com/">
              <button className="p-6 rounded-xl w-full text-xl text-zinc-400 hover:text-emeraldlight hover:bg-darkgreen hover:bg-opacity-5">
                Research
              </button>
            </Link>
            <Link href="https://electisec.com/fellowships">
              <button
                onClick={() => setMenuOpen(false)}
                className="p-6 rounded-xl w-full text-xl text-zinc-400 hover:text-emeraldlight hover:bg-darkgreen hover:bg-opacity-5"
              >
                Fellowships
              </button>
            </Link>
            <Link href="https://electisec.com/services">
              <button
                onClick={() => setMenuOpen(false)}
                className="p-6 rounded-xl w-full text-xl text-zinc-400 hover:text-emeraldlight hover:bg-white hover:bg-opacity-5"
              >
                Services
              </button>
            </Link>
            <Link href="https://electisec.com/team">
              <button
                onClick={() => setMenuOpen(false)}
                className="p-6 rounded-xl w-full text-xl text-zinc-400 hover:text-emeraldlight hover:bg-white hover:bg-opacity-5"
              >
                Team
              </button>
            </Link>
            <Link href="https://electisec.com/contact-us">
              <button
                onClick={() => setMenuOpen(false)}
                className="p-6 rounded-xl w-full text-xl text-emeraldlight text-bold hover:bg-darkgreen hover:bg-opacity-5"
              >
                Contact
              </button>
            </Link>

            {/* Theme toggle in mobile menu */}
            <div className="p-6 flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
