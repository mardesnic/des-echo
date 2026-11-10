const PATHS = {
  clear: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  settings:
    'M20 7h-9M14 17H5M14 17a3 3 0 1 0 6 0 3 3 0 1 0-6 0M4 7a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
  replay: 'M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13',
};

export function Icon({ name }: { name: keyof typeof PATHS }) {
  return (
    <svg
      className='icon'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
