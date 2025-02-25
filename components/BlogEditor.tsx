"use client";

import { id, init, tx, InstaQLEntity } from "@instantdb/react";
import { useState, ChangeEvent } from 'react';
import Link from 'next/link';

// Import schema and its type
import schema, { AppSchema } from "@/instant.schema";

// Initialize InstantDB with your app ID and schema
const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  schema
});

// Type for a post as defined in our schema
type Post = InstaQLEntity<AppSchema, "posts">;

// Type for the current post being edited (can have null id when creating new)
interface CurrentPost {
  title: string;
  content: string;
  id: string | null;
}

export default function BlogEditor() {
  // State for the current post being edited
  const [currentPost, setCurrentPost] = useState<CurrentPost>({
    title: '',
    content: '',
    id: null
  });

  // Get posts from InstantDB
  const { data, isLoading } = db.useQuery({
    posts: {}
  });

  // Handle title input changes
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentPost({
      ...currentPost,
      title: e.target.value
    });
  };

  // Handle content input changes
  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentPost({
      ...currentPost,
      content: e.target.value
    });
  };

  // Handle publishing a post
  const handlePublish = async (): Promise<void> => {
    if (!currentPost.title.trim() || !currentPost.content.trim()) {
      return; // Don't publish empty posts
    }

    const now = new Date().toISOString();

    if (currentPost.id) {
      // Update existing post
      await db.transact(
        tx.posts[currentPost.id].update({
          title: currentPost.title,
          content: currentPost.content,
          updatedAt: now,
        })
      );
    } else {
      // Create a new post
      const postId = id();
      await db.transact(
        tx.posts[postId].update({
          title: currentPost.title,
          content: currentPost.content,
          updatedAt: now,
        })
      );
    }

    // Reset the editor
    setCurrentPost({
      title: '',
      content: '',
      id: null
    });
  };

  // Load a post into the editor when clicked
  const handlePostClick = (post: Post): void => {
    setCurrentPost({
      title: post.title,
      content: post.content,
      id: post.id
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Post</h1>
        <Link
          href="/"
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
        >
          Back to Home
        </Link>
      </div>

      <div className="mb-8">
        {/* Editor */}
        <div className="border-2 border-gray-300 rounded-md mb-2">
          <input
            type="text"
            value={currentPost.title}
            onChange={handleTitleChange}
            placeholder="Title..."
            className="w-full p-4 text-xl text-gray-500 focus:outline-none"
          />
        </div>
        <div className="border-2 border-gray-300 rounded-md mb-4">
          <textarea
            value={currentPost.content}
            onChange={handleContentChange}
            placeholder="The start of something great..."
            className="w-full p-4 min-h-[400px] text-gray-500 focus:outline-none resize-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handlePublish}
            className="px-4 py-2 border-2 border-gray-300 rounded-md hover:bg-gray-100"
          >
            {currentPost.id ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Post List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Your Posts</h2>
        {isLoading ? (
          <p className="text-gray-500">Loading posts...</p>
        ) : !data?.posts?.length ? (
          <p className="text-gray-500">No posts yet. Create your first post!</p>
        ) : (
          <div>
            {data.posts.map((post: Post) => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post)}
                className={`py-2 cursor-pointer ${currentPost.id === post.id ? 'font-bold' : ''}`}
              >
                {post.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
