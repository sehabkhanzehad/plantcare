export const TYPEWRITER_MS_PER_CHAR = 26;

export function typewriterDuration(text: string, msPerChar = TYPEWRITER_MS_PER_CHAR) {
  return text.length * msPerChar + 160;
}
