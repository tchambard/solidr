export function stringToColor(string: string): string {
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate a more contrasting color
    const r = (hash & 0xff) | 0x80;
    const g = ((hash >> 8) & 0xff) | 0x80;
    const b = ((hash >> 16) & 0xff) | 0x80;

    return `#${(r.toString(16) + g.toString(16) + b.toString(16)).padStart(6, '0')}`;
}

export function hexToRgb(hex: string) {
    if (hex.charAt(0) === '#') {
        hex = hex.slice(1);
    }

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    return { r: r, g: g, b: b };
}

export function hexToRgba(hex: string, alpha: number) {
    let rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
