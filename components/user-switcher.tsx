import { Check, ChevronsUpDown, GripVertical, User } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { useUser } from "../lib/user-context";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function UserSwitcher() {
  const { currentUser, currentUserId, allUsers, switchUser, isLoading } =
    useUser();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) {
        return;
      }
      const deltaX = moveEvent.clientX - dragRef.current.startX;
      const deltaY = moveEvent.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.initialX + deltaX,
        y: dragRef.current.initialY + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (isLoading) {
    return (
      <Button disabled size="sm" variant="outline">
        Loading...
      </Button>
    );
  }

  return (
    <div
      className="flex items-center gap-1"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      <button
        className="flex h-8 w-6 cursor-grab items-center justify-center rounded-l-md border border-yellow-200 border-r-0 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 active:cursor-grabbing dark:border-yellow-500/30 dark:bg-yellow-500/20 dark:text-yellow-400 dark:hover:bg-yellow-500/30"
        onMouseDown={handleMouseDown}
        title="Drag to move"
        type="button"
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="flex items-center gap-2 rounded-l-none border-yellow-200 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-500/30 dark:bg-yellow-500/20 dark:text-yellow-300 dark:hover:bg-yellow-500/30"
            size="sm"
            variant="outline"
          >
            <User className="h-4 w-4" />
            <span className="max-w-[120px] truncate">
              {currentUser?.name || "Select User"}
            </span>
            <ChevronsUpDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[250px]">
          <DropdownMenuLabel className="text-muted-foreground text-xs">
            Switch User (Testing Mode)
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allUsers.map((user) => (
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-3"
              key={user.id}
              onClick={() => switchUser(user.id)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage alt={user.name} src={user.avatarUrl} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-sm">{user.name}</div>
                <div className="truncate text-muted-foreground text-xs">
                  {user.location}
                </div>
              </div>
              {currentUserId === user.id && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
