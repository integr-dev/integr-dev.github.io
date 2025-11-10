import './App.css'
import NavBar from "./assets/NavBar.tsx";
import {useState} from "react";
import RepoCard from "./assets/RepoCard.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faCompass,
    faCheckCircle,
    faCircleQuestion,
    faUpRightFromSquare,
    faWarning, faContactCard, faCode, faCopy, faCheck, faArrowUp
} from "@fortawesome/free-solid-svg-icons";
import {Projects} from "./assets/Data.tsx";
import HeroMainText from "./assets/HeroMainText.tsx";
import Section from "./assets/Section.tsx";
import {MainAnimationDecorator} from "./assets/MainAnimationDecorator.tsx";

export interface ProjectWrapper {
    name: string
    description: string
    projectUrl: string
    readme: string
}

function App() {
    const projects = Projects
    const [search, setSearch] = useState("")

    const shouldShow = (repo: ProjectWrapper) => {
        const hasName = (repo.name as string).toLowerCase().includes(search.toLowerCase())
        const hasDescription = (repo.description != null) ? (repo.description as string).toLowerCase().includes(search.toLowerCase()) : false
        return hasName || hasDescription
    }

    return (
        <>
            <NavBar searchCallback={setSearch}/>

            <HeroElement search={search}/>
            <TechnologiesElement search={search}/>
            <TimelineElement search={search}/>
            <ContactElement search={search}/>
            <CvElement search={search}/>

            <div className="min-h-[100vh] back-grid flex flex-col items-center bg-repeat point_back content-wrap" id="projects">
                <div className="mt-20 flex flex-col items-center w-[100%]">
                    {projects.map((repo: ProjectWrapper, index: number) => <RepoCard repo={repo} key={index}
                                                                                  visible={shouldShow(repo)}/>)}
                </div>
            </div>


            <FooterRenderer/>
        </>
    )
}

interface Props {
    search: string
}

declare global {
    interface Window {
        _particles?: Array<{
            sx: number;
            sy: number;
            x: number;
            y: number;
            vx: number;
            vy: number;
            trail: Array<{ x: number; y: number; alpha: number }>;
        }>;
    }
}

const renderFunc = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const cssVariable = getComputedStyle(document.documentElement).getPropertyValue('--p').trim();

    if (!window._particles) {
        window._particles = [];

        const numParticles = 100;

        while (window._particles!.length < numParticles) {
            const sx = Math.random() * width;
            const sy = Math.random() * height;

            window._particles!.push({
                x: sx,
                y: sy,
                sx: sx,
                sy: sy,
                vx: (0.15 + Math.random() * 0.1) * (width / 500),
                vy: (0.15 + Math.random() * 0.1) * (height / 500),
                trail: []
            });
        }

        window._particles.sort((a, b) => {
            const distA = Math.hypot(width - a.x, height - a.y);
            const distB = Math.hypot(width - b.x, height - b.y);
            return distB - distA;
        });
    }

    const particles = window._particles;

    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        p.trail.push({ x: p.x, y: p.y, alpha: 1 });
        if (p.trail.length > 60) p.trail.shift();

        p.trail.forEach(point => {
            point.alpha *= 0.96;
        });

        for (let i = 0; i < p.trail.length - 1; i++) {
            const a = p.trail[i];
            const b = p.trail[i + 1];
            ctx.strokeStyle = `oklch(${cssVariable} / ${a.alpha * 0.2})`;

            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `oklch(${cssVariable} / 0.4)`;
        ctx.fill();

        if (p.x > width + 20 || p.y > height + 20) {
            const { x, y } = getRandomXToRespawn(width, height);
            p.x = x;
            p.y = y;
            p.vx = (0.15 + Math.random() * 0.1) * (width / 500);
            p.vy = (0.15 + Math.random() * 0.1) * (height / 500);
            p.trail = [];
        }
    });
}

function getRandomXToRespawn(width: number, height: number): { x: number, y: number } {
    let currX = Math.random() * width;
    let currY = Math.random() * height;

    while (currY > height * 0.2 && currX > width * 0.2 || currX > width * 0.2 && currY > height * 0.2) {
        currY = Math.random() * height;
        currX = Math.random() * width;
    }

    return { x: currX, y: currY };
}

function HeroElement(props: Props) {
    if (props.search === "") {
        return (
            <>
                <div className="hero back-grid min-h-sc reen">
                    <MainAnimationDecorator renderFunction={renderFunc}/>
                    <div className="hero-content text-center">
                        <div className="max-w-md flex flex-col items-center justify-center">
                            <div className="mb-10 avatar">
                                <div className="w-20 rounded-full avtr">
                                    <img src="https://avatars.githubusercontent.com/u/74710895" alt="Profile Picture"
                                         className="rounded-full w-20"/>
                                </div>
                            </div>

                            <h1 className="text-5xl font-bold">Hey there, i'm</h1>

                            <HeroMainText/>
                            <p className="py-6">
                                I'm a <strong className="text-primary">{renderAge()}</strong> year old software
                                developer
                                from <strong className="text-primary">Austria</strong>.
                                I'm passionate about open
                                source and I love to build new things. I'm also a huge fan of the <strong
                                className="text-primary">Kotlin</strong> language.
                            </p>

                            <div>
                                <button className="btn btn-ghost mr-2" onClick={() => {
                                    scrollToElementWithOffset("projects")
                                }}><FontAwesomeIcon icon={faCode}/>Projects
                                </button>

                                <button className="btn btn-primary mx-2" onClick={() => {
                                    scrollToElementWithOffset("technologies")
                                }}><FontAwesomeIcon icon={faCompass}/>Explore
                                </button>

                                <button className="btn btn-ghost ml-2" onClick={() => {
                                    scrollToElementWithOffset("contact")
                                }}><FontAwesomeIcon icon={faContactCard}/>Contact
                                </button>
                            </div>


                        </div>

                    </div>

                    <div className="flex flex-col h-screen justify-end">
                        <FontAwesomeIcon icon={faChevronDown} bounce className="mb-10"/>
                    </div>
                </div>
            </>

        )
    } else return (<></>)
}

function scrollToElementWithOffset(elementId: string) {
    const element = document.getElementById(elementId);
    const offsetElement = document.getElementById("navbar_anchor");
    const offsetHeight = offsetElement?.offsetHeight || 0;

    if (element) {
        const elementPosition = element.offsetTop;
        requestAnimationFrame(() => {
            window.scrollTo({
                top: elementPosition - offsetHeight,
                behavior: "smooth",
            });
        });
    }
}

function renderAge() {
    // Calculate age from 27.5.2009
    const birthday = new Date(2009, 4, 27);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }
    return <strong className="text-primary">{age}</strong>;
}

function TechnologiesElement(props: Props) {
    if (props.search === "") {
        return (
            <div className="hero min-h-[600px] bg-base-100" id="technologies">
                <Section className="hero-content text-center">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl font-bold">Technologies</h1>
                        <span className="badge badge-primary">Hover</span>

                        <p className="py-6">
                            Below is a selection of languages and tools that I have experience with.
                            The skill level per technology may vary. The list only contains items that i have a basic understanding of.
                        </p>

                        <p className="pb-6 text-error">
                            <FontAwesomeIcon icon={faWarning} className="mr-2" size="xs"/>
                            The icons shown below are not an indication of my skill level with the respective technology and
                            only give a rough overview of what I have worked with.
                        </p>

                        <div className="flex justify-center flex-col">
                            <div>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kotlin/kotlin-original.svg"} alt={"Kotlin"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg"} alt={"Java"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/gradle/gradle-original.svg"} alt={"Gradle"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jetpackcompose/jetpackcompose-original.svg"} alt={"Jetpack Compose"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg"} alt={"Spring"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg"} alt={"C#"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg"} alt={"Python"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg"} alt={"JavaScript"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg"} alt={"TypeScript"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg"} alt={"HTML"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg"} alt={"CSS"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg"} alt={"React"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg"} alt={"Vue"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nuxt/nuxt-original.svg"} alt={"Nuxt"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg"} alt={"Vite"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original-wordmark.svg"} alt={"Mongo"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg"} alt={"MySQL"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg"} alt={"Git"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-plain.svg"} alt={"Docker"} />
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/opengl/opengl-plain.svg"} alt={"OpenGL"}/>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
        )
    } else return (<></>)
}

function ToolImage(props: { img: string, alt: string }) {
    return (
        <div className="tooltip tooltip-bottom hover:scale-110 hover:bg-base-200 rounded-xl hover:z-20"
             data-tip={props.alt}>
            <img src={props.img} className="w-10 m-2" alt={props.alt}/>
        </div>
    )
}

function ContactElement(props: Props) {
    const [copied, setCopied] = useState(false);

    if (props.search === "") {
        return (
            <div className="hero min-h-[600px] bg-base-100" id="contact">
                <Section className="hero-content text-center">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl font-bold">Contact</h1>

                        <p className="py-6">
                            Have any questions or want to get in touch? Feel free to reach out to me via email.
                            Let's connect and discuss how we can collaborate or share ideas!
                        </p>

                        <div className="flex justify-center">
                            <button className="btn btn-primary m-2 w-32"
                                    onClick={() => window.open("mailto:hello@integr.cloud?subject=Contact&body=Hello!", "_blank")}>
                                <FontAwesomeIcon icon={faUpRightFromSquare}/>Send Email
                            </button>
                            <button className="btn btn-ghost m-2 w-32"
                                    onClick={() => navigator.clipboard.writeText("hello@integr.cloud").then(() => setCopied(true))}>
                                <FontAwesomeIcon icon={copied ? faCheck : faCopy}/>{copied ? "Copied" : "Copy Email"}
                            </button>

                        </div>


                    </div>
                </Section>
            </div>
        )
    } else return (<></>)
}

function TimelineElement(props: Props) {
    if (props.search === "") {
        return (
            <div className="hero min-h-[600px] bg-base-200" id="timeline">
                <Section className="hero-content text-center w-full">
                    <div className="w-full max-w-2xl">
                        <h1 className="text-5xl font-bold mb-10 mt-32 w-full">Timeline</h1>
                        <p className="py-6">
                            A rough overview of my development journey so far.
                            Please note that the timeline is not complete and only contains the most important and noteworthy
                            events that have shaped my journey as a developer.
                        </p>
                        <ul className="timeline timeline-compact timeline-snap-icon timeline-vertical justify-center max-w-2xl">
                            <li>
                                <FontAwesomeIcon icon={faCheckCircle} className="timeline-middle text-primary m-1"></FontAwesomeIcon>

                                <Section className="timeline-end ml-10 mb-10 text-start">
                                    <time className="font-mono">2021</time>
                                    <div className="text-lg font-black">Java</div>
                                    My coding journey started in 2021 with Java. I learned the basics of programming and
                                    object-oriented programming. I created small projects and learned how to use
                                    libraries and frameworks. Although I don't use Java much anymore, I am still grateful for the
                                    knowledge I gained from it.
                                </Section>
                                <hr className="bg-primary"/>
                            </li>
                            <li>
                                <hr className="bg-primary"/>
                                <FontAwesomeIcon icon={faCheckCircle} className="timeline-middle text-primary m-1"></FontAwesomeIcon>

                                <Section className="timeline-end ml-10 mb-10 text-start">
                                    <time className="font-mono">2023</time>
                                    <div className="text-lg font-black">Kotlin</div>
                                    After using java for a while, I discovered Kotlin in 2023. I was amazed by its
                                    simplicity and power. I started using it for my projects and quickly fell in love with it. I have been
                                    using it ever since and have been excited to learn even the most advanced features of the language.
                                </Section>
                                <hr className="bg-primary"/>
                            </li>
                            <li>
                                <hr className="bg-primary"/>
                                <FontAwesomeIcon icon={faCheckCircle}
                                                 className="timeline-middle text-primary m-1"></FontAwesomeIcon>

                                <Section className="timeline-end ml-10 mb-10 text-start">
                                    <time className="font-mono">2024</time>
                                    <div className="text-lg font-black">Spring & Vue</div>
                                    After using Kotlin, the next logical step was to learn some form of backend and frontend
                                    framework. In 2024, I started learning Spring and also discovered Vue.
                                    I have been using both frameworks for some time and have created several projects with them.
                                </Section>
                                <hr className="bg-primary"/>
                            </li>
                            <li>
                                <hr className="bg-primary"/>
                                <FontAwesomeIcon icon={faCheckCircle} className="timeline-middle text-primary m-1"></FontAwesomeIcon>

                                <Section className="timeline-end ml-10 mb-10 text-start">
                                    <time className="font-mono">2025</time>
                                    <div className="text-lg font-black">Internship at Cloudflight Austria GmbH</div>
                                    In 2025 I had the opportunity to do an internship at Cloudflight Austria GmbH.
                                    I had the chance to work on real-world projects and learn from experienced developers. It was a
                                    great experience and I learned a lot.
                                </Section>
                                <hr/>
                            </li>
                            <li>
                                <hr/>
                                <FontAwesomeIcon icon={faCircleQuestion} className="timeline-middle m-1"></FontAwesomeIcon>

                                <Section className="timeline-end ml-10 mb-10 text-start">
                                    <time className="font-mono">...</time>
                                    <div className="text-lg font-black">Next up</div>
                                    I am excited to see what the future holds for me. I am always looking for new
                                    technologies to learn and new projects to work on.
                                </Section>
                            </li>
                        </ul>
                    </div>
                </Section>
            </div>
        )
    } else return (<></>)
}

function CvElement(props: Props) {
    if (props.search === "") {
        return (
            <div className="hero min-h-[600px] bg-base-200" id="favourites">
                <Section className="hero-content text-center">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl font-bold">Files</h1>
                        <span className="badge badge-primary">Download</span>

                        <p className="py-6">
                            Find information about my education, skills, and experience in my CV.
                            If you would like to receive a copy, please contact me via email.
                            Also let me know if there is any specific information you would like to see included.
                        </p>

                        <p className="pb-6 text-error">
                            <FontAwesomeIcon icon={faWarning} className="mr-2" size="xs"/>
                            Due to various privacy reasons, there is no download here yet, as i am still under 18.
                        </p>

                        <button className="btn btn-primary w-30 m-2"
                                onClick={() => scrollToElementWithOffset("contact")}>
                            <FontAwesomeIcon icon={faArrowUp}/>Contact
                        </button>
                    </div>
                </Section>
            </div>
        )
    } else return (<></>)
}

function FooterRenderer() {
    return (
        <footer className="footer footer-center bg-base-200 p-10">
            <aside>
                <svg
                    width="50"
                    height="50"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    className="inline-block fill-current">
                    <path
                        d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z"></path>
                </svg>
                <p className="font-bold">
                    Integr - Erik Reitbauer
                </p>
                <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
            </aside>
        </footer>
    )
}

export default App
