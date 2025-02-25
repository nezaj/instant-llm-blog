"use client";

import { id, init, tx, InstaQLEntity } from "@instantdb/react";
import { useState, ChangeEvent, MouseEvent } from 'react';
import Link from 'next/link';

// Import schema and its type
import schema, { AppSchema } from "@/instant.schema";

// Initialize InstantDB with your app ID and schema
const db = init<AppSchema>({
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

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

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

  // Open delete confirmation modal
  const openDeleteModal = (e: MouseEvent, postId: string): void => {
    e.stopPropagation(); // Prevent the post from being selected when clicking delete
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = (): void => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  // Handle deleting a post
  const handleDeletePost = async (): Promise<void> => {
    if (!postToDelete) return;

    // Delete the post from InstantDB
    await db.transact(tx.posts[postToDelete].delete());

    // If we're editing the post we just deleted, clear the editor
    if (currentPost.id === postToDelete) {
      setCurrentPost({
        title: '',
        content: '',
        id: null
      });
    }

    // Close the modal
    closeDeleteModal();
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Post</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setCurrentPost({
                title: '',
                content: '',
                id: null
              });
            }}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            New Post
          </button>
          <Link
            href="/"
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            Back to Home
          </Link>
        </div>
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
          <div className="space-y-1">
            {data.posts.map((post: Post) => (
              <div
                key={post.id}
                className={`py-2 px-3 border border-gray-200 rounded-md flex justify-between items-center hover:bg-gray-50 ${currentPost.id === post.id ? 'border-blue-300 bg-blue-50' : ''
                  }`}
              >
                <div
                  className="cursor-pointer flex-grow"
                  onClick={() => handlePostClick(post)}
                >
                  {post.title}
                </div>
                <button
                  onClick={(e) => openDeleteModal(e, post.id)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
