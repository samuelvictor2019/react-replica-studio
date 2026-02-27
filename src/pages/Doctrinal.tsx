import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import doctrinalHero from "@/assets/doctrinal_hero.jpg";
// posture image removed — no longer used

const Doctrinal = () => {
	const sections = [
		{ id: 'item-1', title: 'On the Person of Jesus', text: 'There is only one true God, Who is revealed in three persons: Father, Son, and Holy Spirit. Jesus Christ is the Word (Logos) of God. The Word was with God in the beginning, and the Word was God. The Scriptures teach that Jesus is both fully God and fully man. Jesus Christ, Who pre-existed with God in the form of God, emptied Himself to become fully a man that He might be the propitiatory sacrifice for the sins of mankind. Through His propitiatory sacrifice made on the cross, all who believe in Him and His sacrifice have their sins remitted and are restored to fellowship with God.' },
		{ id: 'item-2', title: 'On Man', text: 'Man was made in the image of God; he sinned and needs redemption through Christ.' },
		{ id: 'item-3', title: 'On the Atonement and the New Birth', text: 'The atonement of Christ provides salvation; the new birth is necessary to enter the kingdom of God.' },
		{ id: 'item-4', title: 'On the Purpose of Faith', text: 'Faith restores relationship with God and activates His promises in our lives.' },
		{ id: 'item-5', title: 'On the Authority of Scripture', text: 'The Scriptures are the final authority in all matters of faith and practice.' },
		{ id: 'item-6', title: "On the Lord's Supper", text: "The Lord's Supper is an ordinance of remembrance and proclamation of Christ's death until He returns." },
		{ id: 'item-7', title: 'On Water Baptism', text: 'Water baptism is an outward testimony of an inward change.' },
		{ id: 'item-8', title: 'On the Baptism of the Holy Spirit', text: 'The baptism of the Spirit equips believers for service and empowers spiritual gifts.' },
		{ id: 'item-9', title: 'On the Present Ministry of the Holy Spirit', text: 'The Holy Spirit convicts, regenerates, and empowers believers.' },
		{ id: 'item-10', title: 'On Community Transformation', text: 'The church is called to transform communities through service and gospel witness.' },
		{ id: 'item-11', title: 'On the Second Coming of Christ', text: 'Christ will return bodily to judge the living and the dead and to establish His eternal kingdom.' },
	];
	const [activeIndex, setActiveIndex] = useState(0);
	const pct = sections.length > 1 ? (activeIndex / (sections.length - 1)) * 100 : 0;

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			{/* Hero */}
			<section className="relative bg-white">
				<div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
					<h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-medium leading-tight text-black hero-fade delay-1">
						A Christ-centered
						<br />
						confession of faith
					</h1>
				</div>

				<div className="w-full">
					<div className="w-full overflow-hidden group hero-fade delay-2">
						<img
							src={doctrinalHero}
							alt="Doctrinal statement hero"
							className="w-full h-[320px] md:h-[480px] lg:h-[560px] object-cover hero-kenburns transition-transform duration-700 ease-out group-hover:scale-105"
						/>
					</div>
				</div>
			</section>

			{/* Doctrinal Statements: left nav + progress track + content */}
			<section className="py-16 md:py-20 bg-white">
				<div className="container max-w-6xl mx-auto px-4">
				
					<div className="grid grid-cols-1 md:grid-cols-[260px_36px_1fr] gap-8">
						{/* Left nav */}
						<nav className="hidden md:block">
							<ul className="space-y-3 text-sm text-black/70">
								{sections.map((s, i) => (
									<li key={s.id}>
										<a
											href={`#${s.id}`}
											className={`block ${i === activeIndex ? 'text-blue-600 font-medium' : 'hover:underline'}`}
											onClick={(e) => { e.preventDefault(); setActiveIndex(i); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
										>
											{i + 1}. {s.title}
										</a>
									</li>
								))}
							</ul>
						</nav>

						{/* Progress track */}
						<div className="hidden md:flex items-start justify-center">
							<div className="relative h-full w-1 flex items-center">
								<div className="absolute left-1/2 transform -translate-x-1/2 h-full w-[2px] bg-border rounded" />
								<div
									className="absolute left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-blue-600 shadow-lg transition-top duration-300"
									style={{ top: `${pct}%`, transform: `translate(-50%, -50%)` }}
								/>
							</div>
						</div>

						{/* Content */}
						<div className="relative">
							<style>{`
								summary::-webkit-details-marker { display: none; }
								summary::marker { display: none; }
								details summary { list-style: none; }
								details[open] .icon { transform: rotate(180deg); }
								.details-summary { display:flex; align-items:center; justify-content:space-between; cursor:pointer; }
								.details-body { margin-top:0.75rem; }
							`}</style>
								{sections.map((s, i) => (
									<section id={s.id} key={s.id} className="mb-6">
										{s.id === 'posture' ? (
											<article>
												<h2 className="font-heading text-3xl md:text-4xl font-medium text-black mb-4">{s.title}</h2>
												<p className="text-sm text-black/70 leading-relaxed max-w-2xl">{s.text}</p>
												<div className="mt-6 bg-white rounded-lg p-6 shadow-md inline-block">
													<div className="relative">
														<div className="text-7xl text-black/8 absolute -left-6 -top-8 select-none">“</div>
														<p className="text-sm italic text-black/80 relative z-10">The goal of our instruction is love, from a pure heart and a sincere faith.</p>
														<p className="text-xs text-black/70 mt-4 relative z-10">1 Timothy 1:5</p>
													</div>
												</div>
												{/* Full-bleed posture image (flows to right edge) */}
												<div className="mt-6">
													<div className="overflow-hidden rounded-[18px] md:rounded-[20px] md:ml-[296px]">
														{/* <img
															src={postureThumb}
															alt="Doctrinal posture"
															className="block w-full md:w-[calc(100vw-296px)] h-56 md:h-64 lg:h-72 object-cover hero-kenburns"
														/> */}
													</div>
												</div>
											</article>
										) : (
											<details className="bg-background/50 rounded-lg p-4" open={i === activeIndex} onToggle={(e) => e.currentTarget.open && setActiveIndex(i)}>
												<summary className="details-summary">
													<span className="font-heading text-lg text-black/90">{s.title}</span>
													<span className="icon transition-transform duration-200 text-black/60">
														<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
															<path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
														</svg>
													</span>
												</summary>
												<div className="details-body">
													<p className="text-sm text-black/70">{s.text}</p>
												</div>
											</details>
										)}
									</section>
								))}
						</div>
					</div>
				</div>
			</section>



			<Footer />
		</div>
	);
};

export default Doctrinal;

