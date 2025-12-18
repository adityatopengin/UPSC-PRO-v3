/**
 * DEBUG-CONSOLE.JS
 * A drop-in mobile console for debugging on Android/iOS devices.
 * Injects a floating button and captures all console output.
 */

(function() {
    const DebugConsole = {
        init() {
            this.createStyles();
            this.createUI();
            this.interceptConsole();
            this.interceptErrors();
            console.log("🪲 Mobile Debugger Active");
        },

        createStyles() {
            const css = `
                /* Floating Trigger Button */
                #debug-trigger {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    z-index: 10000;
                    width: 48px;
                    height: 48px;
                    background: rgba(15, 23, 42, 0.9);
                    color: #ef4444; /* Red color for visibility */
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    border: 2px solid rgba(255,255,255,0.1);
                    transition: transform 0.2s;
                }
                #debug-trigger:active { transform: scale(0.9); }

                /* Main Overlay */
                #debug-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    z-index: 10001;
                    background: rgba(10, 10, 15, 0.98);
                    flex-direction: column;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                    color: #e2e8f0;
                }

                /* Header */
                #debug-header {
                    padding: 12px;
                    border-bottom: 1px solid #334155;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #1e293b;
                    font-weight: bold;
                }
                .debug-btn {
                    padding: 4px 12px;
                    margin-left: 8px;
                    background: #334155;
                    border: none;
                    color: white;
                    border-radius: 4px;
                    font-size: 12px;
                }

                /* Logs Area */
                #debug-logs {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                    word-break: break-all;
                }
                .log-entry { 
                    padding: 6px 0; 
                    border-bottom: 1px solid #1e293b; 
                    line-height: 1.4;
                }
                .log-time { color: #64748b; font-size: 10px; margin-right: 6px; }
                .log-info { color: #94a3b8; }
                .log-warn { color: #f59e0b; }
                .log-error { color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 4px; }
                .log-user { color: #3b82f6; font-weight: bold; }
                .log-result { color: #10b981; }

                /* Input Area */
                #debug-input-area {
                    display: flex;
                    padding: 12px;
                    border-top: 1px solid #334155;
                    background: #0f172a;
                    align-items: center;
                }
                #debug-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-family: monospace;
                    font-size: 14px;
                    outline: none;
                    margin-left: 8px;
                }
            `;
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        },

        createUI() {
            // Trigger
            const trigger = document.createElement('div');
            trigger.id = 'debug-trigger';
            trigger.innerHTML = '<i class="fa-solid fa-bug"></i>';
            trigger.onclick = () => {
                const overlay = document.getElementById('debug-overlay');
                const isHidden = overlay.style.display === 'none' || overlay.style.display === '';
                overlay.style.display = isHidden ? 'flex' : 'none';
            };
            document.body.appendChild(trigger);

            // Overlay
            const overlay = document.createElement('div');
            overlay.id = 'debug-overlay';
            overlay.innerHTML = `
                <div id="debug-header">
                    <span><span style="color:#ef4444">●</span> Live Console</span>
                    <div>
                        <button class="debug-btn" onclick="document.getElementById('debug-logs').innerHTML=''">Clear</button>
                        <button class="debug-btn" style="background:#ef4444" onclick="document.getElementById('debug-overlay').style.display='none'">Close</button>
                    </div>
                </div>
                <div id="debug-logs"></div>
                <div id="debug-input-area">
                    <span style="color:#3b82f6">➜</span>
                    <input type="text" id="debug-input" placeholder="Execute JS (e.g., Engine.state)" autocomplete="off">
                </div>
            `;
            document.body.appendChild(overlay);

            // Handle Input
            const input = document.getElementById('debug-input');
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = input.value;
                    if (!cmd.trim()) return;
                    
                    this.log('user', cmd);
                    try {
                        // eslint-disable-next-line no-eval
                        const result = eval(cmd);
                        this.printObject('result', result);
                    } catch (err) {
                        this.log('error', err);
                    }
                    input.value = '';
                }
            });
        },

        interceptConsole() {
            const originalLog = console.log;
            const originalWarn = console.warn;
            const originalError = console.error;

            console.log = (...args) => {
                originalLog.apply(console, args);
                this.printArgs('info', args);
            };

            console.warn = (...args) => {
                originalWarn.apply(console, args);
                this.printArgs('warn', args);
            };

            console.error = (...args) => {
                originalError.apply(console, args);
                this.printArgs('error', args);
            };
        },

        interceptErrors() {
            window.onerror = (msg, url, lineNo, columnNo, error) => {
                const str = `${msg}\n@ ${url.split('/').pop()}:${lineNo}`;
                this.log('error', str);
                return false;
            };
            
            // Catch Promise rejections
            window.onunhandledrejection = (event) => {
                this.log('error', `Unhandled Promise: ${event.reason}`);
            };
        },

        printArgs(type, args) {
            args.forEach(arg => this.printObject(type, arg));
        },

        printObject(type, obj) {
            let str;
            if (typeof obj === 'object' && obj !== null) {
                try {
                    str = JSON.stringify(obj, null, 2);
                } catch (e) {
                    str = String(obj);
                }
            } else {
                str = String(obj);
            }
            this.log(type, str);
        },

        log(type, msg) {
            const logs = document.getElementById('debug-logs');
            if (!logs) return;

            const entry = document.createElement('div');
            entry.className = `log-entry log-${type}`;
            
            const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
            entry.innerHTML = `<span class="log-time">${time}</span> ${this.escapeHtml(msg)}`;
            
            logs.appendChild(entry);
            logs.scrollTop = logs.scrollHeight;
        },

        escapeHtml(str) {
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;")
                .replace(/\n/g, "<br>")
                .replace(/  /g, "&nbsp;&nbsp;");
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DebugConsole.init());
    } else {
        DebugConsole.init();
    }
})();

