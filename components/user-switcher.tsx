import { Check, ChevronsUpDown, User } from "lucide-react";
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

  if (isLoading) {
    return (
      <Button disabled size="sm" variant="outline">
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex items-center gap-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100"
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
  );
}
