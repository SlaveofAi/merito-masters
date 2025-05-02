
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface NavLinkProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({
  to,
  label,
  icon,
  className,
  activeClassName,
  onClick
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100",
        isActive && (activeClassName || "bg-gray-100 text-gray-900 font-medium"),
        className
      )}
      onClick={onClick}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </Link>
  );
};

export const BookingsNavLink: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <NavLink 
      to="/bookings" 
      label="Zákazky" 
      className="ml-4 whitespace-nowrap text-base font-medium text-gray-700 hover:text-gray-900"
    />
  );
};
