import { Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";

export interface Dataset {
  _id: string;
  filename: string;
  rowCount: number;
  size: number;
  status: string;
  createdAt: string;
}

export function DatasetList({ items }: { items: Dataset[] }) {
  if (items.length === 0)
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-500">
          No billing imports yet — import a file to begin cost intelligence.
        </p>
      </div>
    );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">
                Billing file
              </th>
              <th className="text-right px-4 py-3 font-semibold text-slate-900">
                Records
              </th>
              <th className="text-right px-4 py-3 font-semibold text-slate-900">
                File size
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">
                Analysis
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">
                Received
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr
                key={d._id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {d.filename}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {d.rowCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {(d.size / 1024).toFixed(1)} KB
                </td>
                <td className="px-4 py-3">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(d.status)}`}
                  >
                    {getStatusIcon(d.status)}
                    {d.status}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(d.createdAt).toLocaleDateString()}{" "}
                  {new Date(d.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/datasets/${d._id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
