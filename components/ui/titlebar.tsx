"use client"
import Image from "next/image";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
// @damovisa I am sorry I don't think this is the best way to do this but I am not sure how to do it better.


  const TitleBar: React.FC = () => {    
    const pathname = usePathname();

    const pageTitles: { [key: string]: string } = {
        '/': 'Book Flight',
        '/find-booking': 'Find My Booking',
        '/travelguide': 'Travel Guide',
        '/profile': 'Profile',
        '/admin/travelguide': 'Admin',
    };

    const pageTitle = pageTitles[pathname] || '';
    return (
        <header className={`sticky top-0 bg-purple-900 text-white z-50 shadow-md flex justify-between items-center px-5 py-2.5 opacity-90 backdrop-blur${pathname === '/admin/travelguide' ? ' bg-black' : ''}`}>
            <div className="flex items-center gap-2">
                <Link href="/">
                  <Image src="/img/logo.svg" width={40} height={32} alt="Copilot Airways" className="h-8 w-auto" />
                </Link>
                <span className="text-lg font-medium">{pageTitle}</span> 
            </div>
            <nav>
            {pathname === '/admin/travelguide' ? (             
                    <ul className="flex items-center">
                    <li>
                            <Link href="/profile">
                                <Image src="/img/profile-photo.png" width={32} height={32} alt="User profile" className="rounded-full" />
                            </Link>
                        </li>
                    </ul>           
            ) : (
                    <ul className="flex items-center">
                        <li className={pathname === '/' ? 'border-b-2 border-white pb-1' : ''}>
                            <Link href="/">Book Flight</Link>
                        </li>
                        <li className={pathname === '/find-booking' ? 'ml-5 border-b-2 border-white pb-1' : 'ml-5'}>
                            <Link href="/find-booking">Find My Booking</Link>
                        </li>
                        <li className={pathname === '/travelguide' ? 'ml-5 border-b-2 border-white pb-1' : 'ml-5'}>
                            <Link href="/travelguide">Travel Guide</Link>
                        </li>
                        <li className="ml-5">
                            <Link href="/profile">
                                <Image src="/img/profile-photo.png" width={32} height={32} alt="User profile" className="rounded-full" />
                            </Link>
                        </li>
                    </ul>
            )}
            </nav>
        </header>
    );
};

export default TitleBar;