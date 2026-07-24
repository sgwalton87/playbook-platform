export function PlaybookInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`playbook-input ${props.className || ""}`.trim()} />;
}
