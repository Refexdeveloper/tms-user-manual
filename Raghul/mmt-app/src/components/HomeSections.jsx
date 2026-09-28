import { useState } from "react";
import { collections, destinations, explore, offers, offerTabs, promos } from "../data.js";

export default function HomeSections({ onAppLink }) {
  const [tab, setTab] = useState("ALL");
  const cards = offers[tab] || offers.ALL;

  return (
    <main className="home">
      <section className="explore">
        {explore.map((item) => (
          <article key={item.title} className="exploreCard">
            <img src={item.icon} alt="" />
            <div>
              <h3>
                {item.title}
                {item.isNew && <em>NEW</em>}
              </h3>
              {item.sub && <p>{item.sub}</p>}
            </div>
          </article>
        ))}
      </section>

      <section className="panel">
        <header className="panelHead">
          <h2>Offers</h2>
          <button type="button" className="textLink">VIEW ALL</button>
        </header>
        <div className="chips">
          {offerTabs.map(([key, label]) => (
            <button key={key} type="button" className={tab === key ? "isOn" : ""} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>
        <div className="offerGrid">
          {cards.map((item) => (
            <article key={item.title} className="offerCard">
              <img src={item.img} alt="" />
              <div>
                <span>{item.tag}</span>
                <h3>{item.title}</h3>
                <i />
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Handpicked Collections for You</h2>
        <div className="mediaGrid">
          {collections.map((item) => (
            <article key={item.title} className="mediaCard tall">
              <img src={item.img} alt="" />
              <div>
                <small>{item.kicker}</small>
                <h3>{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Unlock Lesser-Known Wonders of India</h2>
        <div className="mediaGrid">
          {destinations.map((item) => (
            <article key={item.title} className="mediaCard">
              <img src={item.img} alt="" />
              <div>
                <h3>{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>What’s New</h2>
        <div className="promoRow">
          {promos.map((item) => (
            <article key={item.text} className="promoCard">
              <img src={item.img} alt="" />
              <div>
                <p>{item.text}</p>
                <b>Know More</b>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel appPanel">
        <div>
          <h2>Download App Now !</h2>
          <p>Get India's #1 travel super app, join 100 Million+ happy travellers!</p>
          <p className="codeLine">
            Use code <b>WELCOMEMMT</b> and get <b>FLAT 25%</b> OFF* on your first Hotel booking
          </p>
          <div className="appForm">
            <input placeholder="Enter Mobile number" />
            <button type="button" onClick={onAppLink}>GET APP LINK</button>
          </div>
        </div>
        <div className="stores">
          <img src="/assets/app/qr.png" alt="Scan QR" className="qr" />
          <img src="/assets/app/google-play.webp" alt="Google Play" />
          <img src="/assets/app/app-store.webp" alt="App Store" />
        </div>
      </section>

      <footer className="siteFoot">
        <div className="footLinks">
          <h4>MakeMyTrip</h4>
          <p>About Us, Investor Relations, Careers, myBiz for Corporate Travel, Partners- Goibibo</p>
          <h4>About the Site</h4>
          <p>Customer Support, Privacy Policy, User Agreement, Terms of Service</p>
          <h4>Product Offering</h4>
          <p>Flights, Hotels, Homestays and Villas, Holiday Packages, Trains, Buses, Cabs, Forex Card, Travel Insurance</p>
        </div>
        <div className="about">
          <article>
            <h3>Why MakeMyTrip?</h3>
            <p>Established in 2000, MakeMyTrip has since positioned itself as one of the leading companies, providing great offers, competitive airfares, exclusive discounts, and a seamless online booking experience to many of its customers.</p>
          </article>
          <article>
            <h3>Booking Flights with MakeMyTrip</h3>
            <p>At MakeMyTrip, you can find the best of deals and cheap air tickets to any place you want by booking your tickets on our website or app.</p>
          </article>
          <article>
            <h3>Domestic Flights with MakeMyTrip</h3>
            <p>MakeMyTrip is India's leading player for flight bookings. With the cheapest fare guarantee, experience great value at the lowest price.</p>
          </article>
        </div>
        <div className="bottomBar">
          <div className="socials">
            <img src="/assets/icons/soc-instagram.png" alt="Instagram" />
            <img src="/assets/icons/soc-twitter.png" alt="X" />
            <img src="/assets/icons/soc-linkedin.png" alt="LinkedIn" />
            <img src="/assets/icons/soc-facebook.png" alt="Facebook" />
          </div>
          <p>© 2026 MakeMyTrip (India) Limited</p>
        </div>
      </footer>
    </main>
  );
}
