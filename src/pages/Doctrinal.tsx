import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import doctrinalHero from "@/assets/doctrinal_hero1.jpg";
import postureHero from "@/assets/doctrinal1.jpg";
// posture image removed — no longer used

const Doctrinal = () => {
	const sections = [
		{ id: 'item-1', title: 'On the Person of Jesus', text: 'There is only one true God, Who is revealed in three persons: Father, Son, and Holy Spirit. Jesus Christ is the Word (Logos) of God. The Word was with God in the beginning, which states His pre-existence as one with God. “By Him all things were created, both in the heavens and on earth” (Colossians 1:16), therefore making Jesus the Creator. Jesus Christ is the Purpose of God found in all of creation. He is the Father’s delight and desire, and the Father is looking for the reflection of His Son in all created things. Jesus is the Alpha and the Omega, the Beginning and the End. In the beginning, it was the ultimate purpose of God for all things to be summed up in Christ (Ephesians 1:10).Jesus Christ, Who pre-existed with God in the form of God, emptied Himself to become fully a man that He might be the propitiatory sacrifice for the sins of mankind. Through His propitiatory sacrifice made on the cross, all who believe in Him and His sacrifice have their sins remitted and are restored to the fellowship with God lost by man’s transgression. Jesus was born of a virgin, by the seed of the Holy Spirit. His virgin birth is a testimony that only the Spirit can beget that which is Spirit. Those of the new creation are not solely of human origin, but are born from above by the Holy Spirit. The resurrection of Jesus’ physical body after His crucifixion was literal, as will be the resurrection of both the just and the unjust on the Day of Judgment. In essence, we believe the Lord Jesus Christ to be the only Savior of all men, conceived by the Holy Spirit, born of the Virgin Mary, very (fully) God and very (fully) man. Jesus died for our sins, was buried, and rose again according to the Scriptures. He personally appeared in His new body to His disciples before ascending to His seat at the right hand of the Majesty in the heavens. Jesus’ finished work (His death, burial, resurrection, and ascension) reversed the curse concerning the spirit, soul, and body of the first man Adam. He is the only Way to the Father, the only valid Door and entry into the realm of Spirit (Gen. 3:15; Isa. 7:14; Matt. 1:18-25; John 10:1; 14:6; Acts 4:12; 1 Cor. 15:3-8; Gal. 3:13-14; 1 Tim. 3:16; Heb. 4:14-16; 8:1-6; 10:12-13). “There is one God and one mediator also between God and men, the man Christ Jesus” (I Timothy 2:5). All who seek restoration and fellowship with God must go through Jesus and cannot approach God through any person, spirit or doctrine. It is also a supreme presumption for any person or institution to seek to be mediator for others in place of Christ Jesus Himself. The apostolic commission was for His followers to labor until Christ was formed in His church, to present every person complete in Christ, and to manifest the sweet aroma of the knowledge of Him in every place. When Jesus is lifted up, He will draw all people to Himself. We consider it the primary purpose of the church to esteem and exalt Jesus in every way. It is the focus and devotion of The Water Gate Church to know and preach Him, and not ourselves. We pray for the grace to continually respond to His call to return to our first Love, that we might passionately devote ourselves to pleasing Him in all things while preparing for His return.' },
		{ id: 'item-2', title: 'On Man', text: 'We believe that man was created by God from the dust of the earth, without sin or the knowledge of good and evil. The first man, Adam, transgressed the command of God, and as God had warned, the process of death entered him and all of his descendants because of that transgression. Therefore, all have sinned and are worthy of the sentence of death. Because of our unrighteousness, we are unable to approach a holy God, except through the atoning sacrifice of Jesus. Through Jesus, we not only can come before the Throne of Grace, but we may approach it boldly since our confidence is not in ourselves, but in the Lord Jesus. (Gen 3:1-24; Gen 6:5; Rom 3:23; Rom 5:12; John 3:3; John 3:16; Heb 4:16).' },
		{ id: 'item-3', title: 'On the Atonement and the New Birth', text: 'Because all have sinned and are therefore under the sentence of death, all must trust in the atoning sacrifice of Jesus for the remission of sins. There is no other way to reconcile with God or escape from eternal judgment, except through the propitiatory sacrifice of Jesus. Those who trust in Jesus Christ have access to the Throne of Grace by His sacrifice and by His sacrifice alone. Good works are acceptable to God only as a love offering given to Him because of His worthiness, and have no bearing on our acceptance, standing or approval, all of which were accomplished by the cross. Good works offered for the purpose of acceptance, standing or approvals are therefore an affront to the cross by which all of these things were gained for us by Jesus. Good works are not offered for His approval, but for His joy and glory, and must be offered through the Son (I Peter 2:5) in obedience to Him. Therefore, the goal of our service is obedience and not sacrifices. We know that believing in our hearts that Jesus is the Son of God and in His propitiation made for our salvation results in a regeneration and renewal that constitutes our new birth into new creations. Although this does not imply immediate perfection in our temporal life or lifestyle, it does mean that true faith will result in a radical change in us. Being “born again” implies a new beginning, not an ending. Christian maturity in faith, truth and life is a process. Even so, this process must begin with spiritual regeneration or new birth. While it is possible to change our behavior without regeneration, changing our hearts requires the new birth, and it is our hearts upon which God looks (John 1:29; 3:1-8; 17:4; 19:30; Acts 13:38-39; Rom. 5:1-2; Eph. 2:8-9; Rev. 13:8).' },
		{ id: 'item-4', title: 'On the Purpose of Faith', text: 'True faith is of the heart and not just the mind (Romans 10:10). God’s purpose in requiring faith for salvation is to raise our focus and concentration above the temporal to the One who is eternal. Therefore, the gospel that is able to save souls must be preached in the power of the Spirit of God. The gospel is not dependent upon human eloquence or persuasion that may change minds, but cannot change hearts. Only the Spirit of God can reveal the Son of God, and only the Son of God can reveal the Father (1Cor. 2:4-5; Gal. 1:15-17; 3:10-11; James 2:17-26).' },
		{ id: 'item-5', title: 'On the Authority of Scripture', text: 'We believe in the Divine inspiration and authority of the 66 books of the Holy Bible as the complete canon of God’s testimony to mankind. We are committed to esteeming Scripture as the very Word of God, inerrant in its original form. We do not accept any doctrine which contradicts Scripture. We understand that there are many practices and doctrines that are considered orthodox which do not contradict the Scripture, but which are not directly addressed in His Word. We are committed to giving liberty in the belief and practice of these teachings, but we will endeavor to maintain the simplicity of the biblical testimony and its stated practices as we are given grace to perceive them. We do not accept any spiritual experience as having its source in the Holy Spirit that does not have a precedent in Scripture. We do not accept any revelation, vision, dream, prophecy or discernment as truth which contradicts Scripture, or cannot be verified by it. We do not believe that any other writings have the same authority as the canon of Scripture (Psa. 45:1; Ezek. 1:3; Matt. 24:35; Luke 24:27; Rom. 15:4; 1 Cor. 10:11; 1 Thess. 2:13; 2 Tim. 3:16; 2 Pet. 1:21).' },
		{ id: 'item-6', title: "On the Lord's Supper", text: "We acknowledge the ordinance of the Lord’s Supper in remembrance of Jesus and as a testimony of our communion (common-union) with Him in His body, the church. We consider it a holy ordinance, but we do not accept the teaching that communion is for the purpose of remitting sins, which Scripture testifies is based solely in the sacrifice of Jesus on the cross (Hebrews 9:25-28; Matt. 26:26-28; Mark 14:22-24; Luke 22:17-20; 1 Cor. 10:16-17; 11:23-30)." },
		{ id: 'item-7', title: 'On Water Baptism', text: 'We believe that water baptism should be by immersion and accomplished immediately after commitment to the Lordship of Jesus and His atoning sacrifice for our sin. This ordinance is a personal and public statement of faith in the death, burial and resurrection of Jesus Christ on our behalf, and is a commitment to lay down our lives to be one with Him in His death, burial and resurrection (Mark 16:16; Acts 2:38; Rom. 2:28; 6:1-14; Col. 2:11-12; 1 John 5:8).' },
		{ id: 'item-8', title: 'On the Baptism of the Holy Spirit', text: 'We believe that the “baptism in the Holy Spirit” is an additional impartation which may be subsequent to regeneration (see Acts 8:15-17 and 19:1-6). This baptism is usually accompanied by the gifts of the Spirit, such as speaking in tongues, prophecy, etc. We believe that this gift is presently available to all who believe (Acts 2:38-39), but is not essential for salvation or regeneration. While these are accomplished by the Holy Spirit (Acts 19:1-7), there were disciples who did not even know that there was a Holy Spirit. Just as Paul made it a priority to instruct those believers and pray for them to receive this gift, we are committed to doing the same. The purpose of the baptism in the Holy Spirit is to impart spiritual power to the believer to be a witness (Acts 1:8, 5:32). This baptism is to be distinguished from being filled with the Spirit (Acts 4:31, 7:55, 13:-9, 52), which can be a special and repeated empowering for specific purposes. We believe that when Christians truly have been baptized with the Holy Spirit, they should begin to take on His nature and fruit, becoming “helpers” and “comforters”, leading others into truth, and testifying of Jesus(Mark 16:17; Acts 1:4-8; 2:1-4; 10:44-46; 19:6; Gal. 3:14-15; 4:6; Eph. 5:17-18; Col. 1:27; and Ex. 19:1 with Lev. 23:15-22 Rom. 8:28-29; 2 Cor. 3:18; Gal. 5:22-23; 2 Pet. 1:3-4; 1 John 3:1-3).' },
		{ id: 'item-9', title: 'On the Present Ministry of the Holy Spirit', text: 'We believe that “Jesus Christ is the same yesterday and today and forever” (Hebrews 13:8) and that His ministry in and through the church by the Holy Spirit has not changed from the beginning. We accept, acknowledge, encourage and seek all of the biblical gifts and ministries of the Holy Spirit as present and vital for the church to accomplish her full purpose today. We believe that the gifts or manifestations of the Holy Spirit are the supernatural ministry of the Lord Jesus Christ, and that every member of the Body of Christ should flow in several of them. New Testament ministry is the outflowing of the indwelling Christ. The Church is called to a spiritual ministry of speaking, knowing, and doing. These nine manifestations enable us to talk like God, think like God, and do the works of God (Mark 16:15-20; Acts 1:8; 4:7-10, 29-31; 5:12; 8:5-13; 10:38; Rom. 12:4-8; 1 Cor. 4:20; 12:8-10; 14:1-40; Heb. 2:3-4; 1 Pet. 4:10-11).' },
		{ id: 'item-10', title: 'On Community Transformation', text: 'We believe that through the guidance of the Holy Spirit, the local church is to be the vehicle through which God ministers His life and love to many of the spiritual, social, and economic ills of society, The Church is to be salt and light, a therapeutic witness to a sick world, releasing the resurrection life of Jesus. We are called to set the captive free. We believe that the Kingdom of God is a present reality and will expand until the knowledge of His Lordship covers the earth, The Government of God is the purpose of God; it is the extension of His rule and dominion in the earth and the universe. The Church, universal and local, mystical and tangible, invisible and visible, is the instrument through which that purpose is to be realized (Gen. 1:26-28; Dan. 2:44-45; 7:27; Is. 2:2-4; Hab. 2:14; Mi. 4:1-3; Matt. 5:13-16; Mark 1:14-15; Rom 14:17; Eph. 3:21; Heb. 12:25-29; Rev. 1:6; 5:10; 11:15; 19:1-6).' },
		{ id: 'item-11', title: 'On the Second Coming of Christ', text: 'We believe in the literal, physical return of the Lord Jesus Christ to take authority and rule on earth. We believe that those who are alive and remain at the return of our Lord will be changed and caught up to be with Him in the air. Those who have died in the faith will be resurrected and precede those who are alive in being changed and caught up to be with Him. We believe in the literal, physical resurrection of both the just and the unjust for the Day of Judgment. For those of us who have been justified by faith in Jesus Christ and His sacrifice on our behalf, this resurrection is for eternal life in fellowship with God. Those who are not justified by faith in Jesus are resurrected for an eternal judgment. We believe that the Father has given the earth to the children of men. The earth is the Lord’s; it belongs to Jesus and His Church, not the devil. The meek shall inherit the earth. As kings and priests, we shall reign on the earth. Heaven is the realm of God, and God is omnipresent Spirit; Heaven is nearer than men think. Therefore, we believe in the coming of the Lord, not the going of the saints; in the appearing of the Lord, not the disappearing of the saints. Throughout the Scriptures, God comes to dwell with man. Jesus is coming now (in Spirit) to be glorified “in” the saints; He will come (literally) “with” the saints once His enemies are made His footstool, once He has received the early and latter rains, once we have come to the unity disclosed in John 17 and Ephesians 4, and once He has restored all things spoken by all His holy prophets since the world began. His coming is not “any minute” but “until” (a word denoting time) – no man knows that day or hour (Gen. 28:10-17; Psa. 24:1; 37:3, 9, 11, 22, 29, 34; 110:1-6; 115:16; Matt. 5:5; 6:10; 24:36; John 1:51; 3:13; Acts 3:18-24; Eph. 4:13; 1 Thess. 4:13-18; 2 Thess. 1:6-10; Heb. 10:12-13; Jas. 5:7; Rev. 1:6; 5:10; 21:1-11).' },
	];
	const [activeIndex, setActiveIndex] = useState(0);
	const pct = sections.length > 1 ? (activeIndex / (sections.length - 1)) * 100 : 0;

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			{/* Hero */}
			<section className="relative bg-white">
				<div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
					<h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-medium leading-tight text-black hero-fade delay-1">
						A Christ-centered
						<br />
						confession of faith
					</h1>
				</div>

				<div className="w-full">
					<div className="w-full">
						<img src={doctrinalHero} alt="Doctrinal hero" className="w-full h-auto object-contain hero-fade delay-2" />
					</div>
				</div>
			</section>

			{/* Posture preview (below hero) */}
			<section className="py-12 md:py-16 bg-white">
				<div className="container max-w-6xl mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
						<div>
							<h2 className="font-heading text-3xl md:text-4xl font-medium text-black mb-4">Our Posture</h2>
							<div className="space-y-4 text-sm leading-relaxed text-black/70">
								<p>
									We distinguish between essential doctrines and non-essential doctrines.
								</p>
								<p>
									While we are committed to truth and accuracy in doctrine, we also uphold love, humility, and unity as essential Christian character.
								</p>
							</div>
						</div>

						<div>
							<div className="mt-2 md:mt-0 bg-white rounded-lg p-6 inline-block">
								<div className="relative">
														<div className="text-7xl text-sky-100 absolute -left-6 -top-8 select-none">“</div>
									<p className="text-sm italic text-black/80 relative z-10">The goal of our instruction is love, from a pure heart and a sincere faith.</p>
									<p className="text-xs text-black/70 mt-4 relative z-10">1 Timothy 1:5</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Full-bleed posture image (flows to right edge) */}
			<div className="ml-4 md:ml-[calc((100vw-64rem)/2+296px+2rem)]">
				<div className="overflow-hidden rounded-l-[18px] md:rounded-l-[20px]">
					<img
						src={postureHero}
						alt="Doctrinal posture"
						className="block w-full h-56 md:h-64 lg:h-72 object-cover hero-kenburns"
					/>
				</div>
			</div>

			{/* Doctrinal Statements: left nav + progress track + content */}
			<section className="py-16 md:py-20 bg-white">
				<div className="container max-w-6xl mx-auto px-4">
				
					<div className="grid grid-cols-1 md:grid-cols-[260px_36px_1fr] gap-8">
						{/* Left nav (sticky on desktop) */}
						<nav className="hidden md:block md:sticky md:top-28 md:self-start">
							<ul className="space-y-3 text-sm text-black/70 md:max-h-[calc(100vh-7rem)] md:overflow-auto md:pr-2">
								{sections.map((s, i) => (
									<li key={s.id}>
										<a
											href={`#${s.id}`}
											className={`block ${i === activeIndex ? 'text-black font-medium' : 'text-black/70 hover:underline'}`}
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
									<section id={s.id} key={s.id} className={`mb-6 ${i !== sections.length - 1 ? 'border-b border-border pb-6' : ''}`}>
										{s.id === 'posture' ? (
											<article>
												<h2 className="font-heading text-3xl md:text-4xl font-medium text-black mb-4">{s.title}</h2>
												<p className="text-sm text-black/70 leading-relaxed max-w-2xl">{s.text}</p>
												<div className="mt-6 bg-white rounded-lg p-6 shadow-md inline-block">
													<div className="relative">
														<div className="text-7xl text-sky-100 absolute -left-6 -top-8 select-none">“</div>
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
													<span className="font-heading text-lg font-semibold text-sky-400">{s.title}</span>
													<span className="icon transition-transform duration-200 text-black/60">
														<span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 text-black/80">
															<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
																<path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
															</svg>
														</span>
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

