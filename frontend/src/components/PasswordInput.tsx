import { useState } from "react";
import eyeIcon from "../assets/eye.svg";
import eyeOffIcon from "../assets/eye-off.svg";

interface PasswordInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  name,
  value,
  onChange,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full mb-3 p-2 border rounded"
        placeholder="Password"
        required
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center pb-2"
      >
        <img
          src={showPassword ? eyeOffIcon : eyeIcon}
          alt={showPassword ? "Hide password" : "Show password"}
          className="w-5 h-5"
        />
      </button>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
    </div>
  );
};

export default PasswordInput;
