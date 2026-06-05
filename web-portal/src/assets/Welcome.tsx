import { useEffect, useState } from 'react';
import { createDirectus, rest, readSingleton } from '@directus/sdk';

// 1. Structural Data Contract
export type HomepageSettings = {
  title: string;
  sub_title: string;
  version: string;
  wright_up: string;
  date_updated: string;
};

// 2. Updated Schema Matrix targeting your true collection ID
type Schema = {
  Welcome_Screen: HomepageSettings; // Must match the Directus Collection ID exactly
};

// 3. Initialize Directus Core Client
export const directus = createDirectus<Schema>('https://api.wade-usa.com').with(rest());

function Welcome() {
  const [content, setContent] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function streamWelcomeManifest() {
      try {
        // Swapped target parameter to look for Welcome_Screen
        const data = await directus.request(readSingleton('Welcome_Screen'));
        setContent(data);
      } catch (error: any) {
        console.error("Network bridge pipeline failure details:", error);
      } finally {
        setLoading(false);
      }
    }

    streamWelcomeManifest();
  }, []);

  if (loading) {
    return (
      <div className="bg-sec w-[50%] p-3 rounded-xl h-[90%] flex items-center justify-center border border-zinc-800 shadow-2xl">
        <div className="animate-pulse font-mono text-sm tracking-widest text-red-500 uppercase font-bold">
          LOADING COCKPIT RUNTIME VARIABLES...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sec w-[50%] p-5 rounded-xl h-fit flex flex-col justify-between overflow-y-auto border border-zinc-800 shadow-2xl">
      <img src="/Banner.svg" alt="Logo" className="w-full h-auto mx-auto" />
      <div className="space-y-4">



        {/* Dynamic WYSIWYG Write-up Text Field (Fenced safely via prose-invert for Tailwind) */}
        {content?.wright_up ? (
          <div 
            className="whitespace-pre-line prose prose-invert max-w-none text-center text-zinc-400 text-sm mt-5 leading-relaxed prose-strong:text-white prose-headings:text-[#F8F9FF] prose-headings:uppercase"
            dangerouslySetInnerHTML={{ __html: content.wright_up }}
          />
        ) : (
          <p className="text-center text-md text-zinc-400 mt-5 leading-relaxed">
            
          </p>
        )}
      </div>

      {/* Dynamic Date Updated Footer Timestamp Stamp */}
      {content?.date_updated && (
        <div className="text-center text-[10px] font-mono tracking-widest text-zinc-600 uppercase pt-4 border-t border-zinc-800/50">
          Sync Footprint: {new Date(content.date_updated).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export default Welcome;