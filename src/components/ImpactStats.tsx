"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ImpactData {
  totalAnswers: number;
  questionsPerSheet: number;
  sheetsPerTree: number;
  treesSaved: number;
}

export default function ImpactStats() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/statistics/impact");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch impact stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  // Fallback if data fetch fails or is zero
  const totalAnswers = data?.totalAnswers || 0;
  const questionsPerSheet = data?.questionsPerSheet || 5;
  const sheetsPerTree = data?.sheetsPerTree || 8000;
  const treesSaved = data?.treesSaved || 0;

  return (
    <div className="flex flex-col xl:flex-row items-center gap-10 w-full">
      {/* Stats List Group */}
      <div className="flex flex-col space-y-6 w-full max-w-lg">
        
        {/* Item 1 */}
        <div className="flex justify-between items-end border-b border-gray-200 pb-2">
          <p className="text-[#014751] font-medium text-lg">Number of answers given:</p>
          <span className="text-[#014751] font-bold text-2xl">
            {totalAnswers.toLocaleString()}
          </span>
        </div>

        {/* Item 2 */}
        <div className="flex justify-between items-end border-b border-gray-200 pb-2">
          <p className="text-[#014751] font-medium text-lg">Avg. number of questions per sheet:</p>
          <span className="text-[#014751] font-bold text-2xl">
            {questionsPerSheet}
          </span>
        </div>

        {/* Item 3 */}
        <div className="flex justify-between items-end border-b border-gray-200 pb-2">
          <p className="text-[#014751] font-medium text-lg">Sheets from one tree:</p>
          <span className="text-[#014751] font-bold text-2xl">
            {sheetsPerTree.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Result Group - Styled exactly like reference: Equals sign, then Result Block */}
      <div className="flex items-center gap-6 mt-4 xl:mt-0">
        <span className="text-[#014751] text-5xl font-light hidden md:block">=</span>
        
        <div className="text-center md:text-left">
          <p className="text-[#014751] font-bold text-lg mb-1">Trees saved</p>
          <span className="text-[#014751] font-extrabold text-6xl leading-none">
             {treesSaved.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
}
