// components/icons/DiamondIcon.tsx
interface DiamondIconProps {
    className?: string;
}
/*

//SVG VERSION
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
*/


//EMOJI VERSION  
export default function DiamondIcon({ className = "" }: DiamondIconProps) {
    return (
        <span
            className={`inline-flex items-center justify-center leading-none text-[1rem] ${className}`}
            role="img"
            aria-label="diamond"
            style={{ transform: "translateY(-0px)" }}
        >
            💎
        </span>
    );
}
