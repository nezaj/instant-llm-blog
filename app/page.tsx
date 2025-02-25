// app/page.tsx
"use client";

import { init } from "@instantdb/react";
import Link from "next/link";
import schema from "@/instant.schema";

// Initialize InstantDB with your app ID and schema
const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  schema
});

export default function Home() {
  // Get posts from InstantDB
  const { data, isLoading } = db.useQuery({
    posts: {
      $: {
        order: { updatedAt: 'desc' }
      }
    }
  });

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Blog</h1>
        <Link
          href="/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create New Post
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading posts...</p>
      ) : !data?.posts?.length ? (
        <p className="text-gray-500">No posts yet. Create your first post!</p>
      ) : (
        <div className="space-y-12">
          {data.posts.map((post) => (
            <article key={post.id} className="border-b pb-8">
              <Link href={`/post/${post.id}`}>
                <h2 className="text-2xl font-bold mb-2 hover:text-blue-600">{post.title}</h2>
              </Link>
              <div className="text-gray-500 mb-4">
                {post.updatedAt && new Date(post.updatedAt).toLocaleDateString()}
              </div>
              <p className="text-gray-700">
                {post.content.length > 200
                  ? `${post.content.substring(0, 200)}...`
                  : post.content}
              </p>
              <div className="mt-4">
                <Link href={`/post/${post.id}`} className="text-blue-500 hover:underline">
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
