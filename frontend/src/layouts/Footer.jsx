import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Train, Bus, Shield, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#F7E1C9] border-t border-[#E8D5C2] mt-auto text-[#1D3536] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#407778] flex items-center justify-center text-[#FBF0E6] shadow-sm">
                <Ticket className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-bold text-[#407778] tracking-tight">RailBus</span>
            </div>
            <p className="text-sm text-[#526D6E] leading-relaxed">
              Unified transport ticketing portal for modern railway and intercity bus journeys. Concurrency-safe, instant reservations with real-time seat tracking.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#407778] bg-[#FBF0E6] px-3 py-1.5 rounded-lg border border-[#E8D5C2] w-fit">
              <Shield className="w-4 h-4 text-[#65AFB0]" />
              PCI-DSS & ISO Compliant Sandbox
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#407778] mb-4">
              Booking Services
            </h3>
            <ul className="space-y-2.5 text-sm text-[#526D6E]">
              <li>
                <Link to="/trains" className="hover:text-[#407778] flex items-center gap-2 transition-colors">
                  <Train className="w-4 h-4 text-[#65AFB0]" />
                  Railway Booking
                </Link>
              </li>
              <li>
                <Link to="/buses" className="hover:text-[#407778] flex items-center gap-2 transition-colors">
                  <Bus className="w-4 h-4 text-[#65AFB0]" />
                  Intercity Bus Booking
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-[#407778] transition-colors">
                  Manage Bookings & PNR
                </Link>
              </li>
              <li>
                <Link to="/seat-map-guide" className="hover:text-[#407778] transition-colors">
                  Interactive Seat Layouts
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Reliability */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#407778] mb-4">
              Quality & Architecture
            </h3>
            <ul className="space-y-2.5 text-sm text-[#526D6E]">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#65AFB0]"></span>
                Atomic Seat Lock Engine
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#65AFB0]"></span>
                Selenium Test Automation Suite
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#65AFB0]"></span>
                JMeter Stress & Endurance Plans
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#65AFB0]"></span>
                Cryptographic PDF e-Tickets
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#407778] mb-4">
              System Support
            </h3>
            <div className="space-y-2.5 text-sm text-[#526D6E]">
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#65AFB0]" />
                +1 (800) 555-RAIL-BUS
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#65AFB0]" />
                support@railbus-portal.org
              </p>
              <p className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#65AFB0]" />
                Central Transit Tech Hub
              </p>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="border-t border-[#E8D5C2] pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-[#526D6E] gap-3">
          <p>© {new Date().getFullYear()} RailBus Transportation Platform. Built to industry QA specifications.</p>
          <div className="flex gap-6">
            <span className="hover:text-[#407778] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#407778] cursor-pointer">Terms of Carriage</span>
            <span className="hover:text-[#407778] cursor-pointer">Fare Rules</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
