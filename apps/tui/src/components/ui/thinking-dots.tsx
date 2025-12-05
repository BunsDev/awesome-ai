import { colors } from "../../theme"
import { AnimatedDots } from "./animated-dots"

interface ThinkingDotsProps {
	color?: string
}

export function ThinkingDots({ color = colors.muted }: ThinkingDotsProps) {
	return <AnimatedDots label="thinking" color={color} />
}
