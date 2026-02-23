"use client";

import { useState, useRef, useEffect } from "react";
import { SOURCE_MAP, AVAILABLE_SOURCES } from "@/lib/constants";

type SourceDropdownProps = {
  selectedCollections: string[];
  onChange: (collections: string[]) => void;
};

export default function SourceDropdown({
  selectedCollections,
  onChange,
}: SourceDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleCollection = (displayName: string) => {
    const collectionKey = SOURCE_MAP[displayName];
    if (selectedCollections.includes(collectionKey)) {
      onChange(selectedCollections.filter((s) => s !== collectionKey));
    } else {
      onChange([...selectedCollections, collectionKey]);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn-ghost flex items-center gap-2"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ width: "0.85rem", height: "0.85rem" }}
        >
          <path
            d="M3 6h18M6 12h12m-9 6h6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Sources ({selectedCollections.length})
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10 dark:bg-[#1a1a1a] dark:ring-white/10">
          <div className="p-2" role="menu" aria-orientation="vertical">
            {AVAILABLE_SOURCES.map((displayName) => {
              const isSelected = selectedCollections.includes(SOURCE_MAP[displayName]);
              return (
                <label
                  key={displayName}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md cursor-pointer transition-colors"
                  role="menuitem"
                >
                  <div className="relative flex items-center justify-center w-4 h-4">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-4 h-4 border border-gray-300 rounded-sm checked:bg-black checked:border-black dark:border-gray-600 dark:checked:bg-white dark:checked:border-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors cursor-pointer"
                      checked={isSelected}
                      onChange={() => toggleCollection(displayName)}
                    />
                    {isSelected && (
                      <svg
                        className="absolute w-3 h-3 text-white dark:text-black pointer-events-none"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <span className="select-none">{displayName}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
