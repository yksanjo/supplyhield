import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Building2,
  Shield,
  Settings,
  ChevronUp,
  LogOut,
  User,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Vendors",
    url: "/vendors",
    icon: Building2,
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const userInitials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
      user.email?.[0]?.toUpperCase() ||
      "U"
    : "U";

  const userName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.email ||
      "User"
    : "User";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1.5 -mx-2 cursor-pointer" data-testid="link-home">
            <Shield className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg tracking-tight">SupplyShield</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url || 
                  (item.url !== "/" && location.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-2"
              data-testid="button-user-menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.profileImageUrl || undefined}
                  alt={userName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                {user?.email && (
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                )}
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/api/logout" className="flex items-center gap-2 cursor-pointer" data-testid="menu-item-logout">
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
