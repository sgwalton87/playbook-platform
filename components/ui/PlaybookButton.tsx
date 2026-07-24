import Link from "next/link";

type PlaybookButtonProps = {
  children: React.ReactNode;
  href?: string;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
};

export function PlaybookButton({ children, href, type = "button", variant = "primary", onClick }: PlaybookButtonProps) {
  const className = `playbook-button playbook-button--${variant}`;
  if (href) return <Link href={href} className={className}>{children}</Link>;
  return <button type={type} onClick={onClick} className={className}>{children}</button>;
}
