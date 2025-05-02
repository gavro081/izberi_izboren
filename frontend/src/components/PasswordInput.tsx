import { useState } from "react";
interface PasswordInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string
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
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
      >
        {showPassword ? "Hide" : "Show"}
      </button>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
    </div>
  );
};

export default PasswordInput;
