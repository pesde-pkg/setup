import Transport from "winston-transport";
import * as core from "@actions/core";
import stripAnsi from "strip-ansi";

// remove the scope part, separated from the message by a colon
function stripScopeFromMessage(str: string): string {
	const ansiRemoved = stripAnsi(str);
	const parts = ansiRemoved.split(":");
	return parts.slice(1).join(":").trimStart();
}

export class ActionsTransport extends Transport {
	constructor(opts?: Transport.TransportStreamOptions) {
		super(opts);
	}

	override log(info: any, callback: () => void): void {
		setImmediate(() => this.emit("logged", info));

		if (process.env.GITHUB_ACTIONS === "true") {
			const level = info[Symbol.for("level")];
			const message = stripScopeFromMessage(info.message);
			switch (level) {
				case "info":
					core.info(message);
					break;
				case "warn":
					core.warning(message);
					break;
				case "error":
					core.error(message);
					break;
				case "debug":
					core.debug(message);
					break;
			}
		}
		// should be a no-op outside github actions

		callback();
	}
}
