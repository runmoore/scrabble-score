type PillColor = "blue" | "purple";

const pillBase =
  "cursor-pointer select-none rounded-full px-4 py-2 text-sm font-medium transition-colors [-webkit-tap-highlight-color:transparent]";
const pillUnselected =
  "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";

const colorClasses: Record<PillColor, string> = {
  blue: "peer-checked:bg-blue-primary peer-checked:text-white",
  purple: "peer-checked:bg-purple-primary peer-checked:text-white",
};

type PillToggleProps = {
  id: string;
  name: string;
  value: string;
  type: "radio" | "checkbox";
  color: PillColor;
  form?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  defaultChecked?: boolean;
  children: React.ReactNode;
};

export function PillToggle({
  id,
  name,
  value,
  type,
  color,
  form,
  onChange,
  defaultChecked,
  children,
}: PillToggleProps) {
  return (
    <>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        form={form}
        onChange={onChange}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={`${pillBase} ${pillUnselected} ${colorClasses[color]}`}
      >
        {children}
      </label>
    </>
  );
}
