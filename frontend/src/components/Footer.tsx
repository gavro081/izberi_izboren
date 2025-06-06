import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-600 text-center text-white py-4 mt-auto">
      <p className="text-sm">&copy; {new Date().getFullYear()} ИзбериИзборен.</p>
    </footer>
  );
};
export default Footer;
