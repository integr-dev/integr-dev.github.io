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
    faUpRightFromSquare, faCode, faBook, faClock,
    faBoxesStacked, faFire
} from "@fortawesome/free-solid-svg-icons";
import {Repos} from "./assets/Data.tsx";
import HeroMainText from "./assets/HeroMainText.tsx";
import Section from "./assets/Section.tsx";

export interface ProjectWrapper {
    name: string
    description: string
    projectUrl: string
    readme: string
}

function App() {
    const repos = Repos
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
            <SkillsElement search={search}/>
            <LibrariesElement search={search}/>
            <Timeline search={search}/>
            <FavouritesElement search={search}/>

            <div className="back-grid flex flex-col items-center bg-repeat point_back content-wrap" id="repos">
                <div className="mt-20 flex flex-col items-center w-[100%]">
                    {repos.map((repo: ProjectWrapper, index: number) => <RepoCard repo={repo} key={index}
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

function HeroElement(props: Props) {
    if (props.search === "") {
        return (
            <>
                <div className="hero back-grid min-h-screen">
                    <div className="hero-content text-center">
                        <div className="max-w-md flex flex-col items-center justify-center">
                            <div className="mb-10 avatar online">
                                <div className="w-20 rounded-full">
                                    <img src="https://avatars.githubusercontent.com/u/74710895" alt="Profile Picture"
                                         className="rounded-full w-20"/>
                                </div>
                            </div>

                            <h1 className="text-5xl font-bold"><FontAwesomeIcon icon={faFire} className="mr-2"
                                                                                size="xs"/>Hey there, i'm</h1>

                            <HeroMainText/>
                            <p className="py-6">
                                I'm a <strong className="text-primary">{renderAge()}</strong> year old software
                                developer
                                from <strong className="text-primary">Austria</strong>.
                                I'm passionate about open
                                source and love to contribute to it's community. I'm also a huge fan of the <strong
                                className="text-primary">Kotlin</strong> language.
                            </p>

                            <button className="btn btn-primary" onClick={() => {
                                scrollToElementWithOffset("skills")
                            }}><FontAwesomeIcon icon={faCompass}/>Explore
                            </button>
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

function SkillsElement(props: Props) {
    if (props.search === "") {
        return (
            <div className="hero min-h-[600px] bg-base-100">
                <Section className="hero-content text-center" id="skills">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl font-bold"><FontAwesomeIcon icon={faCode} className="mr-2" size="xs"/>Skills</h1>
                        <span className="badge badge-primary">Hover</span>

                        <p className="py-6">
                            These are the skills that I have acquired over the years. I'm always learning new things and
                            expanding my knowledge. My main focus is backend development, but I also have experience
                            with
                            frontend development.
                        </p>


                        <div className="flex justify-center flex-col">
                            <div>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kotlin/kotlin-original.svg"} alt={"Kotlin"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg"} alt={"Java"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg"} alt={"C#"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg"} alt={"Python"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg"} alt={"JavaScript"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg"} alt={"TypeScript"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg"} alt={"HTML"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg"} alt={"CSS"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg"} alt={"React"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original-wordmark.svg"} alt={"MongoDB"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg"} alt={"MySQL"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg"} alt={"Spring"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg"} alt={"Git"}/>
                                <ToolImage img={"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg"} alt={"Vue"}/>
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

function LibrariesElement(props: Props) {
    if (props.search === "") {
        return (
            <div className="hero min-h-[600px] bg-base-200">
                <Section className="hero-content text-center" id="libraries">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl font-bold"><FontAwesomeIcon icon={faBook} className="mr-2" size="xs"/>Libraries</h1>

                        <p className="py-6">
                            I publish libraries on Maven (Sonatype) that I use in my projects. These libraries are open
                            source and free.
                            Feel free to use them in your projects. For more information, click the button below. Also,
                            you
                            can find the source code on my GitHub.
                        </p>

                        <div className="flex justify-center">
                            <button className="btn btn-primary w-28 m-2"
                                    onClick={() => window.open("https://central.sonatype.com/namespace/io.github.integr-0", "_blank")}>
                                <FontAwesomeIcon icon={faUpRightFromSquare}/>Maven
                            </button>
                            <button className="btn btn-info w-28 m-2"
                                    onClick={() => window.open("https://github.com/Integr-0", "_blank")}>
                                <FontAwesomeIcon icon={faUpRightFromSquare}/>Github
                            </button>

                        </div>


                    </div>
                </Section>
            </div>
        )
    } else return (<></>)
}

function Timeline(props: Props) {
    if (props.search === "") {
        return (
            <div className="hero min-h-[600px] bg-base-100">
                <Section className="hero-content text-center" id="timeline">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl font-bold mb-10 mt-32"><FontAwesomeIcon icon={faClock} className="mr-2" size="xs"/>Timeline</h1>

                        <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
                            <li>
                                <FontAwesomeIcon icon={faCheckCircle} className="timeline-middle text-primary m-1"></FontAwesomeIcon>

                                <Section className="timeline-start mb-10 md:text-end" id="beginnings">
                                    <time className="font-mono">2019</time>
                                    <div className="text-lg font-black">Beginnings</div>
                                    In 2019, I started my journey as a software developer. I was fascinated by technology
                                    and wanted to learn more about it. I started with python in the context of embedded programming on
                                    a Raspberry Pi. I quickly fell in love with programming and started my journey.
                                </Section>
                                <hr className="bg-primary"/>
                            </li>
                            <li>
                                <hr className="bg-primary"/>
                                <FontAwesomeIcon icon={faCheckCircle} className="timeline-middle text-primary m-1"></FontAwesomeIcon>

                                <Section className="timeline-end mb-10" id="java">
                                    <time className="font-mono">2021</time>
                                    <div className="text-lg font-black">Java</div>
                                    In 2021, I started learning Java development. Although it was a bit challenging at first, I
                                    quickly got the hang of it and started creating projects with it. I have been using Java
                                    ever since and have developed many projects that I am proud of.
                                </Section>
                                <hr className="bg-primary"/>
                            </li>
                            <li>
                                <hr className="bg-primary"/>
                                <FontAwesomeIcon icon={faCheckCircle} className="timeline-middle text-primary m-1"></FontAwesomeIcon>

                                <Section className="timeline-start mb-10" id="kotlin">
                                    <time className="font-mono">2023</time>
                                    <div className="text-lg font-black">Kotlin</div>
                                    In 2023, I first discovered Kotlin and fell in love with it. I have been using it ever since
                                    and have been contributing to its community. I have created libraries and tools for Kotlin and
                                    have been using it in my projects.
                                </Section>
                                <hr className="bg-primary"/>
                            </li>
                            <li>
                                <hr className="bg-primary"/>
                                <FontAwesomeIcon icon={faCheckCircle} className="timeline-middle text-primary m-1"></FontAwesomeIcon>

                                <Section className="timeline-end mb-10" id="spring">
                                    <time className="font-mono">2024</time>
                                    <div className="text-lg font-black">Spring & Vue</div>
                                    In 2024, I started learning Spring and Vue. I was amazed by the power of these frameworks and
                                    how they can be used to create powerful applications. I have been using them ever since and
                                    I am still enjoying their use.
                                </Section>
                                <hr />
                            </li>
                            <li>
                                <hr />
                                <FontAwesomeIcon icon={faCircleQuestion} className="timeline-middle m-1"></FontAwesomeIcon>

                                <Section className="timeline-start mb-10 md:text-end" id="end">
                                    <time className="font-mono">...</time>
                                    <div className="text-lg font-black">Next up</div>
                                    Who knows what the future holds? I'm excited to see what the next big thing will be. I'm
                                    looking forward to new technologies and innovations that will shape our world.
                                </Section>
                            </li>
                        </ul>
                    </div>
                </Section>
            </div>
        )
    } else return (<></>)
}

function FavouritesElement(props: Props) {
    if (props.search === "") {
        return (
            <div className="hero min-h-[600px] bg-base-200">
                <Section className="hero-content text-center" id="favourites">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl font-bold"><FontAwesomeIcon icon={faBoxesStacked} className="mr-2" size="xs"/>Favourite Stack</h1>

                        <p className="py-6">
                            Below you can find my favourite tech stack that I use in my projects.
                            I can only recommend the tools shown to you. They are all free or worth the price (in my opinion).
                            Many of them are open source and have a large community.
                        </p>

                        <button className="btn btn-link w-30 m-2"
                                onClick={() => window.open("https://kotlinlang.org/", "_blank")}>
                            <FontAwesomeIcon icon={faUpRightFromSquare}/>Kotlin
                        </button>

                        <button className="btn btn-link w-30 m-2"
                                onClick={() => window.open("https://gradle.org/", "_blank")}>
                            <FontAwesomeIcon icon={faUpRightFromSquare}/>Gradle
                        </button>

                        <button className="btn btn-link w-30 m-2"
                                onClick={() => window.open("https://vuejs.org/", "_blank")}>
                            <FontAwesomeIcon icon={faUpRightFromSquare}/>Vue
                        </button>

                        <button className="btn btn-link w-30 m-2"
                                onClick={() => window.open("https://daisyui.com/", "_blank")}>
                            <FontAwesomeIcon icon={faUpRightFromSquare}/>DaisyUI
                        </button>

                        <button className="btn btn-link w-30 m-2"
                                onClick={() => window.open("https://spring.io/", "_blank")}>
                            <FontAwesomeIcon icon={faUpRightFromSquare}/>Spring
                        </button>

                        <button className="btn btn-link w-30 m-2"
                                onClick={() => window.open("https://www.mongodb.com/", "_blank")}>
                            <FontAwesomeIcon icon={faUpRightFromSquare}/>Mongo
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
                    Integr
                </p>
                <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
            </aside>
        </footer>
    )
}

export default App
