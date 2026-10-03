import React from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Format inline text: **bold**, `code`, *italic*
 */
function renderInlineText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const remaining = text;
  let keyIdx = 0;

  // Pattern matches **bold**, `code`, or *italic*
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = pattern.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(remaining.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={keyIdx++} className="font-bold text-stone-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={keyIdx++}
          className="px-1.5 py-0.5 rounded bg-stone-100 text-[#c2410c] font-mono text-[11px] border border-stone-200"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={keyIdx++} className="italic text-stone-700">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < remaining.length) {
    parts.push(remaining.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const rawLines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];

  let currentList: {
    type: 'ul' | 'ol';
    items: { text: string; indentLevel: number }[];
  } | null = null;

  const flushList = (key: number) => {
    if (!currentList) return null;
    const isUl = currentList.type === 'ul';
    const listElem = isUl ? (
      <ul key={`list-${key}`} className="my-1.5 space-y-1">
        {currentList.items.map((item, idx) => (
          <li
            key={idx}
            className={`flex items-start gap-1.5 leading-relaxed ${
              item.indentLevel > 0 ? 'pl-4 text-stone-600' : 'pl-0.5'
            }`}
          >
            <span
              className={`font-bold select-none leading-5 ${
                item.indentLevel > 0 ? 'text-stone-400 text-[10px]' : 'text-[#c2410c] text-xs'
              }`}
            >
              {item.indentLevel > 0 ? '–' : '•'}
            </span>
            <span className="flex-1">{renderInlineText(item.text)}</span>
          </li>
        ))}
      </ul>
    ) : (
      <ol key={`list-${key}`} className="my-1.5 space-y-1 pl-1 list-decimal list-inside">
        {currentList.items.map((item, idx) => (
          <li
            key={idx}
            className={`leading-relaxed ${item.indentLevel > 0 ? 'pl-4' : 'pl-0.5'}`}
          >
            <span>{renderInlineText(item.text)}</span>
          </li>
        ))}
      </ol>
    );
    currentList = null;
    return listElem;
  };

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    // 1. Dòng trống (xuống dòng giữa các đoạn / paragraph break)
    if (!trimmed) {
      if (currentList) {
        elements.push(flushList(i));
      }
      // Render khoảng trống xuống dòng rõ ràng
      elements.push(<div key={`empty-line-${i}`} className="h-2.5" aria-hidden="true" />);
      continue;
    }

    // Kiểm tra độ thụt dòng (để render sub-bullet)
    const leadingSpaces = rawLine.search(/\S|$/);
    const indentLevel = leadingSpaces >= 2 ? 1 : 0;

    // 2. Unordered list: •, -, *
    const bulletMatch = trimmed.match(/^([•\-\*])\s+(.+)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        if (currentList) elements.push(flushList(i));
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push({ text: bulletMatch[2], indentLevel });
      continue;
    }

    // 3. Numbered list: 1., 2.
    const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.+)$/);
    if (numMatch) {
      if (!currentList || currentList.type !== 'ol') {
        if (currentList) elements.push(flushList(i));
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push({ text: numMatch[2], indentLevel });
      continue;
    }

    // Gặp dòng văn bản thường -> flush list đang gom
    if (currentList) {
      elements.push(flushList(i));
    }

    // 4. Subheadings: ###, ##, #
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="font-bold text-stone-900 text-xs mt-2.5 mb-1">
          {renderInlineText(trimmed.replace(/^###\s+/, ''))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      elements.push(
        <h3 key={i} className="font-bold text-stone-900 text-sm mt-3 mb-1.5">
          {renderInlineText(trimmed.replace(/^#+\s+/, ''))}
        </h3>
      );
      continue;
    }

    // 5. Alert callout (💡 hoặc ⚠️)
    if (trimmed.startsWith('💡') || trimmed.startsWith('⚠️')) {
      elements.push(
        <div
          key={i}
          className="my-2 p-2.5 rounded-lg bg-orange-50/80 border border-orange-200 text-[11px] leading-relaxed text-stone-800 shadow-2xs"
        >
          {renderInlineText(trimmed)}
        </div>
      );
      continue;
    }

    // 6. Checkmark commitment line (✓)
    if (trimmed.startsWith('✓')) {
      elements.push(
        <div key={i} className="my-1 flex items-start gap-1.5 text-xs text-stone-800 leading-relaxed">
          <span className="text-emerald-600 font-bold select-none leading-5">✓</span>
          <span className="flex-1">{renderInlineText(trimmed.replace(/^✓\s*/, ''))}</span>
        </div>
      );
      continue;
    }

    // 7. Đoạn văn bản thường (hiển thị đầy đủ xuống dòng theo từng hàng)
    elements.push(
      <p key={i} className="leading-relaxed my-0.5 break-words">
        {renderInlineText(trimmed)}
      </p>
    );
  }

  // Flush list cuối nếu còn
  if (currentList) {
    elements.push(flushList(rawLines.length));
  }

  return (
    <div className={`markdown-body text-xs text-stone-800 leading-relaxed ${className}`}>
      {elements}
    </div>
  );
}
