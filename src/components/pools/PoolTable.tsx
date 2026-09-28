"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export interface Pool {
  id: string;
  pair: string;
  address: string;
  tvl: number;
  volume24h: number;
  apy: number;
  stablecoin: boolean;
}

const POOLS: Pool[] = [
  { id: "pool-1", pair: "USD / NGN", address: "GDUK4W7Q9XLM3N2A", tvl: 4250000, volume24h: 1850000, apy: 12.4, stablecoin: true },
  { id: "pool-2", pair: "XLM / KES", address: "GAK8P3M5V2R9T1XC", tvl: 1850000, volume24h: 920000, apy: 8.7, stablecoin: false },
  { id: "pool-3", pair: "NGN / GHS", address: "GBR6N4Q8W1Y5K2ZM", tvl: 920000, volume24h: 340000, apy: 5.2, stablecoin: true },
  { id: "pool-4", pair: "USD / BRL", address: "GCP2X7L9D4F8M1QA", tvl: 3100000, volume24h: 1420000, apy: 15.1, stablecoin: true },
  { id: "pool-5", pair: "EUR / XLM", address: "GFT5B8N2K6R3V9WD", tvl: 2750000, volume24h: 880000, apy: 9.3, stablecoin: false },
  { id: "pool-6", pair: "GBP / NGN", address: "GJM1Z4C7P9A2T6XE", tvl: 1650000, volume24h: 520000, apy: 7.8, stablecoin: true },
  { id: "pool-7", pair: "USD / GHS", address: "GNL9Q2W5E8R1Y4KA", tvl: 890000, volume24h: 210000, apy: 6.1, stablecoin: true },
  { id: "pool-8", pair: "XLM / NGN", address: "GPA3M6V9B2N5C8XD", tvl: 5400000, volume24h: 2300000, apy: 18.5, stablecoin: false },
  { id: "pool-9", pair: "KES / GHS", address: "GQB7D1F4J8L2Z5WM", tvl: 320000, volume24h: 95000, apy: 4.3, stablecoin: true },
  { id: "pool-10", pair: "USD / XLM", address: "GRK5P8A1C4E7M2VN", tvl: 7800000, volume24h: 3100000, apy: 22, stablecoin: false },
  { id: "pool-11", pair: "NGN / BRL", address: "GSA9X3L6D1F4K7PQ", tvl: 1100000, volume24h: 420000, apy: 10.2, stablecoin: true },
  { id: "pool-12", pair: "EUR / NGN", address: "GTB2W5Y8N1Q4C7ZM", tvl: 2200000, volume24h: 760000, apy: 11.6, stablecoin: true },
  { id: "pool-13", pair: "USD / KES", address: "GUC6M9P2A5D8F1XR", tvl: 1950000, volume24h: 680000, apy: 8.1, stablecoin: true },
  { id: "pool-14", pair: "GBP / XLM", address: "GVD4Q7W1E5R8T2YM", tvl: 670000, volume24h: 180000, apy: 3.9, stablecoin: false },
  { id: "pool-15", pair: "BRL / GHS", address: "GWE8N2C5K9P3A6ZD", tvl: 440000, volume24h: 120000, apy: 5.8, stablecoin: true },
];

type SortKey = "tvl" | "volume24h" | "apy";
const formatMoney = (value: number) => `$${value >= 1_000_000 ? `${(value / 1_000_000).toFixed(2)}M` : `${(value / 1_000).toFixed(1)}K`}`;

export default function PoolTable() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const currentQuery = params.toString();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [filter, setFilter] = useState(params.get("filter") ?? "all");
  const [sort, setSort] = useState<SortKey>((params.get("sort") as SortKey) || "tvl");
  const [pageSize, setPageSize] = useState(Number(params.get("size")) || 10);
  const [page, setPage] = useState(Number(params.get("page")) || 1);

  useEffect(() => {
    const next = new URLSearchParams(currentQuery);
    if (search) next.set("q", search);
    else next.delete("q");
    if (filter !== "all") next.set("filter", filter);
    else next.delete("filter");
    next.set("sort", sort);
    next.set("size", String(pageSize));
    if (page > 1) next.set("page", String(page));
    else next.delete("page");
    if (next.toString() !== currentQuery) router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [currentQuery, filter, page, pageSize, pathname, router, search, sort]);

  const pools = useMemo(() => POOLS.filter((pool) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${pool.pair} ${pool.address}`.toLowerCase().includes(query);
    const matchesFilter = filter === "all" || (filter === "stable" && pool.stablecoin) || (filter === "volatile" && !pool.stablecoin) || (filter === "yield" && pool.apy >= 12);
    return matchesSearch && matchesFilter;
  }).sort((a, b) => b[sort] - a[sort]), [filter, search, sort]);
  const pageCount = Math.max(1, Math.ceil(pools.length / pageSize));
  const visible = pools.slice((page - 1) * pageSize, page * pageSize);

  return <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-semibold text-white">Liquidity pools</h2><p className="text-sm text-slate-400">Search and compare pool performance</p></div>
      <div className="flex flex-wrap gap-2">
        <label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Token or contract address" aria-label="Search pools" className="w-56 rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white" /></label>
        <select aria-label="Filter pools" value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"><option value="all">All pools</option><option value="stable">Stablecoin pools</option><option value="volatile">Volatile pools</option><option value="yield">High yield (12%+)</option></select>
      </div>
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left">
      <thead><tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400"><th className="py-3">Pool / contract</th>{([ ["tvl", "TVL"], ["volume24h", "24h Volume"], ["apy", "APY"] ] as const).map(([key, label]) => <th key={key} className="py-3 text-right"><button type="button" onClick={() => { setSort(key); setPage(1); }} aria-label={`Sort by ${label}, high to low`} className={sort === key ? "text-lime-400" : "hover:text-white"}>{label}{sort === key ? " ↓" : ""}</button></th>)}</tr></thead>
      <tbody>{visible.map((pool) => <tr key={pool.id} className="border-b border-slate-800/70 text-sm"><td className="py-3"><span className="block font-semibold text-white">{pool.pair}</span><span className="font-mono text-xs text-slate-500">{pool.address}</span></td><td className="py-3 text-right font-mono text-slate-200">{formatMoney(pool.tvl)}</td><td className="py-3 text-right font-mono text-slate-200">{formatMoney(pool.volume24h)}</td><td className="py-3 text-right font-semibold text-lime-400">{pool.apy.toFixed(1)}%</td></tr>)}{visible.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-slate-400">No pools match these filters.</td></tr>}</tbody>
    </table></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400"><span>{pools.length} pools · Page {page} of {pageCount}</span><div className="flex items-center gap-2"><label htmlFor="pool-page-size">Rows</label><select id="pool-page-size" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-700 px-3 py-1 disabled:opacity-40">Previous</button><button type="button" disabled={page >= pageCount} onClick={() => setPage(page + 1)} className="rounded border border-slate-700 px-3 py-1 disabled:opacity-40">Next</button></div></div>
  </section>;
}
