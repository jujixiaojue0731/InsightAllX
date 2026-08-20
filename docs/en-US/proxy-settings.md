# InsightAll Proxy Settings

This document provides the detailed version of the Proxy Settings section in the README.

- A bare `host:port` value is treated as an HTTP proxy.
- If advanced proxy fields are left empty, InsightAll falls back to **Proxy Server**.
- Saving proxy settings reapplies Electron networking immediately and restarts the Gateway automatically.
- When Telegram is enabled, InsightAll also syncs the proxy to insightAll's Telegram channel configuration.
- When the InsightAll proxy is disabled, a normal Gateway restart preserves an existing Telegram channel proxy.
- To explicitly clear the Telegram proxy from insightAll configuration, disable the proxy and save the proxy settings once.
- In **Settings -> Advanced -> Developer**, you can run **insightAll Doctor**, which executes `openclaw doctor --json` and displays the diagnostic output in the app.
- In packaged Windows builds, the bundled `openclaw` CLI/TUI runs through the shipped `node.exe` entry point to keep terminal input behavior stable.
