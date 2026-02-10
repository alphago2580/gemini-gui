/**
 * Shared type definitions for the renderer process.
 *
 * These types are used across multiple components, hooks, and utilities
 * to avoid duplication and ensure consistency.
 */

/** Possible roles for a chat message. */
export type MessageRole = 'user' | 'assistant';

/** State of the right-click context menu on a message. */
export interface ContextMenuState {
  x: number;
  y: number;
  messageIndex: number;
}

/** Result of applying a text formatting action (bold, italic, etc.). */
export interface FormattingResult {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

/** A function that applies text formatting around a selection. */
export type FormatterFunction = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
) => FormattingResult;

/** Filter for bookmarked/saved messages by role. */
export type RoleFilter = 'all' | MessageRole;
