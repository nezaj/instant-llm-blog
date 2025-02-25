"use client";

import { id, init, InstaQLEntity } from "@instantdb/react";
import { useState } from 'react';
import Link from 'next/link';

// Import schema (assuming this is how your setup works)
import schema from "@/instant.schema";

type Todo = InstaQLEntity<typeof schema, "todos">;
const db = init({ appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!, schema });

interface Post {
  id: number;
  title: string;
  content: string;
}

export default function BlogEditor() {
  // State for the current post being edited
  const [currentPost, setCurrentPost] = useState<Post>({
    title: '',
    content: '',
    id: 0
  });

  // State for all saved posts
  const [posts, setPosts] = useState<Post[]>([]);

  // State to track which post is currently being viewed/edited
  const [activePostId, setActivePostId] = useState<number | null>(null);

  // Handle title input changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPost({
      ...currentPost,
      title: e.target.value
    });
  };

  // Handle content input changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentPost({
      ...currentPost,
      content: e.target.value
    });
  };

  // Handle publishing a post
  const handlePublish = () => {
    if (!currentPost.title.trim() || !currentPost.content.trim()) {
      return; // Don't publish empty posts
    }

    if (activePostId !== null) {
      // Update existing post
      setPosts(posts.map(post =>
        post.id === activePostId
          ? { ...currentPost, id: activePostId }
          : post
      ));
    } else {
      // Create a new post with a unique ID
      const newPost: Post = {
        ...currentPost,
        id: Date.now(), // Use timestamp as a simple unique ID
      };

      setPosts([...posts, newPost]);
    }

    // Reset the editor
    setCurrentPost({
      title: '',
      content: '',
      id: 0
    });
    setActivePostId(null);
  };

  // Load a post into the editor when clicked
  const handlePostClick = (postId: number) => {
    const postToEdit = posts.find(post => post.id === postId);
    if (postToEdit) {
      setCurrentPost(postToEdit);
      setActivePostId(postId);
    }
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
            Publish
          </button>
        </div>
      </div>

      {/* Post List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Your Posts</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet. Create your first post!</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post.id)}
              className={`py-2 cursor-pointer ${activePostId === post.id ? 'font-bold' : ''}`}
            >
              {post.title}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
