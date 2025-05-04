import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-center text-gray-600 py-4 mt-auto">
      <p className="text-sm">&copy; {new Date().getFullYear()} ИзбериИзборен.</p>
    </footer>
  );
};
export default Footer;
