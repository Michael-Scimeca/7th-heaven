"use client";

import React, { useState, useCallback } from "react";
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

import {
  Globe,
  Search,
  ExternalLink,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  FileText,
  Shield,
  ShoppingBag,
  Users,
  Calendar,
  Sparkles,
  Lock,
  Mail,
} from "lucide-react";

export interface SitemapNodeData extends Record<string, unknown> {
  header: string;
  title: string;
  path?: string;
  description?: string;
}

// --- CUSTOM SITEMAP CARD NODE (Matching exact screenshot design) ---
function SitemapCardNode({ data }: NodeProps<Node<SitemapNodeData>>) {
  return (
    <div className="w-64 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden select-none hover:shadow-md transition-all duration-200">
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-400 !border-0" />
      
      {/* Top Gray Header Bar */}
      <div className="bg-gray-100 border-b border-gray-200 py-1.5 px-3 text-center">
        <span className="font-bold text-xs text-gray-700 tracking-tight block truncate">
          {data.header}
        </span>
      </div>

      {/* Body Content */}
      <div className="p-3 text-left space-y-1">
        {data.path ? (
          <Link href={data.path} className="font-bold text-xs text-blue-600 hover:underline block leading-snug">
            {data.title}
          </Link>
        ) : (
          <span className="font-bold text-xs text-blue-600 block leading-snug">
            {data.title}
          </span>
        )}

        {data.description && (
          <p className="text-gray-600 text-[11px] leading-snug mt-1">
            {data.description}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-400 !border-0" />
    </div>
  );
}

const nodeTypes = {
  sitemapCard: SitemapCardNode,
};

// --- NODES MATCHING EXACT USER SCREENSHOT TREE ---
const INITIAL_NODES: Node<SitemapNodeData>[] = [
  // ROOT HOME (Center Top at x = 1200, y = 30)
  {
    id: "root",
    type: "sitemapCard",
    position: { x: 1200, y: 30 },
    data: {
      header: "Home Page",
      title: "7th Heaven — Official Band Website",
      path: "/",
      description:
        "7th Heaven is a chart-topping rock experience from Chicago with #1 Billboard hits and 40 years of unforgettable live performances.",
    },
  },

  // FIRST ROW CHILDREN (y = 240, 300px horizontal pitch)
  {
    id: "node-sitemap",
    type: "sitemapCard",
    position: { x: 0, y: 240 },
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
    position: { x: 300, y: 240 },
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
    position: { x: 600, y: 240 },
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
    position: { x: 900, y: 240 },
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
    position: { x: 1200, y: 240 },
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
    position: { x: 1500, y: 240 },
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
    position: { x: 1800, y: 240 },
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
    position: { x: 2100, y: 240 },
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
    position: { x: 2400, y: 240 },
    data: {
      header: "Book",
      title: "Book 7th Heaven — Chicago's Premier Live Band",
      path: "/book",
      description:
        "Book 7th Heaven for your next corporate event, wedding, festival, or private party. Premier live rock band serving Chicago, Illinois, and the Midwest. Fast quotes and seamless event planning.",
    },
  },

  // SECOND ROW SUB-CHILDREN (y = 440)
  {
    id: "node-crew-verify",
    type: "sitemapCard",
    position: { x: 900, y: 440 },
    data: {
      header: "Verify",
      title: "7th Heaven — Official Website",
      path: "/crew/verify",
    },
  },
  {
    id: "node-shows-past",
    type: "sitemapCard",
    position: { x: 1200, y: 440 },
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
    position: { x: 1800, y: 440 },
    data: {
      header: "Verify",
      title: "7th Heaven — Official Website",
      path: "/planner/verify",
    },
  },

  // ADMIN SUB-TREE (y = 440 & y = 600)
  {
    id: "node-admin-verify",
    type: "sitemapCard",
    position: { x: 1950, y: 440 },
    data: {
      header: "Verify",
      title: "7th Heaven — Official Website",
      path: "/admin",
    },
  },
  {
    id: "node-admin-emailmap",
    type: "sitemapCard",
    position: { x: 2100, y: 440 },
    data: {
      header: "Email Map",
      title: "7th Heaven — Official Website",
      path: "/admin/emails",
    },
  },
  {
    id: "node-admin-legal",
    type: "sitemapCard",
    position: { x: 2250, y: 440 },
    data: {
      header: "Legal",
      title: "7th Heaven — Official Website",
      path: "/admin/legal",
    },
  },

  // BOOK SUB-TREE (y = 440)
  {
    id: "node-book-success",
    type: "sitemapCard",
    position: { x: 2400, y: 440 },
    data: {
      header: "Success",
      title: "Book 7th Heaven — Confirmation",
      path: "/book/success",
    },
  },
];

// --- ORTHOGONAL CONNECTING LINES (Matching screenshot line tree) ---
const INITIAL_EDGES: Edge[] = [
  { id: "e-root-sitemap", source: "root", target: "node-sitemap", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-root-privacy", source: "root", target: "node-privacy", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-root-merch", source: "root", target: "node-merch", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-root-crew", source: "root", target: "node-crew", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-root-shows", source: "root", target: "node-shows", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-root-pagetransition", source: "root", target: "node-pagetransition", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-root-planner", source: "root", target: "node-planner", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-root-admin", source: "root", target: "node-admin", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-root-book", source: "root", target: "node-book", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },

  // Sub-tree connections
  { id: "e-crew-verify", source: "node-crew", target: "node-crew-verify", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-shows-past", source: "node-shows", target: "node-shows-past", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-planner-verify", source: "node-planner", target: "node-planner-verify", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-admin-verify", source: "node-admin", target: "node-admin-verify", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-admin-emailmap", source: "node-admin", target: "node-admin-emailmap", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-admin-legal", source: "node-admin", target: "node-admin-legal", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
  { id: "e-book-success", source: "node-book", target: "node-book-success", type: "smoothstep", style: { stroke: "#cbd5e1", strokeWidth: 1.5 } },
];

export default function VisualSitemapClient() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 pt-20 pb-12">
      
      {/* Header bar */}
      <div className="max-w-[1700px] mx-auto px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white mb-4 shadow-sm rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
            7H
          </div>
          <div>
            <h1 className="font-extrabold text-base text-gray-900 tracking-tight">
              7th Heaven Visual Sitemap Generator
            </h1>
            <p className="text-xs text-gray-500">
              Interactive visual sitemap tree architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition flex items-center gap-1.5"
          >
            <span>XML Sitemap</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Interactive Flow Canvas */}
      <div className="max-w-[1700px] mx-auto h-[820px] rounded-2xl border border-gray-200 bg-[#f8fafc] overflow-hidden shadow-inner relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          colorMode="light"
        >
          <Background color="#cbd5e1" gap={24} size={1} />
          <Controls className="!bg-white !border-gray-200 !text-gray-700 !rounded-xl overflow-hidden !shadow-md" />
          <MiniMap
            style={{ height: 110, width: 160 }}
            maskColor="rgba(248, 250, 252, 0.7)"
            nodeColor="#3b82f6"
            className="!bg-white !border-gray-200 !rounded-xl !shadow-md"
          />
        </ReactFlow>
      </div>

    </div>
  );
}
