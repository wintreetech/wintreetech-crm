import { useRouteError, useNavigate } from "react-router-dom";
import { Undo2, RefreshCw, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/slices/Auth.slice";

function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const currentUser = useSelector(selectCurrentUser);

  return (
    // bg-base-200 gives that light gray (light mode) / dark gray (dark mode) look
    <div className="min-h-screen w-full flex items-center justify-center bg-base-200 p-4 font-sans">
      <div className="max-w-md w-full bg-base-100 rounded-2xl p-8 shadow-xl text-center border border-base-300">
        {/* Simple Icon with a subtle glow */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-error/10 rounded-full">
            <AlertCircle size={48} className="text-error" />
          </div>
        </div>

        {/* Text Content */}
        <h2 className="text-2xl font-bold text-base-content mb-2">
          Application Error
        </h2>
        <p className="text-base-content/60 mb-6 text-sm">
          Something went wrong while loading this page. This usually happens due
          to a connection glitch or a temporary server issue.
        </p>

        {/* Simple Error Alert Box */}
        <div className="alert bg-base-200 border-none text-left mb-8 py-3 px-4 rounded-lg">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">
              Error Log
            </span>
            <span className="text-xs font-mono text-error break-all">
              {error.statusText || error.message || "Unknown Exception"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() =>
              navigate(
                currentUser?.role === "superadmin"
                  ? "/dashboard"
                  : `/${currentUser?.department?.toLowerCase() || ""}`,
              )
            }
            className="btn btn-ghost w-full gap-2 text-base-content/70"
          >
            <Undo2 size={18} />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
