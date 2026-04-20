'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { reorderPages } from '@/app/actions';

interface Page {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
}

function SortableItem({ page, editId, bookId, index }: { page: Page; editId: string; bookId: string; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
    scale: isDragging ? 1.05 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="page-card" style={{
        width: '300px', height: '400px',
        display: 'flex', flexDirection: 'column',
        opacity: page.is_published ? 1 : 0.7,
        border: page.is_published ? '1px solid var(--border)' : '1px dashed var(--border)',
        position: 'relative',
        boxShadow: isDragging ? '0 20px 40px rgba(0,0,0,0.4)' : 'none',
      }}>
        {/* Drag Handle */}
        <div {...listeners} style={{ position: 'absolute', top: '1rem', left: '1rem', cursor: 'grab', opacity: 0.5 }}>
          ⋮⋮
        </div>

        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          {!page.is_published && (
            <div style={{ background: 'var(--accent)', color: 'white', padding: '0.2rem 0.6rem', fontSize: '10px', borderRadius: '4px', letterSpacing: '0.1em' }} className="font-ui">
              DRAFT
            </div>
          )}
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.2rem 0.6rem', fontSize: '10px', borderRadius: '4px', letterSpacing: '0.1em' }} className="font-ui">
            PAGE {index + 1}
          </div>
        </div>

        <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '1rem', marginTop: '2rem' }}>{page.title}</h3>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 8, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {page.content.replace(/<[^>]*>/g, ' ').trim()}
        </p>

        <Link
          href={`/e/${editId}/book/${bookId}/edit/${page.id}`}
          style={{
            marginTop: '1.5rem', alignSelf: 'flex-start',
            fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.1em',
            color: 'var(--accent)', textDecoration: 'none', cursor: 'pointer', zIndex: 10, position: 'relative'
          }}
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking link
        >
          TAP TO EDIT &rarr;
        </Link>
      </div>
    </div>
  );
}

export default function SortableGrid({
  initialPages,
  editId,
  bookId
}: {
  initialPages: Page[];
  editId: string;
  bookId: string;
}) {
  const [pages, setPages] = useState(initialPages);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        reorderPages(editId, bookId, newOrder.map(p => p.id));
        return newOrder;
      });
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
          {pages.map((page, i) => (
            <SortableItem key={page.id} page={page} editId={editId} bookId={bookId} index={i} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
