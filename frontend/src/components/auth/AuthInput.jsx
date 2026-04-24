import Input from "../ui/Input";

export default function AuthInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  icon,
  autoComplete,
  error,
  canTogglePassword = false,
}) {
  return (
    <Input
      id={id}
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      icon={icon}
      autoComplete={autoComplete}
      error={error}
      canTogglePassword={canTogglePassword}
    />
  );
}
