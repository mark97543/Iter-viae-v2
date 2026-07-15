// src/components/search/SearchBar.tsx

import { useLayout } from "../../context/LayoutContext";

const SearchBar = () => {
    const { isLeftBarOpen } = useLayout();

    return (
        <div className={`
                absolute top-4 z-50 
                transition-all duration-500 ease-in-out
                ${isLeftBarOpen ? 'left-[352px]' : 'left-[88px]'}
            `}>
            <input
                type="text"
                placeholder="Search"
                className="
                    px-4 py-2 rounded-lg
                    bg-neutral-900/80 backdrop-blur-md
                    text-white border border-white/20
                    shadow-lg outline-none w-100
                    focus:ring-2 focus:ring-violet-500
                    placeholder:text-neutral-400
                "
            />
        </div>
    )
}

export default SearchBar;