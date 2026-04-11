import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const mdBase =
  'text-[13px] leading-relaxed text-slate-200 [&_a]:text-blue-400 [&_a]:underline [&_strong]:text-white [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_p]:my-2 [&_p:first-child]:mt-0 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-white [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-slate-100 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-white/10 [&_th]:bg-white/[0.06] [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-xs [&_td]:border [&_td]:border-white/10 [&_td]:px-2 [&_td]:py-1.5 [&_td]:text-xs [&_code]:rounded [&_code]:bg-black/40 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:text-violet-200 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-black/50 [&_pre]:p-4 [&_pre]:text-[12px] [&_blockquote]:border-l-2 [&_blockquote]:border-blue-500/50 [&_blockquote]:pl-3 [&_blockquote]:text-slate-400';

export function MarkdownMessage({ content }) {
  return (
    <div className={mdBase}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
