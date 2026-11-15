"use client"

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { useId } from "react"

const STRATEGY = { vertical: verticalListSortingStrategy, horizontal: horizontalListSortingStrategy, grid: rectSortingStrategy }

export type Handle = React.HTMLAttributes<HTMLElement> & { ref: (el: HTMLElement | null) => void }

// A reorderable list. Each item renders itself and gets a `handle` to spread on its drag grip
// (or on the whole item for small things like chips: dragging only starts after moving 6px, so clicks still work).
export function Sortable<T>({
  items,
  getId,
  onChange,
  layout = "vertical",
  className,
  children,
}: {
  items: T[]
  getId: (item: T) => string
  onChange: (items: T[]) => void
  layout?: keyof typeof STRATEGY
  className?: string
  children: (item: T, index: number, handle: Handle, dragging: boolean) => React.ReactNode
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const ids = items.map(getId)
  const dndId = useId() // stable across server and client render (dnd-kit's own counter is not)
  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    onChange(arrayMove(items, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id))))
  }
  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={STRATEGY[layout]}>
        <div className={className}>
          {items.map((item, i) => (
            <Item key={ids[i]} id={ids[i]}>
              {(handle, dragging) => children(item, i, handle, dragging)}
            </Item>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function Item({ id, children }: { id: string; children: (handle: Handle, dragging: boolean) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        position: "relative",
        zIndex: isDragging ? 20 : undefined,
      }}
    >
      {children({ ...attributes, ...listeners, ref: setActivatorNodeRef } as Handle, isDragging)}
    </div>
  )
}

export function Grip({ handle, label = "ลากเพื่อย้าย" }: { handle: Handle; label?: string }) {
  return (
    <button
      type="button"
      {...handle}
      aria-label={label}
      title={label}
      className="flex h-7 w-7 cursor-grab touch-none items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-sm hover:text-foreground active:cursor-grabbing"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  )
}

// for items that contain an input (chips): typing Space/Enter in the input must not start a keyboard drag
export function outsideInputs(handle: Handle): Handle {
  const onKeyDown = handle.onKeyDown
  return {
    ...handle,
    onKeyDown: (e) => {
      if ((e.target as HTMLElement).tagName !== "INPUT") onKeyDown?.(e)
    },
  }
}
