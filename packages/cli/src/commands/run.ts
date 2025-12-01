import { Command } from "commander"
import path from "path"
import { runTui } from "tui"
import { z } from "zod"
import { handleError } from "@/src/utils/handle-error"
import { logger } from "@/src/utils/logger"

export const runOptionsSchema = z.object({
	agent: z.string().optional(),
	cwd: z.string(),
})

export const run = new Command()
	.name("run")
	.description("start an interactive TUI chat with an agent")
	.argument("[agent]", "name of the agent to run", "coding-agent")
	.option(
		"-c, --cwd <cwd>",
		"the working directory. defaults to the current directory.",
		process.cwd(),
	)
	.action(async (agent, opts) => {
		try {
			const options = runOptionsSchema.parse({
				agent,
				cwd: path.resolve(opts.cwd),
			})

			const agentName = options.agent || "coding-agent"

			await runTui(agentName)
		} catch (error) {
			logger.break()
			handleError(error)
		}
	})
