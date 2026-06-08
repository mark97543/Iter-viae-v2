import { useEffect, useState } from 'react';
import { createDirectus, rest, readSingleton } from '@directus/sdk';
import { useNavigate } from 'react-router-dom';

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
  Welcome_Screen: HomepageSettings; 
};

// 3. Initialize Directus Core Client
export const directus = createDirectus<Schema>('https://api.wade-usa.com').with(rest());

function Welcome() {
  const [content, setContent] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    async function streamWelcomeManifest() {
      try {
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
      <div className="bg-sec lg:w-[50%] md:w-[75%] w-[90%] p-3 rounded-xl h-[90%] flex items-center justify-center border border-zinc-800 shadow-2xl">
        <div className="animate-pulse font-mono text-sm tracking-widest text-red-500 uppercase font-bold">
          LOADING COCKPIT RUNTIME VARIABLES...
        </div>
      </div>
    );
  }

  return (

    <div className="bg-sec lg:w-[50%] md:w-[75%] w-[90%] p-6 rounded-xl h-fit flex flex-col gap-6 border border-zinc-800 shadow-2xl">
      
      {/* Header Image */}
      <img src="/Banner.svg" alt="Logo" className="w-full h-auto mx-auto" />
      
      {/* Text Wrapper Section */}
      <div className="flex-1">
     
        {content?.wright_up ? (
          <div 
            className="prose prose-invert max-w-none text-zinc-400 text-base leading-relaxed prose-strong:text-white prose-headings:text-[#F8F9FF] prose-headings:uppercase prose-p:mb-4"
            dangerouslySetInnerHTML={{ __html: content.wright_up }}
          />
        ) : (
          <p className="text-zinc-400 text-sm italic">No welcome text configured.</p>
        )}
      </div>

      {/* Button to Link to Blog */}
      <div className='pt-4 mt-4 pb-4 border-b border-neutral-800 flex justify-center'>
        <button 
          className='w-full sm:w-auto cursor-pointer bg-red-700 hover:bg-red-600 text-white font-mono uppercase tracking-widest font-bold py-2.5 px-6 rounded text-xs border border-red-800 shadow-md hover:shadow-red-900/30 transform transition-transform duration-100 active:scale-95'
          onClick={() => navigate('/blog')}
          >Visit the Blog
        </button>
      </div>

      {/* Dynamic Date Updated Footer Timestamp Stamp */}
      {content?.date_updated && (
        <div className="text-center text-[10px] font-mono tracking-widest text-zinc-600 uppercase  border-zinc-800/50 mt-auto">
          Sync Footprint: {new Date(content.date_updated).toLocaleDateString()}
        </div>
      )}


    </div>
  );
}

export default Welcome;