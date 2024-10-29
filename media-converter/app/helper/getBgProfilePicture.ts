const backgroundColors = [
  "rgb(239 68 68)",
  "rgb(249 115 22)",
  "rgb(245 158 11)",
  "rgb(234 179 8)",
  "rgb(132 204 22)",
  "rgb(34 197 94)",
  "rgb(16 185 129)",
  "rgb(20 184 166)",
  "rgb(6 182 212)",
  "rgb(14 165 233)",
  "rgb(59 130 246)",
  "rgb(99 102 241)",
  "rgb(139 92 246)",
  "rgb(168 85 247)",
  "rgb(217 70 239)",
  "rgb(236 72 153)",
  "rgb(244 63 94)",
];

export default function getBgProfilePicture(char: string) {
  return backgroundColors[char.charCodeAt(0) % backgroundColors.length];
}
