import Tag from "./Tag";

// One step of the timeline: a number, an icon, a title with a tag and its content
export default function Step({ number, icon, title, tag, subtitle, last, children }) {
  const Icon = icon;
  return (
    <div className="flex gap-6">
      <div className="hidden md:flex flex-col items-center">
        <div className="w-10 h-10 shrink-0 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center">
          {number}
        </div>
        {!last && <div className="flex-1 w-px bg-border mt-2" />}
      </div>
      <div
        className={`flex-1 min-w-0 border border-border rounded-lg p-4 md:p-6 space-y-3 ${last ? "" : "mb-4"}`}>
        <div className="flex items-center gap-3 pb-2">
          <span className="md:hidden w-8 h-8 shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
            {number}
          </span>
          <div className="hidden sm:block p-2.5 rounded-lg bg-primary/15 text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              {tag && <Tag>{tag}</Tag>}
            </div>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
