export const uploadLimits = {
  maxSizeMb: 5,
  maxSizeBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'] as const,
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] as const,
};
