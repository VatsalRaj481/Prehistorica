import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles, Scale, Info } from 'lucide-react';

interface RajyResponseRendererProps {
  content: string;
  onLinkClick?: () => void;
  isLatestAssistantMessage?: boolean;
  isFirstAssistantResponse?: boolean;
}

interface BlockItem {
  type: 'heading1' | 'heading2' | 'heading3' | 'blockquote' | 'controversy' | 'ul' | 'ol' | 'paragraph';
  content: string;
  items?: string[];
  level?: number;
}

/**
 * Parses and safely renders Rajy's AI Docent responses with:
 * - Proper markdown typography (bold, italics, headings, lists, blockquotes)
 * - Latin / Scientific name formatting (in italic serif styling)
 * - Safe internal specimen badges (/species/:id)
 * - Safe external links with target="_blank" rel="noopener noreferrer"
 * - Scientific controversy & hypothesis callout cards
 * - Zero unsafe HTML injection (100% native React virtual DOM nodes)
 */
export default function RajyResponseRenderer({
  content,
  onLinkClick,
  isFirstAssistantResponse = false
}: RajyResponseRendererProps) {
  // 1. Clean repetitive self-introductions or mismatched curator titles from follow-up turns
  const cleanedContent = cleanRepetitiveIntroductions(content, isFirstAssistantResponse);

  // 2. Parse text into structured block-level elements
  const blocks = parseBlocks(cleanedContent);

  return (
    <div className="space-y-3 text-xs sm:text-[13px] md:text-sm leading-relaxed text-slate-200 font-sans break-words [overflow-wrap:anywhere]">
      {blocks.map((block, idx) => renderBlock(block, idx, onLinkClick))}
    </div>
  );
}

/**
 * Trims redundant introductory prefixes like "Hello! I am Rajy..." or
 * "Welcome to Prehistorica. I am The Chief Curator..." from follow-up turns
 * while preserving the canonical greeting on the very first assistant response.
 */
function cleanRepetitiveIntroductions(raw: string, isFirstAssistantResponse = false): string {
  if (!raw) return '';
  const trimmed = raw.trim();

  // If this is the initial assistant response, preserve the canonical welcome
  if (isFirstAssistantResponse) {
    return trimmed;
  }

  return trimmed
    .replace(
      /^Welcome\s+to\s+Prehistorica[.!:]?\s*(?:(?:I\s+am|I'm)\s+(?:Rajy\s*[-—–]\s*)?(?:the\s+)?Chief\s+Curator,?\s*)?(?:(?:and\s+)?I\s+am\s+delighted\s+to\s+guide\s+you[^.\n]*[.!:]\s*)?/i,
      ''
    )
    .replace(
      /^(?:Greetings|Hello|Hi),?\s*(?:visitor|explorer|guest)?[.!]?\s*(?:As\s+(?:Chief\s+Curator|Museum\s+Curator|the\s+Curator|AI\s+Docent)\s+of\s+Prehistorica,?\s*)?(?:I\s+am\s+(?:delighted|pleased|excited|happy)\s+to\s+(?:guide|welcome|share|discuss)[^.\n]*[.!:]\s*)?/i,
      ''
    )
    .replace(
      /^Welcome,?\s+(?:visitor|explorer|guest)[.!]?\s*(?:As\s+(?:Chief\s+Curator|Museum\s+Curator|the\s+Curator|AI\s+Docent)\s+of\s+Prehistorica,?\s*)?(?:I\s+am\s+(?:delighted|pleased|excited|happy)\s+to\s+(?:guide|welcome|share|discuss)[^.\n]*[.!:]\s*)?/i,
      ''
    )
    .replace(
      /^(?:(?:Hello|Hi|Greetings)[!.,]?\s+)?(?:I am|I'm)\s+Rajy,?\s+(?:your\s+)?(?:Prehistorica\s+)?(?:AI\s+)?Docent[!.,]?\s*/i,
      ''
    )
    .trim();
}

/**
 * Parses raw markdown text into structured semantic blocks.
 */
function parseBlocks(text: string): BlockItem[] {
  const blocks: BlockItem[] = [];
  const lines = text.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Heading 3 or 4: ### Heading
    if (trimmed.startsWith('#### ') || trimmed.startsWith('### ')) {
      const headingText = trimmed.replace(/^#{3,4}\s+/, '');
      const isControversy = isScientificControversyHeading(headingText);
      blocks.push({
        type: isControversy ? 'controversy' : 'heading3',
        content: headingText
      });
      i++;
      continue;
    }

    // Heading 2: ## Heading
    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s+/, '');
      blocks.push({
        type: 'heading2',
        content: headingText
      });
      i++;
      continue;
    }

    // Heading 1: # Heading
    if (trimmed.startsWith('# ')) {
      const headingText = trimmed.replace(/^#\s+/, '');
      blocks.push({
        type: 'heading1',
        content: headingText
      });
      i++;
      continue;
    }

    // Blockquote: > text
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'blockquote',
        content: quoteLines.join(' ')
      });
      continue;
    }

    // Unordered list item: - or * (with space after)
    if (/^[-*]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'ul',
        content: '',
        items: listItems
      });
      continue;
    }

    // Ordered list item: 1. or 2.
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'ol',
        content: '',
        items: listItems
      });
      continue;
    }

    // Regular paragraph: collect consecutive non-empty lines that aren't special blocks
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        content: paraLines.join(' ')
      });
    }
  }

  return blocks;
}

/**
 * Detects whether a heading or section is discussing ongoing scientific controversy or competing hypotheses.
 */
function isScientificControversyHeading(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('controversy') ||
    lower.includes('debate') ||
    lower.includes('hypothesis') ||
    lower.includes('competing') ||
    lower.includes('uncertainty') ||
    lower.includes('alternative interpretation')
  );
}

/**
 * Renders a parsed block into React elements.
 */
function renderBlock(block: BlockItem, index: number, onLinkClick?: () => void): React.ReactNode {
  switch (block.type) {
    case 'heading1':
      return (
        <h2
          key={index}
          className="text-sm sm:text-base font-black font-mono tracking-wider uppercase text-amber-200 mt-4 mb-2 pb-1.5 border-b border-amber-500/30 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{renderInline(block.content, onLinkClick)}</span>
        </h2>
      );

    case 'heading2':
      return (
        <h3
          key={index}
          className="text-xs sm:text-sm font-black font-mono tracking-wider uppercase text-amber-300 mt-3.5 mb-1.5 pb-1 border-b border-amber-500/25 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{renderInline(block.content, onLinkClick)}</span>
        </h3>
      );

    case 'heading3':
      return (
        <h4
          key={index}
          className="text-[11px] sm:text-xs font-bold font-mono tracking-wider uppercase text-amber-300/90 mt-3 mb-1 flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <span>{renderInline(block.content, onLinkClick)}</span>
        </h4>
      );

    case 'controversy':
      return (
        <div
          key={index}
          className="mt-3.5 mb-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-amber-200"
        >
          <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] sm:text-xs font-mono">
            <span className="font-bold uppercase tracking-wider text-amber-400">Scientific Debate &bull; </span>
            <span className="text-amber-200 font-semibold">{renderInline(block.content, onLinkClick)}</span>
          </div>
        </div>
      );

    case 'blockquote':
      return (
        <blockquote
          key={index}
          className="my-3 p-3 rounded-xl bg-amber-500/[0.06] border-l-2 border-amber-400/80 text-slate-200 text-xs sm:text-[13px] leading-relaxed shadow-inner"
        >
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">{renderInline(block.content, onLinkClick)}</div>
          </div>
        </blockquote>
      );

    case 'ul':
      return (
        <ul key={index} className="my-2.5 space-y-2 pl-0.5">
          {block.items?.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-200 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">{renderInline(item, onLinkClick)}</div>
            </li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol key={index} className="my-2.5 space-y-2 pl-0.5">
          {block.items?.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-200 leading-relaxed">
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 mt-0.5 shrink-0">
                {itemIdx + 1}
              </span>
              <div className="flex-1 min-w-0">{renderInline(item, onLinkClick)}</div>
            </li>
          ))}
        </ol>
      );

    case 'paragraph':
    default:
      return (
        <p key={index} className="mb-2.5 last:mb-0 leading-relaxed text-slate-200">
          {renderInline(block.content, onLinkClick)}
        </p>
      );
  }
}

/**
 * Safely parses inline markdown elements:
 * - Italicized links: *[Name](/species/123)*
 * - Bold & italic: ***text***
 * - Internal specimen links: [Name](/species/123)
 * - External links: [Label](https://...)
 * - Bold text: **text**
 * - Italic text / scientific species names: *text* or _text_
 * - Monospace terms / code: `term`
 */
function renderInline(text: string, onLinkClick?: () => void): React.ReactNode {
  if (!text) return null;

  // Regex pattern matching:
  // 1. Italicized links: \*\[[^\]]+\]\([^\)]+\)\*
  // 2. Bold+Italics: \*\*\*[^*]+\*\*\*
  // 3. Markdown links: \[[^\]]+\]\([^\)]+\)
  // 4. Bold text: \*\*[^*]+\*\*
  // 5. Italic text: \*[^*]+\* or _[^_]+_
  // 6. Inline code: `[^`]+`
  const tokenRegex = /(\*\[[^\]]+\]\([^\)]+\)\*|\*\*\*[^*]+\*\*\*|\[[^\]]+\]\([^\)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;

    // 1. Italicized Link token: *[text](url)*
    if (part.startsWith('*[') && part.includes('](') && part.endsWith(')*')) {
      const innerLink = part.slice(1, -1);
      const match = innerLink.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
      if (match) {
        return renderLink(match[1], match[2], i, onLinkClick, true);
      }
    }

    // 2. Bold + Italic: ***text***
    if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
      const inner = part.slice(3, -3);
      return (
        <strong key={i} className="font-semibold text-amber-200">
          <em className="italic font-serif">{inner}</em>
        </strong>
      );
    }

    // 3. Link token: [text](url)
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
      if (match) {
        return renderLink(match[1], match[2], i, onLinkClick, false);
      }
    }

    // 4. Bold token: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={i} className="font-semibold text-amber-200/95">
          {renderInline(inner, onLinkClick)}
        </strong>
      );
    }

    // 5. Italic token / Scientific species name: *text* or _text_
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
      (part.startsWith('_') && part.endsWith('_') && part.length >= 2)
    ) {
      const inner = part.slice(1, -1);
      return (
        <em key={i} className="italic font-serif text-slate-100 font-medium tracking-wide">
          {renderInline(inner, onLinkClick)}
        </em>
      );
    }

    // 6. Inline code token: `text`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-amber-300 font-mono text-[11px]"
        >
          {inner}
        </code>
      );
    }

    // Plain text
    return <span key={i}>{part}</span>;
  });
}

/**
 * Helper to render specimen or external links with proper safe attributes and styling.
 */
function renderLink(
  linkText: string,
  linkUrl: string,
  key: number,
  onLinkClick?: () => void,
  isItalic?: boolean
): React.ReactNode {
  // Internal specimen link: /species/:id
  if (linkUrl.startsWith('/species/')) {
    return (
      <Link
        key={key}
        to={linkUrl}
        onClick={onLinkClick}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/35 hover:border-amber-400 text-xs font-mono font-bold transition-all shadow-xs group ${
          isItalic ? 'italic' : ''
        }`}
        title={`View catalog archive for ${linkText}`}
      >
        <span>{linkText}</span>
        <ExternalLink className="w-2.5 h-2.5 opacity-80 group-hover:scale-110 transition-transform" />
      </Link>
    );
  }

  // External link
  const isExternal = linkUrl.startsWith('http://') || linkUrl.startsWith('https://');
  return (
    <a
      key={key}
      href={linkUrl}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 underline underline-offset-2 transition-colors font-medium ${
        isItalic ? 'italic font-serif' : ''
      }`}
    >
      <span>{linkText}</span>
      {isExternal && <ExternalLink className="w-2.5 h-2.5 inline opacity-80" />}
    </a>
  );
}
