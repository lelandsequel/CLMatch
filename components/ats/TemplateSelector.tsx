"use client";

export type ResumeTemplate = "clean-modern" | "executive" | "technical" | "creative";

interface TemplateSelectorProps {
  selected: ResumeTemplate;
  onSelect: (template: ResumeTemplate) => void;
}

const templates: {
  id: ResumeTemplate;
  name: string;
  description: string;
  colors: { primary: string; accent: string; bg: string };
  features: string[];
}[] = [
  {
    id: "clean-modern",
    name: "Clean Modern",
    description: "Minimalist design with lots of whitespace",
    colors: { primary: "#2563eb", accent: "#1e293b", bg: "#f8fafc" },
    features: ["ATS-optimized", "Clean sections", "Skill tags"],
  },
  {
    id: "executive",
    name: "Executive",
    description: "Traditional and formal for leadership roles",
    colors: { primary: "#1a1a1a", accent: "#4a4a4a", bg: "#fafafa" },
    features: ["Serif fonts", "Centered header", "Classic layout"],
  },
  {
    id: "technical",
    name: "Technical",
    description: "Optimized for developers and engineers",
    colors: { primary: "#10b981", accent: "#166534", bg: "#f0fdf4" },
    features: ["Skills first", "Monospace text", "Tech-focused"],
  },
  {
    id: "creative",
    name: "Creative",
    description: "For marketing, design, and creative roles",
    colors: { primary: "#8b5cf6", accent: "#7c3aed", bg: "#ede9fe" },
    features: ["Color accent", "Modern style", "Personality"],
  },
];

// Mini resume preview component
function TemplatePreview({ template }: { template: typeof templates[0] }) {
  const { colors } = template;
  
  return (
    <div 
      className="w-full aspect-[8.5/11] rounded-lg overflow-hidden border border-mist/30 dark:border-ink-soft/20 shadow-sm"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Mini resume visualization */}
      <div className="p-3 h-full flex flex-col">
        {/* Header */}
        <div 
          className="pb-2 mb-2 border-b-2"
          style={{ borderColor: colors.primary }}
        >
          <div 
            className="h-3 w-16 rounded-sm mb-1"
            style={{ backgroundColor: colors.accent }}
          />
          <div className="flex gap-1">
            <div className="h-1.5 w-8 rounded-sm bg-gray-300" />
            <div className="h-1.5 w-6 rounded-sm bg-gray-300" />
            <div className="h-1.5 w-10 rounded-sm bg-gray-300" />
          </div>
        </div>
        
        {/* Section */}
        <div className="mb-2">
          <div 
            className="h-2 w-12 rounded-sm mb-1"
            style={{ backgroundColor: colors.primary, opacity: 0.7 }}
          />
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-sm bg-gray-200" />
            <div className="h-1.5 w-11/12 rounded-sm bg-gray-200" />
            <div className="h-1.5 w-10/12 rounded-sm bg-gray-200" />
          </div>
        </div>
        
        {/* Experience */}
        <div className="mb-2">
          <div 
            className="h-2 w-14 rounded-sm mb-1"
            style={{ backgroundColor: colors.primary, opacity: 0.7 }}
          />
          <div className="flex justify-between mb-0.5">
            <div className="h-1.5 w-12 rounded-sm" style={{ backgroundColor: colors.accent }} />
            <div className="h-1.5 w-6 rounded-sm bg-gray-300" />
          </div>
          <div className="space-y-0.5 pl-1">
            <div className="h-1 w-full rounded-sm bg-gray-200" />
            <div className="h-1 w-11/12 rounded-sm bg-gray-200" />
            <div className="h-1 w-10/12 rounded-sm bg-gray-200" />
          </div>
        </div>
        
        {/* Skills */}
        <div className="mt-auto">
          <div 
            className="h-2 w-8 rounded-sm mb-1"
            style={{ backgroundColor: colors.primary, opacity: 0.7 }}
          />
          <div className="flex flex-wrap gap-0.5">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="h-1.5 rounded-full"
                style={{ 
                  width: `${Math.random() * 10 + 8}px`,
                  backgroundColor: colors.primary,
                  opacity: 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-ink-soft dark:text-parchment-dark uppercase tracking-wide">
            Choose Your Template
          </h3>
          <p className="text-xs text-ink-soft/70 dark:text-parchment-dark/70 mt-1">
            Select a format optimized for your industry — your PDF will be professionally formatted
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`group relative rounded-xl border text-left transition-all duration-200 overflow-hidden ${
              selected === template.id
                ? "border-gold ring-2 ring-gold/30 shadow-glow"
                : "border-mist/50 dark:border-ink-soft/30 hover:border-gold/50 hover:shadow-md"
            }`}
          >
            {/* Preview */}
            <div className="p-3 pb-2">
              <TemplatePreview template={template} />
            </div>
            
            {/* Info */}
            <div className="px-3 pb-3">
              <div className="font-medium text-sm mb-0.5 text-ink dark:text-cream">
                {template.name}
              </div>
              <div className="text-xs text-ink-soft/80 dark:text-parchment-dark/70 leading-snug mb-2">
                {template.description}
              </div>
              
              {/* Feature pills */}
              <div className="flex flex-wrap gap-1">
                {template.features.map((feature, i) => (
                  <span 
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-mist/50 dark:bg-ink-soft/20 text-ink-soft dark:text-parchment-dark"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Selected indicator */}
            {selected === template.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
