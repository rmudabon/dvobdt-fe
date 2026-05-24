import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useUser } from "../hooks/useAuth";
import { Button } from "./ui/button";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const user = useUser();

	return (
		<>
			<header className="p-8 flex justify-between items-center border-primary text-primary">
				<div className="flex items-center">
					<Button
						onClick={() => setIsOpen(true)}
						aria-label="Open menu"
						variant="ghost"
						className="sm:hidden"
						size="icon-lg"
					>
						<Menu size={24} />
					</Button>
					<h1 className="ml-4 text-xl font-semibold">
						<Link to="/">
							<h1 className="text-primary font-semibold">dvobdt</h1>
						</Link>
					</h1>
				</div>
				<nav className="hidden sm:block">
					<ul className="flex items-center gap-4">
						{user?.data ? (
							<>
								<li>
									<Link to="/submit">Add Bidet</Link>
								</li>
								<li>
									<Link to="/logout">Logout</Link>
								</li>
							</>
						) : (
							<>
								<li>
									<Link to="/login">Log In</Link>
								</li>
								<li>
									<Button asChild>
										<Link to="/register">Sign Up</Link>
									</Button>
								</li>
							</>
						)}
					</ul>
				</nav>
			</header>

			<aside
				className={`fixed top-0 left-0 h-full w-80 bg-secondary text-primary shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between p-4 border-b">
					<h2 className="text-xl font-bold">dvobdt</h2>
					<Button
						onClick={() => setIsOpen(false)}
						aria-label="Close menu"
						variant="ghost"
						size="icon-lg"
					>
						<X size={24} />
					</Button>
				</div>

				<nav className="flex-1 p-4 overflow-y-auto">
					<div className="mb-4">
						{(() => {
							if (user?.data) {
								return (
									<div className="flex flex-col gap-2">
										<span className="text-sm">Signed in as</span>
										<span className="font-semibold">{user.data.username}</span>
										<Button asChild>
											<Link to="/profile" onClick={() => setIsOpen(false)}>
												<span className="font-medium">My Submissions</span>
											</Link>
										</Button>
										<Button asChild>
											<Link to="/logout" onClick={() => setIsOpen(false)}>
												Logout
											</Link>
										</Button>
									</div>
								);
							}

							return (
								<>
									<Button
										asChild
										className="flex items-center justify-start"
										size="lg"
										variant="link"
									>
										<Link to="/login" onClick={() => setIsOpen(false)}>
											Log In
										</Link>
									</Button>
									<Button
										asChild
										className="flex items-center justify-start"
										size="lg"
									>
										<Link to="/register" onClick={() => setIsOpen(false)}>
											Sign Up
										</Link>
									</Button>
								</>
							);
						})()}
					</div>

					<Button
						asChild
						variant="link"
						size="lg"
						className="flex items-center justify-start"
					>
						<Link to="/" onClick={() => setIsOpen(false)}>
							<span className="font-medium">Home</span>
						</Link>
					</Button>
				</nav>
			</aside>
		</>
	);
}
