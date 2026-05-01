'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';

const navLinks = [
	{ href: '/', label: 'Home' },
	{ href: '/about', label: 'About' },
	{ href: '/services', label: 'Services' },
	{ href: '/pricing', label: 'Pricing' },
	{ href: '/projects', label: 'Projects' },
	{ href: '/blogs', label: 'Blog' },
	{ href: '/contact', label: 'Contact' },
];

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		setIsOpen(false);
	}, [pathname]);

	const isActive = (href) => {
		if (href === '/') return pathname === '/';
		return pathname === href || pathname.startsWith(`${href}/`);
	};

	return (
		<header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020617]/55 backdrop-blur-xl">
			<div className="container-custom">
				<div className="flex h-20 items-center justify-between gap-4">
					<Link href="/" className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-sm font-bold text-white">
							AS
						</div>
						<div className="leading-tight">  
							<div className="text-base font-semibold text-white">AdSky Solution</div>
						</div>
					</Link>

					<nav className="hidden md:flex items-center gap-1 rounded-full border border-white/5 bg-white/5 px-2 py-2">
						{navLinks.map((link) => {
							const active = isActive(link.href);
							return (
								<Link
									key={link.href}
									href={link.href}
									className={`relative px-4 py-2 text-sm font-medium transition-colors ${
										active ? 'text-white' : 'text-text-secondary hover:text-white'
									}`}
								>
									{link.label}
									<span
										className={`absolute left-4 right-4 -bottom-0.5 h-0.5 rounded-full bg-white transition-all ${
											active ? 'opacity-100' : 'opacity-0'
										}`}
									/>
								</Link>
							);
						})}
					</nav>

					<div className="hidden md:block">
						<Link href="/about" className="btn-primary !rounded-full !px-6 !py-3 text-sm">
							Get Started
						</Link>
					</div>

					<button
						type="button"
						onClick={() => setIsOpen((value) => !value)}
						className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
						aria-label="Toggle navigation"
					>
						{isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
					</button>
				</div>

				{isOpen && (
					<div className="md:hidden pb-5">
						<div className="rounded-2xl border border-white/10 bg-[#0b1220]/95 p-3 shadow-lg shadow-black/20">
							<nav className="grid gap-1">
								{navLinks.map((link) => {
									const active = isActive(link.href);
									return (
										<Link
											key={link.href}
											href={link.href}
											className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
												active
													? 'bg-white/10 text-white'
													: 'text-text-secondary hover:bg-white/5 hover:text-white'
											}`}
										>
											{link.label}
										</Link>
									);
								})}
								<Link href="/about" className="btn-primary mt-2 w-full justify-center !rounded-xl">
									Get Started
								</Link>
							</nav>
						</div>
					</div>
				)}
			</div>
		</header>
	);
}
