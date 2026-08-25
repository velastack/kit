/**
 * A standalone HTML error page, styled for both colour schemes.
 *
 * `message` is interpolated as **trusted HTML**, not escaped — callers pass
 * markup (e.g. `Run <code>vela enable auth</code> to create this page.`). Never
 * pass user input to it.
 */
export const errorPage = (status: number, message: string) => `
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>${status}</title>

		<style>
			body {
				--bg: white;
				--fg: #222;
				--divider: #ccc;
				background: var(--bg);
				color: var(--fg);
				font-family:
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					'Segoe UI',
					Roboto,
					Oxygen,
					Ubuntu,
					Cantarell,
					'Open Sans',
					'Helvetica Neue',
					sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.error {
				display: flex;
				align-items: center;
				max-width: 32rem;
				margin: 0 1rem;
			}

			.status {
				font-weight: 200;
				font-size: 3rem;
				line-height: 1;
				position: relative;
				top: -0.05rem;
			}

			.message {
				border-left: 1px solid var(--divider);
				padding: 0 0 0 1rem;
				margin: 0 0 0 1rem;
				min-height: 2.5rem;
				display: flex;
				align-items: center;
			}

			.message h1 {
				font-weight: 400;
				font-size: 1em;
				margin: 0;
			}

			@media (prefers-color-scheme: dark) {
				body {
					--bg: #222;
					--fg: #ddd;
					--divider: #666;
				}
			}

			code {
				background: #f4f4f4;
				padding: 0.2em 0.4em;
				border-radius: 3px;
				font-size: 0.9em;
				font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
			}

			@media (prefers-color-scheme: dark) {
				code {
					background: #333;
				}
			}
		</style>
	</head>
	<body>
		<div class="error">
			<span class="status">${status}</span>
			<div class="message">
				<h1>${message}</h1>
			</div>
		</div>
	</body>
</html>
`;
