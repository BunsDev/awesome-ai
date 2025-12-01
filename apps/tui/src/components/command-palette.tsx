import { useAtom } from "@lfades/atom"
import type { ScrollBoxRenderable } from "@opentui/core"
import type { RefObject } from "react"
import { COMMANDS } from "../commands"
import { colors } from "../theme"
import { commandFilterAtom, selectedCommandAtom } from "./atoms"

interface CommandPaletteProps {
	scrollRef: RefObject<ScrollBoxRenderable | null>
}

export function CommandPalette({ scrollRef }: CommandPaletteProps) {
	const [filter] = useAtom(commandFilterAtom)
	const [selectedIndex] = useAtom(selectedCommandAtom)
	const commands = COMMANDS.filter((cmd) =>
		cmd.name.toLowerCase().includes(filter.toLowerCase()),
	)

	if (commands.length === 0) return null

	return (
		<box
			style={{
				marginLeft: 1,
				marginRight: 1,
				marginBottom: 0,
				border: true,
				borderStyle: "single",
				borderColor: colors.border,
				backgroundColor: colors.bg,
				flexDirection: "column",
				height: Math.min(commands.length + 2, 12),
			}}
		>
			<scrollbox
				ref={scrollRef}
				style={{
					flexGrow: 1,
					contentOptions: {
						backgroundColor: colors.bg,
					},
					scrollbarOptions: {
						trackOptions: {
							foregroundColor: colors.green,
							backgroundColor: colors.bgLight,
						},
					},
				}}
				focused={false}
			>
				{commands.map((cmd, i) => (
					<box
						key={cmd.name}
						style={{
							height: 1,
							backgroundColor:
								i === selectedIndex ? colors.greenDark : colors.bg,
							paddingLeft: 1,
							paddingRight: 1,
						}}
					>
						<text>
							<span fg={colors.green}>{cmd.name.padEnd(14)}</span>{" "}
							<span fg={colors.muted}>{cmd.description}</span>
						</text>
					</box>
				))}
			</scrollbox>
		</box>
	)
}
