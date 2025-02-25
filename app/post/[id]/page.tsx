// app/post/[id]/page.tsx
"use client";

import { init } from "@instantdb/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import schema from "@/instant.schema";

// Initialize InstantDB
const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  schema
});

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string;

  // Query for the specific post by ID
  const { data, isLoading, error } = db.useQuery({
    posts: {
      $: {
        where: { id: postId }
      }
    }
  });

  const post = data?.posts?.[0];

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p>Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="text-red-500 mb-4">Error loading post: {error.message}</div>
        <Link href="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="mb-4">Post not found.</div>
        <Link href="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <Link href="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
      </div>

      <article>
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <div className="text-gray-500 mb-6">
          {post.updatedAt && new Date(post.updatedAt).toLocaleDateString()}
        </div>

        <div className="prose lg:prose-xl max-w-none">
          {post.content.split("\n").map((paragraph, index) => (
            paragraph ? <p key={index} className="mb-4">{paragraph}</p> : <br key={index} />
          ))}
        </div>
      </article>
    </div>
  );
}
