import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import Login from './Login';
import { toast } from 'react-toastify';

const HOME_SECTIONS = {
  ABOUT: 'about',
  PROGRAMS: 'programs',
  EXERCISES: 'exercises',
  PLANS: 'plans',
  CONTACT: 'contact'
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('');
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({ fullName: '', token: '' });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fullName = localStorage.getItem('fullName');

    if (token && fullName) {
      setUserData({ fullName, token });
      setIsLoggedIn(true);
    }

    // Add event listener for login state changes
    const handleLoginStateChange = (event) => {
      const { isLoggedIn, userData } = event.detail;
      setIsLoggedIn(isLoggedIn);
      if (userData) {
        setUserData(userData);
      }
    };

    window.addEventListener('userLoginStateChanged', handleLoginStateChange);

    return () => {
      window.removeEventListener('userLoginStateChanged', handleLoginStateChange);
    };
  }, []);

  // Track scroll position to add background when scrolled
  useEffect(() => {
    const handleScroll = () => {
      // If on homepage, update active section based on scroll position
      if (location.pathname === '/') {
        const sectionsToCheck = [
          HOME_SECTIONS.ABOUT,
          HOME_SECTIONS.PROGRAMS,
          HOME_SECTIONS.EXERCISES,
          HOME_SECTIONS.PLANS,
          HOME_SECTIONS.CONTACT
        ];

        for (const section of sectionsToCheck) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            // Check if section is in viewport (with offset for navbar)
            if (rect.top <= 100 && rect.bottom >= 100) {
              setActiveNavItem(section);
              break;
            }
          }
        }

        // If scrolled to top, set home as active
        if (window.scrollY < 100) {
          setActiveNavItem('home');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Trigger once to set initial state
    handleScroll();

    // Set active nav item based on current path
    const path = location.pathname;

    if (path === '/') {
      // On homepage, set based on hash
      const hash = location.hash.substring(1);
      if (hash) {
        setActiveNavItem(hash);
      } else {
        setActiveNavItem('home');
      }
    }
    else if (path.includes('/exercises')) setActiveNavItem('exercises');
    else if (path === '/profile') setActiveNavItem('mystuff');
    else setActiveNavItem('');

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);

  const handleNavClick = (navItem, path) => {
    setActiveNavItem(navItem);
    setIsMenuOpen(false);

    // If we're on the home page and there's a hash, scroll to the section
    if (location.pathname === '/' && path.startsWith('/#')) {
      const sectionId = path.substring(2);
      const section = document.getElementById(sectionId);

      if (section) {
        // Smooth scroll to the section, taking into account the navbar height
        const yOffset = -80; // Adjust based on your navbar height
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        return;
      }
    }

    // Navigate to homepage with hash if needed
    if (path.startsWith('/#')) {
      navigate('/');
      // We'll let the HomeLayout component handle the scrolling via useEffect
      setTimeout(() => {
        navigate(path);
      }, 100);
      return;
    }

    // Otherwise, navigate to the path
    if (path) navigate(path);
  };

  const handleAuthSuccess = (userData) => {
    setUserData(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('fullName', userData.fullName);
    setIsLoggedIn(true);
  };

  const handleSignIn = (isSignIn) => {
    setIsSignIn(isSignIn);    
    setIsAuthPopupOpen(true);
  }

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.clear();
    
    setIsLoggedIn(false);
    setUserData({});
    setDropdownOpen(false);

    toast.success('Logged out successfully!');
    // Navigate to home if needed
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <header className="fixed top-0 left-0 bg-primary-700 w-full z-50 transition-all duration-300">
      <div className="mx-auto px-4 md:px-20">
        <div className="flex items-center justify-between py-3">
          <Link
            to="/"
            className="text-2xl font-bold"
            onClick={() => setActiveNavItem('home')}
          >
            <span className="text-primary-400">Daily</span>
            <span className="text-white">Physio</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            {isLoggedIn ? (
              // Navigation for logged-in users
              <>
                <Link
                  to="/"
                  className={`font-semibold transition-colors border-b-2 pb-1 ${activeNavItem === 'home' ? 'border-primary-400 text-white' : 'text-primary-100 border-transparent hover:border-primary-200'}`}
                >
                  Home
                </Link>
                <Link
                  to="/exercises"
                  className={`font-semibold transition-colors border-b-2 pb-1 ${activeNavItem === 'exercises' ? 'border-primary-400 text-white' : 'text-primary-100 border-transparent hover:border-primary-200'}`}
                >
                  Exercises
                </Link>
                <Link
                  to="/profile"
                  className={`font-semibold transition-colors border-b-2 pb-1 ${activeNavItem === 'mystuff' ? 'border-primary-400 text-white' : 'text-primary-100 border-transparent hover:border-primary-200'}`}
                >
                  My Stuff
                </Link>
              </>
            ) : (
              // Navigation for non-logged-in users
              <>
                <button
                  onClick={() => handleNavClick(HOME_SECTIONS.ABOUT, `/#${HOME_SECTIONS.ABOUT}`)}
                  className={`text-white transition-colors border-b-2 pb-1 ${activeNavItem === HOME_SECTIONS.ABOUT ? 'border-primary-200 text-primary-400' : 'border-transparent hover:border-primary-400'}`}
                >
                  About
                </button>
                <button
                  onClick={() => handleNavClick(HOME_SECTIONS.PROGRAMS, `/#${HOME_SECTIONS.PROGRAMS}`)}
                  className={`text-white transition-colors border-b-2 pb-1 ${activeNavItem === HOME_SECTIONS.PROGRAMS ? 'border-primary-200 text-primary-400' : 'border-transparent hover:border-primary-400'}`}
                >
                  Programs
                </button>
                <button
                  onClick={() => handleNavClick(HOME_SECTIONS.EXERCISES, `/#${HOME_SECTIONS.EXERCISES}`)}
                  className={`text-white transition-colors border-b-2 pb-1 ${activeNavItem === HOME_SECTIONS.EXERCISES ? 'border-primary-200 text-primary-400' : 'border-transparent hover:border-primary-400'}`}
                >
                  Exercises
                </button>
                <button
                  onClick={() => handleNavClick(HOME_SECTIONS.PLANS, `/#${HOME_SECTIONS.PLANS}`)}
                  className={`text-white transition-colors border-b-2 pb-1 ${activeNavItem === HOME_SECTIONS.PLANS ? 'border-primary-200 text-primary-400' : 'border-transparent hover:border-primary-400'}`}
                >
                  Plans
                </button>
                <button
                  onClick={() => handleNavClick(HOME_SECTIONS.CONTACT, `/#${HOME_SECTIONS.CONTACT}`)}
                  className={`text-white transition-colors border-b-2 pb-1 ${activeNavItem === HOME_SECTIONS.CONTACT ? 'border-primary-200 text-primary-400' : 'border-transparent hover:border-primary-400'}`}
                >
                  Contact
                </button>
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative group">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md hover:text-white text-primary-50 transition-colors border hover:border-white border-primary-100 shadow-sm hover:shadow-white"
                >
                  <User size={18} />
                  <span className="font-medium">{userData.fullName || 'Profile'}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-4 w-48 rounded-md shadow-lg bg-primary-700 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-primary-800 flex items-center"
                      >
                        <User className="mr-2" size={16} />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-primary-800 flex items-center"
                      >
                        <LogOut className="mr-2" size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleSignIn(true)}
                  className="px-4 py-2 rounded-md text-white transition-colors hover:bg-primary-600 border border-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleSignIn(false)}
                  className="px-4 py-2 bg-white hover:bg-primary-50 rounded-md text-primary-500 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white text-black">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-4 py-4">
              {isLoggedIn ? (
                // Mobile Navigation for logged-in users
                <>
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className={`py-2 transition-colors ${activeNavItem === 'home' ? 'bg-primary-100 text-primary-900 px-3 rounded' : 'hover:bg-primary-50 px-3 rounded'}`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/exercises"
                    onClick={() => setIsMenuOpen(false)}
                    className={`py-2 transition-colors ${activeNavItem === 'exercises' ? 'bg-primary-100 text-primary-900 px-3 rounded' : 'hover:bg-primary-50 px-3 rounded'}`}
                  >
                    Exercises
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className={`py-2 transition-colors ${activeNavItem === 'mystuff' ? 'bg-primary-100 text-primary-900 px-3 rounded' : 'hover:bg-primary-50 px-3 rounded'}`}
                  >
                    My Stuff
                  </Link>
                  <div className="pt-4 border-t border-gray-800">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-3 py-2 hover:bg-primary-50 rounded"
                    >
                      <User className="mr-2" size={16} />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 hover:bg-primary-50 rounded mt-2 text-left"
                    >
                      <LogOut className="mr-2" size={16} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                // Mobile Navigation for non-logged-in users
                <>
                  <button
                    onClick={() => handleNavClick(HOME_SECTIONS.ABOUT, `/#${HOME_SECTIONS.ABOUT}`)}
                    className={`py-2 transition-colors ${activeNavItem === HOME_SECTIONS.ABOUT ? 'bg-primary-900/30 text-primary-400 px-3 rounded' : 'hover:bg-primary-100 px-3 rounded'}`}
                  >
                    About
                  </button>
                  <button
                    onClick={() => handleNavClick(HOME_SECTIONS.PROGRAMS, `/#${HOME_SECTIONS.PROGRAMS}`)}
                    className={`py-2 transition-colors ${activeNavItem === HOME_SECTIONS.PROGRAMS ? 'bg-primary-900/30 text-primary-400 px-3 rounded' : 'hover:bg-primary-100 px-3 rounded'}`}
                  >
                    Programs
                  </button>
                  <button
                    onClick={() => handleNavClick('exercises', '/exercises')}
                    className={`py-2 transition-colors ${activeNavItem === 'exercises' ? 'bg-primary-900/30 text-primary-400 px-3 rounded' : 'hover:bg-primary-100 px-3 rounded'}`}
                  >
                    Exercises
                  </button>
                  <button
                    onClick={() => handleNavClick(HOME_SECTIONS.PLANS, `/#${HOME_SECTIONS.PLANS}`)}
                    className={`py-2 transition-colors ${activeNavItem === HOME_SECTIONS.PLANS ? 'bg-primary-900/30 text-primary-400 px-3 rounded' : 'hover:bg-primary-100 px-3 rounded'}`}
                  >
                    Plans
                  </button>
                  <button
                    onClick={() => handleNavClick(HOME_SECTIONS.CONTACT, `/#${HOME_SECTIONS.CONTACT}`)}
                    className={`py-2 transition-colors ${activeNavItem === HOME_SECTIONS.CONTACT ? 'bg-primary-900/30 text-primary-400 px-3 rounded' : 'hover:bg-primary-100 px-3 rounded'}`}
                  >
                    Contact
                  </button>
                  <div className="flex space-x-4 pt-4 border-t border-gray-800">
                    <button
                      onClick={() => handleSignIn(true)}
                      className="flex-1 px-4 py-2 text-primary-700 rounded-md transition-colors border border-primary-700 hover:border-primary-500"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleSignIn(false)}
                      className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
      <Login
        isOpen={isAuthPopupOpen}
        isSignIn={isSignIn}
        onChange={setIsSignIn}
        onClose={() => setIsAuthPopupOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </header>
  );
};


export default Navbar; 