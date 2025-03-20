import React, { useState, useEffect } from "react";
import "./App.css";

// Travel packages with images (sourced from Unsplash)
const spacePackages = [
  {
    id: 1,
    name: "Economy Shuttle",
    price: 100000,
    details: "Basic seat in a commercial shuttle.",
    image: "https://source.unsplash.com/featured/?space,shuttle",
  },
  {
    id: 2,
    name: "Luxury Cabin",
    price: 500000,
    details: "Private cabin with Earth-view windows.",
    image: "https://source.unsplash.com/featured/?space,hotel",
  },
  {
    id: 3,
    name: "VIP Zero-Gravity Experience",
    price: 1000000,
    details: "Full VIP suite and zero-g entertainment.",
    image: "https://source.unsplash.com/featured/?space,luxury",
  },
];

// Accommodations with images
const accommodations = [
  {
    id: 1,
    name: "Orbital Station Alpha",
    pricePerNight: 20000,
    details: "Low Earth orbit with stunning sunrise views.",
    image: "https://source.unsplash.com/featured/?space,station",
  },
  {
    id: 2,
    name: "Lunar Hotel Selene",
    pricePerNight: 50000,
    details: "Located on the Moon’s surface with lunar rover tours.",
    image: "https://source.unsplash.com/featured/?moon,hotel",
  },
];

// AI travel tips for demo purposes
const travelTips = [
  "Pack light—extra weight is costly in space travel!",
  "Consider a window seat to watch Earth shrink below you.",
  "Stay hydrated—zero gravity can be dehydrating!",
  "Book early to get the best cabin views!",
];

// Helper: Returns live countdown as a string
function calculateCountdown(launchDate) {
  const now = new Date();
  const distance = new Date(launchDate) - now;
  if (distance < 0) return "Launched!";
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function App() {
  // "home", "booking", or "dashboard"
  const [activeTab, setActiveTab] = useState("home");

  // Booking-related state (persisted in local storage)
  const [bookings, setBookings] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(spacePackages[0].id);
  const [departureDate, setDepartureDate] = useState("");
  const [selectedAccommodation, setSelectedAccommodation] = useState(
    accommodations[0].id
  );
  const [numTravelers, setNumTravelers] = useState(1);
  const [nights, setNights] = useState(1);
  const [showModal, setShowModal] = useState(false);

  // AI tip state
  const [randomTip, setRandomTip] = useState("");

  // On mount, load bookings from local storage
  useEffect(() => {
    const saved = localStorage.getItem("bookings");
    if (saved) {
      setBookings(JSON.parse(saved));
    }
  }, []);

  // Save bookings whenever they change
  useEffect(() => {
    localStorage.setItem("bookings", JSON.stringify(bookings));
  }, [bookings]);

  // Set a random tip & update countdown every second
  useEffect(() => {
    setRandomTip(travelTips[Math.floor(Math.random() * travelTips.length)]);
    const interval = setInterval(() => {
      // Force re-render to update countdowns
      setBookings((prev) => [...prev]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBooking = () => {
    if (!departureDate) {
      alert("Please select a departure date.");
      return;
    }
    const pkg = spacePackages.find((p) => p.id === Number(selectedPackage));
    const accom = accommodations.find(
      (a) => a.id === Number(selectedAccommodation)
    );
    const totalTravelers = parseInt(numTravelers, 10) || 1;
    const totalNights = parseInt(nights, 10) || 1;
    const totalCost =
      pkg.price * totalTravelers + accom.pricePerNight * totalNights * totalTravelers;

    const newBooking = {
      id: Date.now(),
      packageName: pkg.name,
      packagePrice: pkg.price,
      accommodation: accom.name,
      accommodationPrice: accom.pricePerNight,
      departureDate,
      travelers: totalTravelers,
      nights: totalNights,
      totalCost,
    };

    setBookings((prev) => [...prev, newBooking]);
    setShowModal(true);

    // Reset form fields
    setDepartureDate("");
    setSelectedPackage(spacePackages[0].id);
    setSelectedAccommodation(accommodations[0].id);
    setNumTravelers(1);
    setNights(1);
  };

  // Updated: Close modal AND redirect to Dashboard
  const closeModal = () => {
    setShowModal(false);
    setActiveTab("dashboard");
  };

  const handleRefreshTip = () => {
    setRandomTip(travelTips[Math.floor(Math.random() * travelTips.length)]);
  };

  return (
    <div className="app">
      <NavBar setActiveTab={setActiveTab} />
      {activeTab === "home" && (
        <div className="home-container">
          <HeroSection onBookNow={() => setActiveTab("booking")} />
        </div>
      )}
      {activeTab === "booking" && (
        <div className="booking-container">
          <BookingSection
            departureDate={departureDate}
            setDepartureDate={setDepartureDate}
            selectedPackage={selectedPackage}
            setSelectedPackage={setSelectedPackage}
            selectedAccommodation={selectedAccommodation}
            setSelectedAccommodation={setSelectedAccommodation}
            numTravelers={numTravelers}
            setNumTravelers={setNumTravelers}
            nights={nights}
            setNights={setNights}
            handleBooking={handleBooking}
          />
          <button className="btn-back" onClick={() => setActiveTab("home")}>
            Back to Home
          </button>
        </div>
      )}
      {activeTab === "dashboard" && (
        <div className="dashboard-container">
          <DashboardSection bookings={bookings} clearBookings={() => setBookings([])} />
          <AiTipSection tip={randomTip} onRefreshTip={handleRefreshTip} />
          <button className="btn-back" onClick={() => setActiveTab("home")}>
            Back to Home
          </button>
        </div>
      )}
      <Footer />
      {showModal && <BookingConfirmationModal closeModal={closeModal} />}
    </div>
  );
}

// NavBar Component with three tabs
function NavBar({ setActiveTab }) {
  return (
    <nav className="navbar">
      <div className="logo" onClick={() => setActiveTab("home")}>
        DubaiToTheStars
      </div>
      <ul className="nav-links">
        <li>
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("home");
            }}
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="#booking"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("booking");
            }}
          >
            Book
          </a>
        </li>
        <li>
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("dashboard");
            }}
          >
            Dashboard
          </a>
        </li>
      </ul>
    </nav>
  );
}

// Hero Section Component (Home view)
function HeroSection({ onBookNow }) {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <h1>Embark on the Ultimate Space Journey</h1>
        <p>
          Dubai becomes your launchpad to the stars. Experience luxury, adventure,
          and the future of travel.
        </p>
        <button className="btn-hero" onClick={onBookNow}>
          Book Now
        </button>
      </div>
    </section>
  );
}

// Booking Section Component (Booking view)
function BookingSection({
  departureDate,
  setDepartureDate,
  selectedPackage,
  setSelectedPackage,
  selectedAccommodation,
  setSelectedAccommodation,
  numTravelers,
  setNumTravelers,
  nights,
  setNights,
  handleBooking,
}) {
  return (
    <section className="booking-section" id="booking">
      <h2>Book Your Space Trip</h2>
      <div className="form-group">
        <label>Departure Date:</label>
        <input
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Travel Package:</label>
        <select
          value={selectedPackage}
          onChange={(e) => setSelectedPackage(e.target.value)}
        >
          {spacePackages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name} – ${pkg.price.toLocaleString()}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Accommodation:</label>
        <select
          value={selectedAccommodation}
          onChange={(e) => setSelectedAccommodation(e.target.value)}
        >
          {accommodations.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} – ${acc.pricePerNight.toLocaleString()}/night
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Number of Travelers:</label>
        <input
          type="number"
          min="1"
          value={numTravelers}
          onChange={(e) => setNumTravelers(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Nights of Stay:</label>
        <input
          type="number"
          min="1"
          value={nights}
          onChange={(e) => setNights(e.target.value)}
        />
      </div>
      <button className="btn-book" onClick={handleBooking}>
        Book Now
      </button>
    </section>
  );
}

// Dashboard Section Component (Dashboard view)
function DashboardSection({ bookings, clearBookings }) {
  return (
    <section className="dashboard-section" id="dashboard">
      <h2>Your Dashboard</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet. Book your trip above!</p>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-info">
                <h3>{booking.packageName}</h3>
                <p>
                  <strong>Departure:</strong> {booking.departureDate}
                </p>
                <p>
                  <strong>Accommodation:</strong> {booking.accommodation}
                </p>
                <p>
                  <strong>Travelers:</strong> {booking.travelers}
                </p>
                <p>
                  <strong>Nights:</strong> {booking.nights}
                </p>
                <p>
                  <strong>Total Cost:</strong> $
                  {booking.totalCost.toLocaleString()}
                </p>
              </div>
              <div className="booking-countdown">
                <p>{calculateCountdown(booking.departureDate)}</p>
              </div>
            </div>
          ))}
          <button className="btn-clear" onClick={clearBookings}>
            Clear All Bookings
          </button>
        </div>
      )}
    </section>
  );
}

// AI Tip Section Component (Dashboard view)
function AiTipSection({ tip, onRefreshTip }) {
  return (
    <section className="ai-tip-section">
      <h2>AI Travel Tip</h2>
      <p className="tip">{tip}</p>
      <button className="btn-refresh-tip" onClick={onRefreshTip}>
        Get Another Tip
      </button>
    </section>
  );
}

// Modal Component for booking confirmation
function BookingConfirmationModal({ closeModal }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      closeModal();
    }, 3000);
    return () => clearTimeout(timer);
  }, [closeModal]);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Booking Confirmed!</h2>
        <p>Your space journey is booked. Prepare for liftoff!</p>
        <button className="modal-close" onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Dubai to the Stars. All rights reserved.</p>
      <div className="socials">
        <a href="#">
          <img
            src="https://img.icons8.com/ios-glyphs/30/ffffff/facebook-new.png"
            alt="Facebook"
          />
        </a>
        <a href="#">
          <img
            src="https://img.icons8.com/ios-glyphs/30/ffffff/twitter--v1.png"
            alt="Twitter"
          />
        </a>
        <a href="#">
          <img
            src="https://img.icons8.com/ios-glyphs/30/ffffff/instagram-new.png"
            alt="Instagram"
          />
        </a>
      </div>
    </footer>
  );
}

export default App;
