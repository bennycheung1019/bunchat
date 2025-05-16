// components/icons/DiamondIcon.tsx
interface DiamondIconProps {
    className?: string;
}

export default function DiamondIcon({ className = "w-4 h-4 text-blue-500" }: DiamondIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path d="M6 3L3 9l9 12 9-12-3-6H6z" />
        </svg>
    );
}
