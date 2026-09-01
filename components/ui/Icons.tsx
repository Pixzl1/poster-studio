import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const baseProps: IconProps = {
  'aria-hidden': true,
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function SearchIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14" />
    </svg>
  );
}

export function FileIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

export function DiscIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3a9 9 0 0 0-6.4 2.7M21 12a9 9 0 0 0-2.7-6.4" />
    </svg>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" {...props}>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.22"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
