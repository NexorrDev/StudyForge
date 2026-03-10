export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 7) return date.toLocaleDateString("fr-FR");
  if (days > 0) return `Il y a ${days}j`;
  if (hours > 0) return `Il y a ${hours}h`;
  if (minutes > 0) return `Il y a ${minutes}min`;
  return "A l'instant";
}

export function calculateLevel(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const current = xp - 100 * (level - 1) ** 2;
  const next = 100 * level ** 2 - 100 * (level - 1) ** 2;
  return { level, current, next };
}

export function generateShareSlug(): string {
  return Math.random().toString(36).substring(2, 10);
}
