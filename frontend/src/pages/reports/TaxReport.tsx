// TaxReport component removed: Tax report feature deprecated and backend API removed.
// This placeholder avoids accidental runtime import errors while the cleanup completes.

export default function TaxReportPlaceholder() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Tax Report (removed)</h1>
      <p className="mt-2 text-gray-600">
        The Tax Report feature has been removed from the API and the UI. This
        page is a temporary placeholder. You can safely delete this file once
        all references to tax reporting have been removed and CI/consumers are
        verified.
      </p>
    </div>
  );
}
