import { Component, ReactNode } from "react";

interface Props { children: ReactNode; label?: string }
interface State { hasError: boolean; message: string }

/**
 * Top-level safety net. If any simulation or rendering code throws at
 * runtime, we show a small friendly recovery card instead of a blank
 * white screen — the site never "closes".
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("[MediTwin] runtime error:", error, info);
  }

  private reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid h-full min-h-[16rem] place-items-center bg-[#050a12] p-6">
          <div className="w-[min(92%,26rem)] border border-rose-400/30 bg-[#0a101d]/95 p-5 text-center shadow-2xl">
            <div className="text-2xl">⚠️</div>
            <h2 className="mt-1 text-sm font-bold text-white">A module hit a hiccup</h2>
            <p className="mt-1 text-[10px] leading-snug text-slate-400">
              {this.props.label ?? "The twin"} had a temporary error. The rest of the dashboard keeps running.
            </p>
            <p className="mt-1 truncate font-mono text-[8px] text-rose-300/70">{this.state.message}</p>
            <button
              onClick={this.reset}
              className="mt-3 border border-cyan-400/40 bg-cyan-500/15 px-4 py-1.5 text-[10px] font-bold text-cyan-100 hover:bg-cyan-500/25"
            >
              Recover
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
