export const TONE = {
  success: "emerald", 
  info: "blue", 
  analytics: "purple", 
  attention: "amber", 
  critical: "rose", 
  neutral: "gray", 
};

export function toneKey(name) {
  return TONE[name] ?? name;
}
