type AvatarProps = {
  userName?: string;
  imageUrl?: string;
  size?: number; // optional, default 40px
};

export default function Avatar({
  userName = "User",
  imageUrl,
  size = 40,
}: AvatarProps) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold overflow-hidden shadow-sm"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={userName}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className="text-sm">{initial}</span>
      )}
    </div>
  );
}
