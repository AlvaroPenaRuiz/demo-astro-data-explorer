export const mapTypeLabel = (type: string | null | undefined): string => {
    if (!type) return 'Other';
    
    if (type === 'PN' || type === 'PN?') return 'Planetary nebula';
    if (type.startsWith('No')) return 'Nova';
    if (type === 'AGN') return 'Active galaxy nucleus';
    if (type === 'Gl?') return 'Globular cluster (candidate)';
    if (type === '*') return 'Star';
    
    return 'Other';
};
