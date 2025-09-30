import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars,
    faBook, faBoxesStacked, faClock,
    faCode, faFolder,
    faMagnifyingGlass,
    faPalette
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export interface Props {
    searchCallback: (search: string) => void
}

export default function NavBar(props: Props) {
    const onThemeChange = () => {
        const theme = (document.querySelector('input[name="theme-dropdown"]:checked')! as HTMLInputElement).value;
        localStorage.setItem('theme', JSON.stringify(theme));
    }

    onload = () => {
        const theme = JSON.parse(localStorage.getItem('theme')!);
        if (theme) {
            (document.querySelector(`input[value="${theme}"]`)! as HTMLInputElement).checked = true;
        }
        const themeControllers = document.querySelectorAll('.theme-controller');
        themeControllers.forEach(controller => {
            controller.addEventListener('change', onThemeChange);
        });
    }

    onkeydown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'k') {
            document.getElementById("search_bar")!.focus();
            e.preventDefault();
        }

        if (e.key === 'Escape') {
            document.getElementById("search_bar")!.blur();
            (document.getElementById("search_bar")! as HTMLInputElement).value = "";
            props.searchCallback("");
        }
    }

    return (
        <>
            <div>
                <div className="navbar bg-base-100 fixed z-10 border-b-2 border-b-base-300 h-[4.5rem]" id="navbar_anchor">
                    <div className="navbar-start">
                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                <FontAwesomeIcon icon={faBars}/>
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                                <li><a onClick={() => scrollToElementWithOffset("skills")} className="btn btn-sm btn-block btn-ghost justify-start"><FontAwesomeIcon icon={faCode}/>Skills</a></li>
                                <li><a onClick={() => scrollToElementWithOffset("libraries")} className="btn btn-sm btn-block btn-ghost justify-start"><FontAwesomeIcon icon={faBook}/>Libraries</a></li>
                                <li><a onClick={() => scrollToElementWithOffset("timeline")} className="btn btn-sm btn-block btn-ghost justify-start"><FontAwesomeIcon icon={faClock}/>Timeline</a></li>
                                <li><a onClick={() => scrollToElementWithOffset("favourites")} className="btn btn-sm btn-block btn-ghost justify-start"><FontAwesomeIcon icon={faBoxesStacked}/>Favourite Stack</a></li>
                                <li><a onClick={() => scrollToElementWithOffset("repos")} className="btn btn-sm btn-block btn-ghost justify-start"><FontAwesomeIcon icon={faFolder}/>Repositories</a></li>
                            </ul>
                        </div>

                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                <FontAwesomeIcon icon={faPalette}/>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                                <li>
                                    <input
                                        type="radio"
                                        name="theme-dropdown"
                                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                                        aria-label="Sunset"
                                        value="sunset"
                                    />
                                </li>
                                <li>
                                    <input
                                        type="radio"
                                        name="theme-dropdown"
                                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                                        aria-label="Cupcake"
                                        value="cupcake"
                                    />
                                </li>
                                <li>
                                    <input
                                        type="radio"
                                        name="theme-dropdown"
                                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                                        aria-label="Night"
                                        value="night"
                                    />
                                </li>
                                <li>
                                    <input
                                        type="radio"
                                        name="theme-dropdown"
                                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                                        aria-label="Dim"
                                        value="dim"
                                    />
                                </li>
                                <li>
                                    <input
                                        type="radio"
                                        name="theme-dropdown"
                                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                                        aria-label="Valentine"
                                        value="valentine"
                                    />
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="navbar-center">
                        <label
                            className="cursor-text input input-bordered hidden items-center gap-2 lg:w-96 lg:flex"
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
                        <button className="btn btn-ghost btn-circle"
                                onClick={() => window.open("https://github.com/integr-dev", '_blank')!.focus()}>
                            <FontAwesomeIcon icon={faGithub} size="xl"/>
                        </button>
                    </div>
                </div>
                <div className="progress-bar-before" />
                <div className="progress-bar" />
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