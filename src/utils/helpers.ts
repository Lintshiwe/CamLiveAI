export function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return '#34C759';
  if (confidence >= 50) return '#FF9500';
  return '#FF3B30';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 80) return 'High';
  if (confidence >= 50) return 'Medium';
  return 'Low';
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function formatDuration(start: Date): string {
  const diff = Math.floor((Date.now() - start.getTime()) / 1000);
  const h = Math.floor(diff / 3600).toString().padStart(2, '0');
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
  const s = (diff % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}
