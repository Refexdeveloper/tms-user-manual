export default function Header({ onLogin }) {
  return (
    <header className="topBar">
      <a className="brand" href="/">
        <img src="/assets/logos/mmt-logo.png" alt="Make My Trip" />
      </a>
      <ul className="quickRow">
        <li className="quickTile">
          <span className="quickIcon">
            <img src="/assets/icons/hdr-property.png" alt="" />
          </span>
          <span>
            <b>List Your Property</b>
            <small>Grow your business!</small>
          </span>
        </li>
        <li className="quickTile mybizTile">
          <img className="mybizLogo" src="/assets/logos/mybiz.png" alt="myBiz" />
          <span>
            <b>Introducing myBiz</b>
            <small>Business Travel Solution</small>
          </span>
        </li>
        <li className="quickTile">
          <span className="quickIcon">
            <img src="/assets/icons/hdr-trips.png" alt="" />
          </span>
          <span>
            <b>My Trips</b>
            <small>Manage your bookings</small>
          </span>
        </li>
        <li className="quickTile">
          <span className="quickIcon">
            <img src="/assets/icons/hdr-wishlist.png" alt="" />
          </span>
          <span>
            <b>Wishlist</b>
            <small>Save favourites</small>
          </span>
        </li>
        <li>
          <button type="button" className="loginBtn" onClick={onLogin}>
            <span className="loginAvatar">
              <img src="/assets/icons/hdr-login.png" alt="" />
            </span>
            Login or Create Account
          </button>
        </li>
        <li className="localeChip">
          <img src="/assets/icons/flag-in.png" alt="" />
          IN | ENG | INR
        </li>
      </ul>
    </header>
  );
}
