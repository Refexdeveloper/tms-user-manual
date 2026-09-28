import { useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import SearchWidget from "./components/SearchWidget.jsx";
import HomeSections from "./components/HomeSections.jsx";
import { products } from "./data.js";

export default function App() {
  const [tab, setTab] = useState("flights");
  const [toast, setToast] = useState("");
  const product = useMemo(() => products.find((p) => p.id === tab) || products[0], [tab]);

  function ping(message) {
    setToast(message);
    window.clearTimeout(ping._t);
    ping._t = window.setTimeout(() => setToast(""), 2200);
  }

  return (
    <div className="page">
      <div className="hero">
        <Header onLogin={() => ping("Login UI only — no account is created.")} />
        <div className="heroStage">
          <nav className="productNav" aria-label="Products">
            {products.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`productItem${tab === item.id ? " isActive" : ""}`}
                onClick={() => setTab(item.id)}
              >
                {item.isNew && <span className="newTag">new</span>}
                <span className="productIcon">
                  <span className="productGlow" aria-hidden="true" />
                  <span className="productShine" aria-hidden="true" />
                  <img src={item.icon} alt="" />
                </span>
                <span className="productLabel">{item.label}</span>
              </button>
            ))}
          </nav>
          <SearchWidget product={product} onSearch={() => ping("UI clone only — search is not connected to live booking.")} />
        </div>
      </div>
      <HomeSections onAppLink={() => ping("App link UI only — no SMS is sent.")} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
