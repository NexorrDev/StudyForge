"use client";
import NoteEditorPage from "@/components/notes/NoteEditor";
export default function EditNotePage({ params }: { params: { id: string } }) {
  return <NoteEditorPage noteId={params.id} />;
}
