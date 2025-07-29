import { Stethoscope } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Stethoscope className="text-primary" />
              <span className="font-bold text-slate-900">MedCode Dictionary</span>
            </div>
            <p className="text-sm text-slate-600">
              Professional medical code search platform for healthcare providers
            </p>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Code System Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  CSV Templates
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  System Status
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-3">System Status</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Database: Operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Search: Operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Upload: Operational</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 mt-8 pt-6 flex justify-between items-center">
          <p className="text-sm text-slate-500">© 2024 MedCode Dictionary. All rights reserved.</p>
          <p className="text-sm text-slate-500">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </footer>
  );
}
