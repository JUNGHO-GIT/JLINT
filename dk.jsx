/* import React, {useEffect, useRef} from "react";
import Image from "../../assets/images/main/profile2.jpg";
import "../../core/App.css";

const socialLinks = [
	{id: 1, name: "Twitter", url: "https://twitter.com", icon: "bx bxl-twitter"},
	{id: 2, name: "Facebook", url: "https://facebook.com", icon: "bx bxl-facebook"},
	{id: 3, name: "Instagram", url: "https://instagram.com", icon: "bx bxl-instagram"},
	{id: 4, name: "Linkedin", url: "https://linkedin.com", icon: "bx bxl-linkedin"},
];

   const navLinks = [
	{id: 1, name: "Home", url: "#hero", icon: "bx bx-home"},
	{id: 2, name: "About", url: "#about", icon: "bx bx-user"},
	{id: 3, name: "Resume", url: "#resume", icon: "bx bx-file-blank"},
	{id: 4, name: "Skills", url: "#skills", icon: "bx bx-book-heart"},
	{id: 5, name: "Facts", url: "#facts", icon: "bx bx-receipt"},
	{id: 6, name: "Portfolio",url: "#portfolio",icon: "bx bx-book-content",},
];


----

----

----
const useNavToggle = (navToggleRef, sideNavRef) => {

	----

	----

	----

	----
	const onMobileNavToggleClick = (e) => {
		document.body.classList.toggle("mobile-nav-active");
		e.currentTarget.classList.toggle("bi-list");
		e.currentTarget.classList.toggle("bi-x");
	};
a

	----

	----
	const handleClickOutside = (e) => {
		if (navToggleRef.current && !navToggleRef.current.contains(e.target) && !sideNavRef.current.contains(e.target) && document.body.classList.contains("mobile-nav-active")) {
			document.body.classList.remove("mobile-nav-active");
			navToggleRef.current.classList.toggle("bi-list");
			navToggleRef.current.classList.toggle("bi-x");
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);
  return onMobileNavToggleClick;
};


----

----
const useSmoothScroll = () => {

	----

	----
	const select = (el, all = false) => {
		el = el.trim();
		return all ? [...document.querySelectorAll(el)] : document.querySelector(el);
	};


	----

	----
	const onNavItemClick = (e, hash) => {
		e.preventDefault();
		if (select(hash)) {
			let body = select("body");
			if (body.classList.contains("mobile-nav-active")) {
				body.classList.remove("mobile-nav-active");
				let navbarToggle = select(".mobile-nav-toggle");
				navbarToggle.classList.toggle("bi-list");
				navbarToggle.classList.toggle("bi-x");
			}
			const element = select(hash);
			if (element) {
				element.scrollIntoView({
					behavior: "smooth",
					block: "start",
					inline: "nearest",
				});
			}
		}
	};

	useEffect(() => {

		----

		----
		const navbarlinksActive = () => {
			let position = window.scrollY + 200;
			let navbarlinks = select("#navbar .scrollTo", true);
			navbarlinks.forEach((navbarlink) => {
				if (!navbarlink.hash) return;
				let section = select(navbarlink.hash);
				if (!section) return;
				if (position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
					navbarlink.classList.add("active");
				} else {
					navbarlink.classList.remove("active");
				}
			});
		};

		----

		----
		const toggleBacktotop = () => {
			let backtotop = select(".back-to-top");
			if (backtotop) {
				if (window.scrollY > 100) {
					backtotop.classList.add("active");
				} else {
					backtotop.classList.remove("active");
				}
			}
		};

		const events = [
			{target: window, type: "load", listener: navbarlinksActive},
			{target: window, type: "load", listener: toggleBacktotop},
			{target: window, type: "scroll", listener: navbarlinksActive},
			{target: window, type: "scroll", listener: toggleBacktotop},
		];

		events.forEach(({target, type, listener}) => {
			target.addEventListener(type, listener);
		});

		return () => {
			events.forEach(({target, type, listener}) => {
				target.removeEventListener(type, listener);
			});
		};
	}, []);

	return onNavItemClick;
};


----

----
const Header = () => {
	const navToggleRef = useRef(null);
	const sideNavRef = useRef(null);
	const onMobileNavToggleClick = useNavToggle(navToggleRef, sideNavRef);
	const onNavItemClick = useSmoothScroll();

	return (
		<>
			<i ref={navToggleRef} className="bi bi-list mobile-nav-toggle d-xl-none" onClick={onMobileNavToggleClick}></i>
			<header id="header" ref={sideNavRef}>
				<div className="d-flex flex-column">
					<div className="profile">
						<img src={Image} className="img-fluid rounded-circle" alt="Profile" />
						<h1 className="text-light">
							<a href="/">JUNGHO MUN</a>
						</h1>
						<div className="social-links mt-3 text-center">
							{socialLinks.map((socialItem) => (
								<a key={socialItem.id} href={socialItem.url} className={socialItem.name.toLowerCase()}>
                  <i className={`${socialItem.icon} text-hover`}></i>
								</a>
							))}
						</div>
					</div>
					<nav id="navbar" className="nav-menu navbar">
						<ul>
							{navLinks.map((navItem) => (
								<li key={navItem.id}>
									<a href={navItem.url} className={'nav-link scrollTo text-hover ${ window.location.hash === navItem.url ? "active" : "" }'} onClick={(e) => onNavItemClick(e, navItem.url)}>
										<i className={navItem.icon}></i>
										<span>{navItem.name}</span>
									</a>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</header>
		</>
	);
};

export default Header;
 */