type Highlight = "date" | "amount" | "store" | null;

type Line =
  | { kind: "h"; txt: string }
  | { kind: "b" }
  | { kind: "kv"; k: string; v: string; hl?: "date" | "amount" | "store"; bold?: boolean };

type Props = {
  width?: number;
  scale?: number;
  ocrHighlight?: Highlight;
};

const DEFAULT_LINES: Line[] = [
  { kind: "h", txt: "KHUM PHAYA RESORT" },
  { kind: "h", txt: "CHIANG MAI · TH" },
  { kind: "b" },
  { kind: "kv", k: "Date", v: "12/11/2025", hl: "date" },
  { kind: "kv", k: "Time", v: "14:32" },
  { kind: "kv", k: "Receipt", v: "#A-0044-2025" },
  { kind: "b" },
  { kind: "kv", k: "Deluxe Room ×2", v: "3,800.00" },
  { kind: "kv", k: "Breakfast", v: "320.00" },
  { kind: "kv", k: "Service 10%", v: "80.00" },
  { kind: "b" },
  { kind: "kv", k: "TOTAL", v: "฿ 4,200.00", bold: true, hl: "amount" },
  { kind: "kv", k: "Paid", v: "Credit Card" },
  { kind: "b" },
  { kind: "h", txt: "ขอบคุณค่ะ · Thank you" },
];

export function FauxReceipt({ width = 220, scale = 1, ocrHighlight = null }: Props) {
  return (
    <div
      className="relative font-mono text-[9.5px] leading-[1.55] text-[#3A3328]"
      style={{
        width,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        background: "#FBFAF6",
        border: "1px solid #E9E4D6",
        borderRadius: 6,
        padding: "16px 14px",
        boxShadow: "0 10px 24px rgba(10,37,64,.08), 0 1px 0 rgba(0,0,0,.04)",
      }}
    >
      <div
        className="absolute left-0 right-0 -top-1.5 h-1.5"
        style={{
          background:
            "radial-gradient(circle at 6px 6px, transparent 5px, #FBFAF6 5.5px) 0 0/12px 12px",
        }}
      />
      <div
        className="absolute left-0 right-0 -bottom-1.5 h-1.5"
        style={{
          background:
            "radial-gradient(circle at 6px 0px, transparent 5px, #FBFAF6 5.5px) 0 0/12px 12px",
        }}
      />
      {DEFAULT_LINES.map((l, i) => {
        if (l.kind === "b") {
          return (
            <div
              key={i}
              className="my-1.5"
              style={{ borderTop: "1px dashed #C9BFA6" }}
            />
          );
        }
        if (l.kind === "h") {
          return (
            <div key={i} className="text-center font-semibold tracking-wide">
              {l.txt}
            </div>
          );
        }
        const isHl = ocrHighlight !== null && l.hl === ocrHighlight;
        return (
          <div
            key={i}
            className="flex justify-between transition-[background,outline] duration-200"
            style={{
              background: isHl ? "rgba(217,119,6,0.22)" : "transparent",
              outline: isHl ? "1.5px solid #B7791F" : "none",
              borderRadius: 3,
              padding: isHl ? "1px 3px" : 0,
              margin: isHl ? "0 -3px" : 0,
              fontWeight: l.bold ? 700 : 400,
            }}
          >
            <span>{l.k}</span>
            <span>{l.v}</span>
          </div>
        );
      })}
    </div>
  );
}
