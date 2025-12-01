import { useAtom } from "@lfades/atom"
import { colors } from "../theme"
import { isLoadingAtom, messagesAtom } from "./atoms"

export function MessageList() {
	const [messages] = useAtom(messagesAtom)
	const [isLoading] = useAtom(isLoadingAtom)

	return (
		<scrollbox
			style={{
				flexGrow: 1,
				paddingLeft: 1,
				paddingRight: 1,
				paddingTop: 1,
			}}
			focused={false}
		>
			{messages.map((msg, i) => (
				<box key={i} style={{ marginBottom: 1 }}>
					{msg.role === "system" ? (
						<text fg={colors.muted}>
							{msg.content} <span fg={colors.muted}>{msg.timestamp}</span>
						</text>
					) : msg.role === "user" ? (
						<text>
							<span fg={colors.pink}>❯ </span>
							<span fg={colors.text}>{msg.content}</span>
							<span fg={colors.muted}> {msg.timestamp}</span>
						</text>
					) : (
						<text>
							<span fg={colors.green}>← </span>
							<span fg={colors.text}>{msg.content}</span>
							<span fg={colors.muted}> {msg.timestamp}</span>
						</text>
					)}
				</box>
			))}
			{isLoading && (
				<box>
					<text>
						<span fg={colors.green}>← </span>
						<span fg={colors.muted}>thinking...</span>
					</text>
				</box>
			)}
		</scrollbox>
	)
}
