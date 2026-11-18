import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-gray-600 max-w-sm mb-6">
        The administration module or resource you requested does not exist or has been relocated.
      </p>
      <Link to="/">
        <Button variant="primary" size="md" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Button>
      </Link>
    </div>
  );
};
