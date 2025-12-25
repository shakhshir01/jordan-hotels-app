import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="flex justify-between items-center px-12 py-6 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-50">
    <Link to="/" className="text-2xl font-black text-jordan-blue tracking-tighter">
      VISIT<span className="text-petra-rose">JO</span>
    </Link>
    <div className="space-x-8 font-bold flex items-center text-gray-600">
      <Link to="/" className="hover:text-jordan-blue transition">Destinations</Link>
      <Link to="/login" className="hover:text-jordan-blue transition">Sign In</Link>
      <Link to="/signup" className="bg-jordan-blue text-white px-8 py-3 rounded-2xl hover:bg-dead-sea shadow-md transition-all">Register</Link>
    </div>
  </nav>
);
export default Navbar;