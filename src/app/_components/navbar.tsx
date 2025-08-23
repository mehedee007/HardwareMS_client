"use client"
import { ChartBar, ClosedCaption, Layout, LayoutDashboard, LayoutDashboardIcon, LogOut, Menu, Plus, Sunset, Trees, User, Zap } from "lucide-react";

import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import useStore from "@/store";
import { toast } from "sonner";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"



interface MenuItem {
    title: string;
    url: string;
    description?: string;
    icon?: React.ReactNode;
    items?: MenuItem[];
}



const Navbar = () => {
    const loginUserData = useStore((state) => state.loginUser);
    const handleLogout = useStore((state) => state.clearLoginUser);
    return (
        <section className="py-4">
            <div className="w-full">
                {/* Desktop Menu */}
                <nav className="flex justify-between px-5">
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <img
                                src="/assets/logo.png"
                                alt="logo"
                                className="max-h-8 dark:invert"
                            />
                            <span className="text-lg font-semibold tracking-tighter">
                                Employee Voice
                            </span>
                        </Link>

                    </div>
                    <div className="flex items-center gap-3">
                        <a href="/dashboard"><Button variant="outline">Dashboard</Button></a>
                        {/* <Drawer direction="right">
                            <DrawerTrigger className="border p-2 rounded-full"><LayoutDashboard /></DrawerTrigger>
                            <DrawerContent >
                                <DrawerHeader>
                                    <DrawerTitle>Employee Voice</DrawerTitle>
                                    <DrawerDescription>Your Voice Matters</DrawerDescription>
                                </DrawerHeader>
                                <div className="mx-5 flex flex-col gap-2">
                                    <Link className="group" href="/forms/create">
                                        <Button className="w-full">Create Form <Plus className="group-hover:spin-in" /></Button>
                                    </Link>
                                    <Link href="/dashboard">
                                        <Button className="w-full">Dashboard <Layout /></Button>
                                    </Link>
                                </div>
                                <DrawerFooter>
                                    <DrawerClose>
                                        <Button className="w-full text-red-500 border border-red-500" variant="outline">Cancel <ClosedCaption /></Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer> */}

                        <DropdownMenu>
                            <DropdownMenuTrigger className="border" asChild>
                                <Avatar>
                                    <AvatarImage src={`data:image/jpeg;base64,${loginUserData?.userImage}`} />
                                    <AvatarFallback>{loginUserData?.userName?.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <Link href="/profile">
                                    <DropdownMenuItem>
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </DropdownMenuItem>
                                </Link>

                                <Link className="mb-2" href="/dashboard" target="_blank">
                                    <DropdownMenuItem>
                                        <LayoutDashboardIcon className="w-4 h-4 mr-2" />
                                        Dashboard
                                    </DropdownMenuItem>
                                </Link>
                                <Separator />
                                <Button onClick={() => { toast.success(`Good bye ${loginUserData?.userName} 😊.`); handleLogout() }} className="w-full my-3" size="sm" variant="destructive">Logout <LogOut /></Button>
                            </DropdownMenuContent>
                        </DropdownMenu>


                    </div>
                </nav>


            </div>
        </section>
    );
};

const renderMenuItem = (item: MenuItem) => {
    if (item.items) {
        return (
            <NavigationMenuItem key={item.title}>
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-popover text-popover-foreground">
                    {item.items.map((subItem) => (
                        <NavigationMenuLink asChild key={subItem.title} className="w-80">
                            <SubMenuLink item={subItem} />
                        </NavigationMenuLink>
                    ))}
                </NavigationMenuContent>
            </NavigationMenuItem>
        );
    }

    return (
        <NavigationMenuItem key={item.title}>
            <NavigationMenuLink
                href={item.url}
                className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
                {item.title}
            </NavigationMenuLink>
        </NavigationMenuItem>
    );
};

const renderMobileMenuItem = (item: MenuItem) => {
    if (item.items) {
        return (
            <AccordionItem key={item.title} value={item.title} className="border-b-0">
                <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
                    {item.title}
                </AccordionTrigger>
                <AccordionContent className="mt-2">
                    {item.items.map((subItem) => (
                        <SubMenuLink key={subItem.title} item={subItem} />
                    ))}
                </AccordionContent>
            </AccordionItem>
        );
    }

    return (
        <a key={item.title} href={item.url} className="text-md font-semibold">
            {item.title}
        </a>
    );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
    return (
        <a
            className="hover:bg-muted hover:text-accent-foreground flex select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors"
            href={item.url}
        >
            <div className="text-foreground">{item.icon}</div>
            <div>
                <div className="text-sm font-semibold">{item.title}</div>
                {item.description && (
                    <p className="text-muted-foreground text-sm leading-snug">
                        {item.description}
                    </p>
                )}
            </div>
        </a>
    );
};

export { Navbar };
