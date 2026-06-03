import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useUser } from "../hooks/useAuth";
import { Button } from "./ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "./ui/drawer";

export default function Header() {
	const user = useUser();

	return (
		<header className="p-8 flex justify-between items-center border-primary text-primary">
			<div className="flex items-center">
				<h1 className="text-xl font-semibold">
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
								<Button asChild>
									<Link to="/submit">Add Bidet</Link>
								</Button>
							</li>
							<li>
								<Link to="/profile">My Submissions</Link>
							</li>
							<li>
								<Link to="/logout">Logout</Link>
							</li>
						</>
					) : (
						<>
							<li>
								<Button asChild>
									<Link to="/register">Sign Up</Link>
								</Button>
							</li>
							<li>
								<Link to="/login">Log In</Link>
							</li>
						</>
					)}
				</ul>
			</nav>
			<Drawer direction="left">
				<DrawerTrigger asChild>
					<Button
						aria-label="Open menu"
						variant="ghost"
						className="sm:hidden"
						size="icon"
					>
						<Menu size={24} />
					</Button>
				</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader className="flex flex-row justify-between items-center">
						<DrawerTitle>
							<h2 className="text-xl text-primary font-bold">dvobdt</h2>
						</DrawerTitle>
						<DrawerClose asChild>
							<Button aria-label="Close menu" variant="ghost" size="icon-lg">
								<X size={24} />
							</Button>
						</DrawerClose>
					</DrawerHeader>
					<nav className="flex-1 p-4 overflow-y-auto">
						<div className="mb-4">
							<DrawerClose asChild>
								<Button
									asChild
									variant="link"
									size="lg"
									className="flex items-center justify-start text-base"
								>
									<Link to="/">
										<span className="font-medium">Home</span>
									</Link>
								</Button>
							</DrawerClose>
							{(() => {
								if (user?.data) {
									return (
										<>
											<DrawerClose asChild>
												<Button
													asChild
													variant="link"
													size="lg"
													className="flex items-center justify-start text-base"
												>
													<Link to="/submit">
														<span className="font-medium">Add Bidet</span>
													</Link>
												</Button>
											</DrawerClose>
											<DrawerClose asChild>
												<Button
													asChild
													variant="link"
													size="lg"
													className="flex items-center justify-start text-base"
												>
													<Link to="/profile">
														<span className="font-medium">My Submissions</span>
													</Link>
												</Button>
											</DrawerClose>
											<DrawerClose asChild>
												<Button
													asChild
													variant="link"
													size="lg"
													className="flex items-center justify-start text-base"
												>
													<Link to="/logout">Logout</Link>
												</Button>
											</DrawerClose>
										</>
									);
								}

								return (
									<>
										<DrawerClose asChild>
											<Button
												asChild
												className="flex items-center justify-start text-base"
												size="lg"
												variant="link"
											>
												<Link to="/login">Log In</Link>
											</Button>
										</DrawerClose>
										<DrawerClose asChild>
											<Button
												asChild
												className="flex items-center justify-start text-base"
												size="lg"
												variant="link"
											>
												<Link to="/register">Sign Up</Link>
											</Button>
										</DrawerClose>
									</>
								);
							})()}
						</div>
					</nav>
				</DrawerContent>
			</Drawer>
		</header>
	);
}
