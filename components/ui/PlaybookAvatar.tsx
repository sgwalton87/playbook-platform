import ProfileAvatar from "@/components/ProfileAvatar";
export function PlaybookAvatar({ src, name, size = 48 }: { src?: string | null; name: string; size?: number }) {
  return <ProfileAvatar src={src} name={name} size={size} />;
}
