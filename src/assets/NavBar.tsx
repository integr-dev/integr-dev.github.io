import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars,
    faMagnifyingGlass,
    faPalette
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { useEffect, useState } from "react";

export interface Props {
    searchCallback: (search: string) => void
}

export default function NavBar(props: Props) {
    const [isAtTop, setIsAtTop] = useState(true);

    useEffect(() => {
        const onScroll = () => setIsAtTop(window.scrollY === 0);
        window.addEventListener("scroll", onScroll);
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const onThemeChange = () => {
        const theme = (document.querySelector('input[name="theme-dropdown"]:checked')! as HTMLInputElement).value;
        localStorage.setItem('theme', JSON.stringify(theme));
    }

    useEffect(() => {
        const theme = JSON.parse(localStorage.getItem('theme')!);
        if (theme) {
            (document.querySelector(`input[value="${theme}"]`)! as HTMLInputElement).checked = true;
        }
        const themeControllers = document.querySelectorAll('.theme-controller');
        themeControllers.forEach(controller => {
            controller.addEventListener('change', onThemeChange);
        });

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'k') {
                document.getElementById("search_bar")!.focus();
                e.preventDefault();
            }
            if (e.key === 'Escape') {
                document.getElementById("search_bar")!.blur();
                (document.getElementById("search_bar")! as HTMLInputElement).value = "";
                props.searchCallback("");
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [props]);

    return (
        <>
            <div>
                <div
                    className={`navbar bg-base-100 backdrop-blur fixed z-10 border-b-2 border-b-base-300 h-[4.5rem] transition-all duration-300 ${
                        isAtTop ? "bg-transparent shadow-none" : "bg-opacity-55 border-opacity-55"
                    }`}
                    id="navbar_anchor"
                >
                    <div className="navbar-start">
                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                <FontAwesomeIcon icon={faBars}/>
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[60] mt-5 w-52 p-2 shadow">
                                <li><a onClick={() => scrollToElementWithOffset("technologies")} className="btn btn-sm btn-block btn-ghost justify-start no-animation">Technologies</a></li>
                                <li><a onClick={() => scrollToElementWithOffset("timeline")} className="btn btn-sm btn-block btn-ghost justify-start no-animation">Timeline</a></li>
                                <li><a onClick={() => scrollToElementWithOffset("contact")} className="btn btn-sm btn-block btn-ghost justify-start no-animation">Contact</a></li>
                                <li><a onClick={() => scrollToElementWithOffset("favourites")} className="btn btn-sm btn-block btn-ghost justify-start no-animation">Favourite Stack</a></li>
                                <li><a onClick={() => scrollToElementWithOffset("projects")} className="btn btn-sm btn-block btn-ghost justify-start no-animation">Projects</a></li>
                            </ul>
                        </div>

                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                <FontAwesomeIcon icon={faPalette}/>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[60] mt-10 w-52 p-2 shadow">
                                <li>
                                    <input
                                        type="radio"
                                        name="theme-dropdown"
                                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start no-animation"
                                        aria-label="Sunset"
                                        id="theme-sunset"
                                        value="sunset"
                                    />
                                </li>
                                <li>
                                    <input
                                        type="radio"
                                        name="theme-dropdown"
                                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start no-animation"
                                        aria-label="Cupcake"
                                        value="cupcake"
                                    />
                                </li>
                                <li>
                                <input
                                        type="radio"
                                        name="theme-dropdown"
                                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start no-animation"
                                        aria-label="Night"
                                        value="night"
                                    />
                                </li>
                                <li>
                                    <input
                                        type="radio"
                                        name="theme-dropdown"
                                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start no-animation"
                                        aria-label="Dim"
                                        value="dim"
                                    />
                                </li>
                                <li>
                                    <input
                                        type="radio"
                                        name="theme-dropdown"
                                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start no-animation"
                                        aria-label="Valentine"
                                        value="valentine"
                                    />
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="navbar-center">
                        <label
                            className="bg-opacity-20 cursor-text input input-bordered hidden items-center gap-2 lg:w-96 lg:flex"
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass}/>
                            <input
                                type="text"
                                className="grow"
                                id="search_bar"
                                placeholder="Search"
                                onKeyUp={() => props.searchCallback((document.getElementById("search_bar")! as HTMLInputElement).value)}
                            />
                            <kbd className="kbd kbd-sm select-none cursor-text">ctrl</kbd>
                            <kbd className="kbd kbd-sm select-none cursor-text">k</kbd>
                        </label>
                    </div>

                    <div className="navbar-end">
                        {/* soon<button className="btn btn-ghost btn-circle"
                                onClick={() => window.open("https://github.com/integr-dev", '_blank')!.focus()}>
                            <FontAwesomeIcon icon={faTools} size="xl"/>
                        </button*/}
                        <button className="btn btn-ghost btn-circle"
                                onClick={() => window.open("https://github.com/integr-dev", '_blank')!.focus()}>
                            <FontAwesomeIcon icon={faGithub} size="xl"/>
                        </button>

                    </div>
                </div>
                <div className="progress-bar-before"/>
                <div className="progress-bar"/>
            </div>
        </>
    )
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