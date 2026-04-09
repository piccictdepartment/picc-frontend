'use client';

import { useState, useEffect } from 'react';
import { getVersions, getBooks, getPassage } from '@/app/actions/bible';
import '@youversion/platform-core/browser/styles/index.css';

export default function BibleTool() {
  const [versions, setVersions] = useState<{ id: number; title: string }[]>([]);
  const [books, setBooks] = useState<{ id: string; name: string; chapters: string[] }[]>([]);
  
  const [selectedVersion, setSelectedVersion] = useState<number>(0);
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  
  const [passage, setPassage] = useState<{ title: string; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getVersions().then((data) => {
       const englishVersions = data.filter((v) => v.id === 1 || v.id === 12 || v.id === 111 || v.id === 114); // Try to select known English like KJV, ASV, NIV, NKJV if they exist, or just use any
       const finalVersions = englishVersions.length > 0 ? englishVersions : data;
       setVersions(finalVersions);
       if (finalVersions.length > 0) setSelectedVersion(finalVersions[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedVersion) return;
    setBooks([]);
    getBooks(selectedVersion).then((data) => {
       setBooks(data);
       if (data.length > 0) {
         setSelectedBook(data[0].id);
         setSelectedChapter(data[0].chapters[0] || '1');
       }
    });
  }, [selectedVersion]);

  useEffect(() => {
    if (!selectedVersion || !selectedBook || !selectedChapter) return;
    let isMounted = true;
    setIsLoading(true);
    getPassage(selectedVersion, `${selectedBook}.${selectedChapter}`).then((data) => {
      if (isMounted) {
        setPassage(data);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [selectedVersion, selectedBook, selectedChapter]);

  const activeBook = books.find(b => b.id === selectedBook);

  return (
    <div className="flex flex-col h-[500px]" data-yv-theme="dark">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-4 border-b border-white/10 bg-white/5 shrink-0 rounded-t-xl">
        <select
          value={selectedVersion}
          onChange={(e) => setSelectedVersion(Number(e.target.value))}
          className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60 max-w-[150px] truncate"
          disabled={versions.length === 0}
        >
          {versions.map((v) => (
            <option key={v.id} value={v.id}>{v.title}</option>
          ))}
        </select>
        
        <select
          value={selectedBook}
          onChange={(e) => {
            setSelectedBook(e.target.value);
            const b = books.find(book => book.id === e.target.value);
            setSelectedChapter(b?.chapters[0] || '1');
          }}
          className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60 max-w-[150px]"
          disabled={books.length === 0}
        >
          {books.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
          className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60"
          disabled={!activeBook || activeBook.chapters.length === 0}
        >
          {activeBook?.chapters.map((ch) => (
            <option key={ch} value={ch}>Chapter {ch}</option>
          ))}
        </select>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-black text-white relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <div className="animate-pulse text-sm text-white/70">Loading passage...</div>
          </div>
        )}
        
        {passage ? (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-center text-white/90 font-serif">
              {passage.title}
            </h2>
            <div 
              data-slot="yv-bible-renderer"
              className="mx-auto"
              dangerouslySetInnerHTML={{ __html: passage.content }} 
            />
          </div>
        ) : (
           <div className="text-center text-white/50 pt-10">
             {!isLoading && "Select a passage to read."}
           </div>
        )}
      </div>
    </div>
  );
}
