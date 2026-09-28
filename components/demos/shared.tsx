"use client";
export function DemoNotice() {
  return (
    <div className="demo-notice">
      <span className="demo-dot" />
      Interactive demo · Fictional data · No live client connection
    </div>
  );
}
export function downloadDemo(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function DemoMetrics({ items }: { items: [string, string, string][] }) {
  return (
    <dl className="demo-metrics">
      {items.map(([label, value, detail]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
          <p>{detail}</p>
        </div>
      ))}
    </dl>
  );
}
