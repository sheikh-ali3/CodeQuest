import { Link, useLocation } from "wouter";
import { Stethoscope, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Search", active: location === "/" || location === "/search" },
    { path: "/upload", label: "Upload", active: location === "/upload" },
    { path: "/admin", label: "Admin", active: location === "/admin" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Stethoscope className="text-primary text-xl" />
                <h1 className="text-xl font-bold text-slate-900">MedCode Dictionary</h1>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-8 ml-8">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                      item.active
                        ? "text-primary border-primary"
                        : "text-slate-500 hover:text-slate-700 border-transparent hover:border-slate-300"
                    }`}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">DR</span>
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">
                Dr. Sarah Chen
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
