
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  noPadding?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true, noPadding = false }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-grow ${noPadding ? '' : 'pt-16'}`}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
