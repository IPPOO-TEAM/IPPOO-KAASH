import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { dictionaries } from "../i18n/translations";
import { storage } from "../utils/storage";

interface State {
  error: Error | null;
}

function tStatic(key: string): string {
  const code = storage.get<string>("ippoo_cash_language") ?? "fr";
  const dict = (dictionaries as Record<string, Record<string, string>>)[code] ?? dictionaries.fr;
  return dict[key] ?? dictionaries.fr[key] ?? key;
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error("[IPPOO ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
    try {
      window.location.assign("/");
    } catch {
      // ignore
    }
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
        <div className="max-w-sm w-full bg-white rounded-3xl p-6 text-center" style={{ boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FEE2E2] flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-[#DC2626]" />
          </div>
          <h2 className="text-[#0F172A]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
            {tStatic("errBoundary.title")}
          </h2>
          <p className="text-[13px] text-[#6B7280] mt-2">
            {tStatic("errBoundary.subtitle")}
          </p>
          {import.meta.env?.DEV && (
            <pre className="text-[11px] text-left text-[#DC2626] bg-[#FEF2F2] rounded-xl p-3 mt-4 overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="mt-5 w-full h-12 rounded-2xl bg-[#14B85A] text-white flex items-center justify-center gap-2"
            style={{ fontWeight: 600 }}
          >
            <RefreshCw size={16} /> {tStatic("errBoundary.reload")}
          </button>
        </div>
      </div>
    );
  }
}
