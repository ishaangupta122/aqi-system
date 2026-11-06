import Tag from "./Tag";

// A card with a name, an optional tag and a one-line description
export default function InfoCard({ name, tag, text, title }) {
  return (
    <div className="bg-secondary/50 rounded-md p-4 space-y-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h4 className="font-semibold text-foreground">{name}</h4>
        {tag && <Tag>{tag}</Tag>}
      </div>
      <p className="text-sm text-muted-foreground" title={title}>
        {text}
      </p>
    </div>
  );
}
