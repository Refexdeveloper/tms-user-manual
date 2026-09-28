import { useMemo, useState } from "react";
import { airports } from "../data.js";

function pretty(d) {
  return `${d.getDate()} ${d.toLocaleDateString("en-IN", { month: "short" })}'${String(d.getFullYear()).slice(2)}`;
}
function weekday(d) {
  return d.toLocaleDateString("en-IN", { weekday: "long" });
}

export default function SearchWidget({ product, onSearch }) {
  const dates = useMemo(() => {
    const depart = new Date();
    depart.setDate(depart.getDate() + 1);
    const ret = new Date(depart);
    ret.setDate(ret.getDate() + 3);
    return { depart, ret };
  }, []);

  const [trip, setTrip] = useState("oneway");
  const [from, setFrom] = useState(airports[0]);
  const [to, setTo] = useState(airports[1]);
  const [open, setOpen] = useState(null);
  const [fare, setFare] = useState("Regular");
  const isFlight = product.id === "flights";

  function pick(side, city) {
    if (side === "from") setFrom(city);
    else setTo(city);
    setOpen(null);
  }

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <section className="searchCard">
      <div className="tripRow" style={{ visibility: isFlight ? "visible" : "hidden" }}>
        {["oneway", "round", "multi"].map((value) => (
          <label key={value} className={trip === value ? "isOn" : ""}>
            <input type="radio" name="trip" checked={trip === value} onChange={() => setTrip(value)} />
            {value === "oneway" ? "One Way" : value === "round" ? "Round Trip" : "Multi City"}
          </label>
        ))}
        <p className="searchHint">{product.hint}</p>
      </div>

      <div className="fields">
        <Field label="From" value={from.city} sub={from.code} active={open === "from"} onClick={() => setOpen(open === "from" ? null : "from")}>
          {open === "from" && <Suggest onPick={(city) => pick("from", city)} />}
        </Field>
        <button type="button" className="swap" onClick={swap} title="Swap">⇄</button>
        <Field label="To" value={to.city} sub={to.code} active={open === "to"} onClick={() => setOpen(open === "to" ? null : "to")}>
          {open === "to" && <Suggest onPick={(city) => pick("to", city)} />}
        </Field>
        <Field label="Departure" value={pretty(dates.depart)} sub={weekday(dates.depart)} />
        <Field
          label="Return"
          value={trip === "round" ? pretty(dates.ret) : "Tap to add a return date"}
          sub={trip === "round" ? weekday(dates.ret) : "For bigger discounts"}
          muted={trip !== "round"}
          onClick={() => setTrip("round")}
        />
        <Field label="Travellers & Class" value="1 Traveller" sub="Economy/Premium Economy" last />
      </div>

      {isFlight && (
        <div className="fares">
          <span>Select A Fare Type:</span>
          {["Regular", "Student", "Senior Citizen", "Armed Forces", "Doctor and Nurses"].map((name) => (
            <label key={name} className={fare === name ? "isOn" : ""}>
              <input type="radio" name="fare" checked={fare === name} onChange={() => setFare(name)} />
              <b>{name}</b>
            </label>
          ))}
        </div>
      )}

      <button type="button" className="searchBtn" onClick={onSearch}>SEARCH</button>
    </section>
  );
}

function Field({ label, value, sub, last, muted, active, onClick, children }) {
  return (
    <div className={`field${last ? " last" : ""}${active ? " isOpen" : ""}`} onClick={onClick} role={onClick ? "button" : undefined}>
      <span>{label}</span>
      <strong className={muted ? "muted" : ""}>{value}</strong>
      <small>{sub}</small>
      {children}
    </div>
  );
}

function Suggest({ onPick }) {
  return (
    <ul className="suggest">
      {airports.map((city) => (
        <li key={city.city} onClick={(e) => { e.stopPropagation(); onPick(city); }}>
          <b>{city.city}</b>
          <small>{city.code}</small>
        </li>
      ))}
    </ul>
  );
}
