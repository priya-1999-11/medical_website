import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-50 w-full border-t border-slate-200/50 pt-20 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-8 py-12 max-w-7xl mx-auto">
        <div className="md:col-span-1">
          <div className="text-lg font-bold text-slate-900 font-headline mb-6">
            Clinical Serenity
          </div>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Redefining the medical experience through empathy, transparency, and
            superior clinical expertise.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">share</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">chat</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-headline font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">
            About Us
          </h4>
          <ul className="space-y-4">
            <li>
              <Link
                to="#"
                className="text-slate-500 hover:text-blue-600 transition-colors text-sm"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="text-slate-500 hover:text-blue-600 transition-colors text-sm"
              >
                Careers
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="text-slate-500 hover:text-blue-600 transition-colors text-sm"
              >
                Medical Board
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="text-slate-500 hover:text-blue-600 transition-colors text-sm"
              >
                News & Press
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">
            Support
          </h4>
          <ul className="space-y-4">
            <li>
              <Link
                to="#"
                className="text-slate-500 hover:text-blue-600 transition-colors text-sm"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="text-slate-500 hover:text-blue-600 transition-colors text-sm"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="text-slate-500 hover:text-blue-600 transition-colors text-sm"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="text-slate-500 hover:text-blue-600 transition-colors text-sm"
              >
                Feedback
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">
            Subscribe
          </h4>
          <p className="text-slate-500 text-xs mb-4">
            Stay updated with wellness tips and health alerts.
          </p>
          <div className="flex rounded-xl overflow-hidden shadow-sm border border-slate-200">
            <input
              className="flex-1 bg-white border-none px-4 py-3 text-sm focus:ring-0"
              placeholder="Email"
              type="email"
            />
            <button className="bg-primary text-white px-4">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-8 border-t border-slate-200/50 mt-12 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-slate-500 text-xs">
          © 2024 Clinical Serenity Medical Group. All rights reserved.
        </div>
        <div className="flex gap-6 text-xs text-slate-500">
          <Link to="#" className="hover:text-primary">
            Accreditations
          </Link>
          <Link to="#" className="hover:text-primary">
            Patient Rights
          </Link>
          <Link to="#" className="hover:text-primary">
            Sustainability
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;