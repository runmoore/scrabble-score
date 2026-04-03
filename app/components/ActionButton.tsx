type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function ActionButton({ children, className, ...props }: ActionButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-2xl border border-black bg-gray-100 p-2 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-400 dark:bg-gray-800 dark:text-gray-200${className ? ` ${className}` : ""}`}
    >
      {children}
    </button>
  );
}
