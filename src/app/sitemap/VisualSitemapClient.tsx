"use client";

import React from "react";
import Link from "next/link";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  Handle,
  NodeProps,
  Edge,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { ExternalLink, Globe } from "lucide-react";

export interface SitemapNodeData extends Record<string, unknown> {
  header: string;
  title: string;
  path?: string;
  description?: string;
}

// --- SLEEK DARK MODE SITEMAP CARD NODE ---
function SitemapCardNode({ data }: NodeProps<Node<SitemapNodeData>>) {
  return (
    <div className="w-64 rounded-xl border border-white/15 bg-[#0f0f17] shadow-2xl overflow-hidden select-none hover:border-purple-400/60 transition-all duration-200 backdrop-blur-xl">
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-purple-400 !border-0" />
      
      {/* Top Header Bar */}
      <div className="bg-[#181824] border-b border-white/10 py-1.5 px-3 text-center">
        <span className="font-extrabold text-xs text-purple-300 tracking-wider uppercase block truncate">
          {data.header}
        </span>
      </div>

      {/* Body Content */}
      <div className="p-3 text-left space-y-1">
        {data.path ? (
          <Link href={data.path} className="font-bold text-xs text-cyan-300 hover:text-white hover:underline block leading-snug">
            {data.title}
          </Link>
        ) : (
          <span className="font-bold text-xs text-cyan-300 block leading-snug">
            {data.title}
          </span>
        )}

        {data.description && (
          <p className="text-white/60 text-[11px] leading-snug mt-1">
            {data.description}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-cyan-400 !border-0" />
    </div>
  );
}

const nodeTypes = {
  sitemapCard: SitemapCardNode,
};

// --- IMMACULATE ZERO-OVERLAP GRID (380px Column Pitch, 240px Row Pitch) ---
const INITIAL_NODES: Node<SitemapNodeData>[] = [
  // ROOT HOME (Center Top at x = 1520, y = 30)
  {
    id: "root",
    type: "sitemapCard",
    position: { x: 1520, y: 30 },
    data: {
      header: "Home Page",
      title: "7th Heaven — Official Band Website",
      path: "/",
      description:
        "7th Heaven is a chart-topping rock experience from Chicago with #1 Billboard hits and 40 years of unforgettable live performances.",
    },
  },

  // FIRST ROW CHILDREN (y = 260, 380px horizontal pitch)
  {
    id: "node-sitemap",
    type: "sitemapCard",
    position: { x: 0, y: 260 },
    data: {
      header: "Sitemap",
      title: "7th Heaven — Platform Sitemap",
      path: "/sitemap",
      description: "Complete platform sitemap, page directory, and visual site architecture.",
    },
  },
  {
    id: "node-privacy",
    type: "sitemapCard",
    position: { x: 380, y: 260 },
    data: {
      header: "Privacy",
      title: "Privacy Policy — 7th Heaven",
      path: "/privacy",
      description:
        "How 7th Heaven collects, uses, and protects your personal information.",
    },
  },
  {
    id: "node-merch",
    type: "sitemapCard",
    position: { x: 760, y: 260 },
    data: {
      header: "Merch",
      title: "Merch — 7th Heaven Official Store",
      path: "/merch",
      description:
        "Shop official 7th Heaven band merchandise — tees, hoodies, vinyl, and more. Ships worldwide.",
    },
  },
  {
    id: "node-crew",
    type: "sitemapCard",
    position: { x: 1140, y: 260 },
    data: {
      header: "Crew",
      title: "7th Heaven — Official Website",
      path: "/crew",
      description:
        "7th Heaven is an experience you just have to see and hear! Charted #1 on the Midwest Billboard Charts three times with 7 major radio hits. 40 years of rocking the world.",
    },
  },
  {
    id: "node-shows",
    type: "sitemapCard",
    position: { x: 1520, y: 260 },
    data: {
      header: "Shows",
      title: "7th Heaven — Live Concerts & Shows",
      path: "/shows/past",
      description: "Live concert archives, tour dates schedule, venue details, and booking inquiry.",
    },
  },
  {
    id: "node-pagetransition",
    type: "sitemapCard",
    position: { x: 1900, y: 260 },
    data: {
      header: "Pagetransition",
      title: "7th Heaven — Official Website",
      path: "/demo/preloader",
      description:
        "7th Heaven is an experience you just have to see and hear! Charted #1 on the Midwest Billboard Charts three times with 7 major radio hits. 40 years of rocking the world.",
    },
  },
  {
    id: "node-planner",
    type: "sitemapCard",
    position: { x: 2280, y: 260 },
    data: {
      header: "Planner",
      title: "7th Heaven — Official Website",
      path: "/planner",
      description:
        "7th Heaven is an experience you just have to see and hear! Charted #1 on the Midwest Billboard Charts three times with 7 major radio hits. 40 years of rocking the world.",
    },
  },
  {
    id: "node-admin",
    type: "sitemapCard",
    position: { x: 2660, y: 260 },
    data: {
      header: "Admin",
      title: "7th Heaven — Official Website",
      path: "/admin",
      description:
        "7th Heaven is an experience you just have to see and hear! Charted #1 on the Midwest Billboard Charts three times with 7 major radio hits. 40 years of rocking the world.",
    },
  },
  {
    id: "node-book",
    type: "sitemapCard",
    position: { x: 3040, y: 260 },
    data: {
      header: "Book",
      title: "Book 7th Heaven — Chicago's Premier Live Band",
      path: "/book",
      description:
        "Book 7th Heaven for your next corporate event, wedding, festival, or private party. Premier live rock band serving Chicago, Illinois, and the Midwest. Fast quotes and seamless event planning.",
    },
  },

  // SECOND ROW SUB-CHILDREN (y = 500)
  {
    id: "node-crew-verify",
    type: "sitemapCard",
    position: { x: 1140, y: 500 },
    data: {
      header: "Verify",
      title: "7th Heaven — Official Website",
      path: "/crew/verify",
    },
  },
  {
    id: "node-shows-past",
    type: "sitemapCard",
    position: { x: 1520, y: 500 },
    data: {
      header: "Past",
      title: "Past Shows & Concert Archive (1985–Present) | 7th Heaven",
      path: "/shows/past",
      description:
        "Explore 7th Heaven's historical performance archive containing over 1,200 past concerts, festivals, casinos, and events played since 1985.",
    },
  },
  {
    id: "node-planner-verify",
    type: "sitemapCard",
    position: { x: 2280, y: 500 },
    data: {
      header: "Verify",
      title: "7th Heaven — Official Website",
      path: "/planner/verify",
    },
  },

  // ADMIN SUB-TREE (y = 500)
  {
    id: "node-admin-verify",
    type: "sitemapCard",
    position: { x: 2480, y: 500 },
    data: {
      header: "Verify",
      title: "7th Heaven — Official Website",
      path: "/admin",
    },
  },
  {
    id: "node-admin-emailmap",
    type: "sitemapCard",
    position: { x: 2660, y: 500 },
    data: {
      header: "Email Map",
      title: "7th Heaven — Official Website",
      path: "/admin/emails",
    },
  },
  {
    id: "node-admin-legal",
    type: "sitemapCard",
    position: { x: 2840, y: 500 },
    data: {
      header: "Legal",
      title: "7th Heaven — Official Website",
      path: "/admin/legal",
    },
  },

  // BOOK SUB-TREE (y = 500)
  {
    id: "node-book-success",
    type: "sitemapCard",
    position: { x: 3040, y: 500 },
    data: {
      header: "Success",
      title: "Book 7th Heaven — Confirmation",
      path: "/book/success",
    },
  },
];

// --- ORTHOGONAL CONNECTING LINES WITH NO FILL GLITCHES ---
const INITIAL_EDGES: Edge[] = [
  { id: "e-root-sitemap", source: "root", target: "node-sitemap", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2, fill: "none" } },
  { id: "e-root-privacy", source: "root", target: "node-privacy", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2, fill: "none" } },
  { id: "e-root-merch", source: "root", target: "node-merch", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2, fill: "none" } },
  { id: "e-root-crew", source: "root", target: "node-crew", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2, fill: "none" } },
  { id: "e-root-shows", source: "root", target: "node-shows", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2, fill: "none" } },
  { id: "e-root-pagetransition", source: "root", target: "node-pagetransition", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2, fill: "none" } },
  { id: "e-root-planner", source: "root", target: "node-planner", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2, fill: "none" } },
  { id: "e-root-admin", source: "root", target: "node-admin", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2, fill: "none" } },
  { id: "e-root-book", source: "root", target: "node-book", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2, fill: "none" } },

  // Sub-tree connections
  { id: "e-crew-verify", source: "node-crew", target: "node-crew-verify", type: "smoothstep", style: { stroke: "#38bdf8", strokeWidth: 2, fill: "none" } },
  { id: "e-shows-past", source: "node-shows", target: "node-shows-past", type: "smoothstep", style: { stroke: "#38bdf8", strokeWidth: 2, fill: "none" } },
  { id: "e-planner-verify", source: "node-planner", target: "node-planner-verify", type: "smoothstep", style: { stroke: "#38bdf8", strokeWidth: 2, fill: "none" } },
  { id: "e-admin-verify", source: "node-admin", target: "node-admin-verify", type: "smoothstep", style: { stroke: "#38bdf8", strokeWidth: 2, fill: "none" } },
  { id: "e-admin-emailmap", source: "node-admin", target: "node-admin-emailmap", type: "smoothstep", style: { stroke: "#38bdf8", strokeWidth: 2, fill: "none" } },
  { id: "e-admin-legal", source: "node-admin", target: "node-admin-legal", type: "smoothstep", style: { stroke: "#38bdf8", strokeWidth: 2, fill: "none" } },
  { id: "e-book-success", source: "node-book", target: "node-book-success", type: "smoothstep", style: { stroke: "#38bdf8", strokeWidth: 2, fill: "none" } },
];

export default function VisualSitemapClient() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-20 pb-12">
      
      {/* Global CSS override to eliminate SVG fill glitches on connector paths */}
      <style jsx global>{`
        .react-flow__edge-path {
          fill: none !important;
          stroke: #a855f7 !important;
          stroke-width: 2px !important;
        }
      `}</style>

      {/* Header bar */}
      <div className="max-w-[1700px] mx-auto px-6 py-4 flex items-center justify-between border border-purple-500/30 bg-[#0c0c14] mb-4 shadow-2xl rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-sm shadow-md">
            7H
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-wider uppercase">
              7th Heaven Visual Sitemap Engine
            </h1>
            <p className="text-xs text-white/50">
              Interactive visual sitemap tree architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg border border-white/15 bg-white/5 text-white font-bold text-xs hover:bg-white/10 transition flex items-center gap-1.5"
          >
            <span>XML Sitemap</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Interactive Flow Canvas */}
      <div className="max-w-[1700px] mx-auto h-[820px] rounded-2xl border border-purple-500/30 bg-[#09090f] overflow-hidden shadow-2xl relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          colorMode="dark"
        >
          <Background color="#1e1b4b" gap={24} size={1} />
          <Controls className="!bg-black/90 !border-white/15 !text-white !rounded-xl overflow-hidden !shadow-2xl" />
          <MiniMap
            style={{ height: 110, width: 160 }}
            maskColor="rgba(0, 0, 0, 0.8)"
            nodeColor="#a855f7"
            className="!bg-black/90 !border-white/15 !rounded-xl !shadow-2xl"
          />
        </ReactFlow>
      </div>

    </div>
  );
}
