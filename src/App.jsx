import './App.css'
import { Routes, Route, useLocation } from "react-router-dom";

const allPages = import.meta.glob('./users/*/*/index.jsx', { eager: true });

function getUserType(pathname) {
    const match = pathname.match(/^\/([^/]+)/);
    return match ? match[1].toLowerCase() : null;
}

function App() {
    const location = useLocation();
    const currentUser = getUserType(location.pathname);

    // Filter pages for the current user
    const pages = Object.entries(allPages)
        .filter(([path]) => path.startsWith(`./users/${currentUser}/`));

    return (
        <>
            <div className="signout-icon" title="Sign Out">
                <img src="/icons/logout_icon.png" alt="Sign Out" />
            </div>
            <img src="/images/School1.jpg" alt="background" className="background" />
            <div className="slip">
                <img src="/images/School1.jpg" alt="headerPicture" className="headerPicture" />
                <img src="/images/MMCL_Logo_Horizontal.webp" alt="longLogo" className="longLogo" />
                <nav className="navBar">
                    <ul>
                        {
                            pages.map(([path]) => {
                                const name = path
                                    .replace(`./users/${currentUser}/`, "")
                                    .replace("/index.jsx", "");

                                return (
                                    <li key={name}>
                                        <img src={`/icons/${name}.png`} />
                                        <a href={`/${currentUser}/${name}`}>
                                            {name
                                                .replace(/([a-z])([A-Z])/g, '$1 $2')
                                                .replace(/^./, str => str.toUpperCase())
                                            }
                                        </a>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </nav>
                <div className="content-wrapper">
                    <div className="content-border">
                        <div className="content">
                            <Routes>
                                {pages.map(([path, module]) => {
                                    const name = path
                                        .replace(`./users/${currentUser}/`, "")
                                        .replace("/index.jsx", "")
                                        .toLowerCase();

                                    return (
                                        <Route
                                            key={name}
                                            path={name === "home" ? `/${currentUser}` : `/${currentUser}/${name}`}
                                            element={module.default ? <module.default /> : null}
                                        />
                                    );
                                })}
                            </Routes>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default App
