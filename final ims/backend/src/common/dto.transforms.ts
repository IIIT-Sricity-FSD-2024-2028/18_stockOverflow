export const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
