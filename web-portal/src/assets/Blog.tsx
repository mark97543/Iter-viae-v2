import {useEffect, useState} from 'react';
import BlogModal from './BlogModal.tsx';


function Blog() {


    const [blogPosts, setBlogPosts]=useState([]);
    const [loading, setLoading]=useState(true);
    const [milestones, setMilestones]=useState([]);
    const [selectedPost, setSelectedPost]=useState(null);

    const closeModal = () => {
        setSelectedPost(null);
    }


    useEffect(()=>{
        const syncBlog = async () => {
            try{
                const response = await fetch('https://api.wade-usa.com/items/blog?filter[status][_eq]=published&sort=-id');
                if(!response.ok) throw new Error('Network response was not ok');
                const payload = await response.json();
                // console.log("Sync results:", payload)
                setBlogPosts(payload.data);    
                setLoading(false);             
            }catch(error){
                console.error("Pipeline mapping error:", error)
            }
        }

        const syncMilestones = async () => {
            try{
                const response=await fetch('https://api.wade-usa.com/items/milestones?sort=phase');
                if(!response.ok) throw new Error('Network response was not ok');
                const payload=await response.json();
                console.log('sync results:', payload)
                setMilestones(payload.data);
                setLoading(false)
            }catch(error){
                console.error("Pipeline mapping error:", error)
            }
        }
        
        syncBlog();
        syncMilestones();
    },[])

    if (loading) {
        return (
        <div className="bg-sec lg:w-[50%] md:w-[75%] w-[90%] p-3 rounded-xl h-[90%] flex items-center justify-center border border-zinc-800 shadow-2xl">
            <div className="animate-pulse font-mono text-sm tracking-widest text-red-500 uppercase font-bold">
            LOADING BLOG.
            </div>
        </div>
        );
    }
    console.log(blogPosts);

  return (
    <div className="min-h-[calc(100vh-50px)] bg-neutral-950 text-neutral-100 font-sans p-6">
      {/* Global Header */}
      <header className="border-b border-neutral-800 pb-4 mb-8 flex justify-between items-center">
        <div className="text-xl font-bold tracking-wider text-red-600 font-mono">[&gt;] ITER VIAE // BLOG</div>
        <nav className="space-x-4 text-sm font-mono text-neutral-400">
          {/* <span className="hover:text-neutral-100 cursor-pointer">HOME</span> */}
        </nav>
      </header>

      {/* Responsive Layout Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* Left Side: Stacking Log Cards (Takes 2 columns on desktop) */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-sm font-mono tracking-widest text-neutral-500 uppercase">// CHOP FEED LOGS</h2>
          
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-sm shadow-md cursor-pointer hover:scale-[1.02] transition-transform duration-100" onClick={()=>{setSelectedPost(post);}}>
              <span className="text-xs font-mono text-red-500 uppercase tracking-wider">{post.category}</span>
              <h3 className="text-xl font-bold mt-1 text-neutral-100">{post.title}</h3>
              <p className="text-xs font-mono text-neutral-500 mt-1">Logged: {new Date(post.date_created).toLocaleDateString()}</p>
              <p className="text-sm text-neutral-400 mt-4 leading-relaxed whitespace-pre-line">{post.short_summary}</p>
            </div>
          ))}
        </div>
        {/*TODO: Need to make these pull up a modal when clicked on for the full blog post.  */}

        {/* Right Side: High-Level Roadmap Timeline (Takes 1 column) */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-sm h-fit">
          <h2 className="text-sm font-mono tracking-widest text-neutral-500 uppercase mb-6">// PROJECT ROADMAP</h2>
          
          <div className="relative pl-4 ml-2">
            
            {milestones.map((milestone) => (
                /* Child container elements touch seamlessly to build a solid line */
                <div key={milestone.id} className="relative pl-6 pb-8 border-l border-neutral-800 last:border-l-0">
                    
                    {/* incomplete Dot: 12px wide -> needs -left-[6px] to center */}
                    {milestone.status === 'incomplete' && (
                        <div className="absolute -left-[6px] top-1.5 bg-neutral-900 border-2 border-neutral-700 w-3 h-3 rounded-full" />
                    )}
                    
                    {/* Active Dot: 12px wide -> needs -left-[6px] to center */}
                    {milestone.status === 'active' && (
                        <div className="absolute -left-[6px] top-1.5 bg-red-600 border-2 border-red-600 w-3 h-3 rounded-full animate-pulse" />
                    )}
                    
                    {/* Complete Check: 20px wide -> needs -left-[10px] to center perfectly */}
                    {milestone.status === 'complete' && (
                        <div className="absolute -left-[10px] top-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 text-xs font-bold font-mono">
                            ✓
                        </div>
                    )}

                    {/* Text Container Flow */}
                    <div className="flex flex-col ml-2">
                        <h4 className="text-sm font-bold font-mono tracking-wide text-neutral-300 uppercase">
                            Phase {milestone.phase}: {milestone.name}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                            {milestone.description}
                        </p>
                    </div>
                    
                </div>
            ))}

          </div>
        </div>

      </div>

      <BlogModal 
        onClose={closeModal} 
        activePost={selectedPost}
      />
    </div>
  );
}

export default Blog;
