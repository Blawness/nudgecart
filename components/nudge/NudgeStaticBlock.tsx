interface NudgeStaticBlockProps {
  headline: string;
  body: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export function NudgeStaticBlock({
  headline,
  body,
  ctaText,
  onCtaClick,
}: NudgeStaticBlockProps) {
  return (
    <div className="bg-green-50 rounded-lg border border-green-200 p-4 my-4">
      <div className="flex items-start gap-3">
        <span className="text-lg shrink-0 mt-0.5">🌿</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{headline}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{body}</p>
          {ctaText && onCtaClick && (
            <button
              onClick={onCtaClick}
              className="text-xs font-medium text-primary hover:underline mt-1 inline-block"
            >
              {ctaText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
