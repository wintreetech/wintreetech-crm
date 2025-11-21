import React from "react";
import { DraftingCompass } from "lucide-react";

const ComingSoon = ({ title = "" }) => {
  return (
    <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 transition-colors">
      <div className="max-w-lg text-center px-6 py-10 rounded-2xl bg-white dark:bg-slate-950 shadow-md border border-slate-100 dark:border-slate-700">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-300">
            <DraftingCompass />
          </span>
        </div>

        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          The {title} page is under development.
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          We’re still working on this page. Check back soon for updates!
        </p>

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          ← Go back
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
