import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import assest, { assets } from '../assets/assets.js'
import { useClerk, useUser, UserButton } from '@clerk/clerk-react';

const BookIcon = () => { assest.addIcon }
const Navbar = () => {
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Hotels', path: '/rooms' },
        { name: 'Experience', path: '/' },
        { name: 'About', path: '/' },
        { name: 'Food Order', path: 'https://food-delivery-mu-mauve.vercel.app/' },
    ];

    const ref = React.useRef(null)

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { openSignIn } = useClerk();
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {
             if(location.pathname !=='/'){
                setIsScrolled(true);
                return
             }else{
                setIsScrolled(false);
             }
             setIsScrolled(prev=> location.pathname !=='/' ? true: prev);

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname]);

    return (


        <nav className={`fixed h-20 top-0 left-0 bg-black/50 shadow-md backdrop-blur-lg  w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 
        transition-all duration-500 z-50 ${isScrolled ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4" : "py-4 md:py-6"}`}>

            {/* Logo */}
            <Link to='/'>
                <img src={assets.pavan} alt="logo" className={`h-18 w-40 ${isScrolled && "invert opacity-80"}`} />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8">
                {navLinks.map((link, i) => (
                    <a key={i} href={link.path} className={`group flex flex-col gap-0.5 ${isScrolled ? "text-gray-700" : "text-white"}`}>
                        {link.name}
                        <div className={`${isScrolled ? "bg-gray-700" : "bg-white"} h-0.5 w-0 group-hover:w-full transition-all duration-300`} />
                    </a>
                ))}
                <button className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${isScrolled ? 'text-black' : 'text-white'} transition-all`} onClick={()=>navigate('/owner')}>
                    Dashboard
                </button>
            </div>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-4">
                <img src={assest.searchIcon} alt="search" className={`${isScrolled && 'invert'} h-8 transition-all duration-500`} />

                {/* Turnerry operator */}
                {user ?
                    (<UserButton>
                        <UserButton.MenuItems>
                            <UserButton.Action label='My Booking' labelIcon={<BookIcon />} onClick={() => navigate('/my-bookings')} />
                        </UserButton.MenuItems>
                    </UserButton>)
                    :
                    (<button onClick={openSignIn} className={`px-8 py-2.5 rounded-full ml-4
                     transition-all duration-500 
                     ${isScrolled ? "text-white bg-black" : "bg-white text-black"}`}>
                        Login
                    </button>
                    )
                }


            </div>

            {/* Mobile Menu Button */}

            <div className="flex items-center gap-3 md:hidden">
            
             {user &&
                <UserButton>
                    <UserButton.MenuItems>
                        <UserButton.Action label='My Booking' labelIcon={<BookIcon />} onClick={() => navigate('/my-bookings')} />
                    </UserButton.MenuItems>
                </UserButton>
            }

                <img onClick={() => setIsMenuOpen(!isMenuOpen)} src={assets.menuIcon} alt="menu" className={`${isScrolled && 'invert'} h-4`} />
            </div>

            {/* Mobile Menu */}
            <div className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)}>
                    <img src={assest.closeIcon} alt="close-menu" className='h-6.5' />
                </button>

                {navLinks.map((link, i) => (
                    <a key={i} href={link.path} onClick={() => setIsMenuOpen(false)}>
                        {link.name}
                    </a>
                ))}

              {user &&  <button className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all" onClick={()=>navigate('/owner')}>
                    Dashboard
                </button>}

               {!user && <button onClick={openSignIn} className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500">
                    Login
                </button>}
            </div>
        </nav>

    );
}

export default Navbar;
