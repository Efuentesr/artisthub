const styles = {
  instagram: "bg-rose-500/15 text-rose-300 border-rose-500/20",
  tiktok:    "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  facebook:  "bg-blue-500/15 text-blue-300 border-blue-500/20",
};

const labels = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
};

export default function PlatformBadge({ platform, size = "sm" }) {
  const base = styles[platform] || "bg-white/10 text-white/50";
  const text = size === "xs" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${base} ${text}`}>
      {labels[platform] || platform}
    </span>
  );
}
